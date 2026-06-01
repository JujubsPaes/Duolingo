import { APIGatewayProxyHandler } from "aws-lambda";
import {
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent, parseBody } from "../../lib/auth";
import { ok, badRequest, notFound, serverError } from "../../lib/response";
import { ExerciseRecord, LessonRecord, ProgressRecord, UserRecord } from "../../types";

// Regras de negócio de XP
const XP_BASE = 10;
const XP_BONUS_HIGH_SCORE = 5;   // bônus se acerto > 90%
const XP_BONUS_STREAK_7 = 500;   // bônus a cada 7 dias de streak
const MIN_PASS_RATE = 0.7;        // 70% mínimo para passar

interface CompleteLessonBody {
  answers: Record<string, string>; // { exerciseId: answerId }
}

/**
 * Calcula o nível do usuário com base no XP total.
 * Tabela: N1 (0–1000), N2 (1001–2500), N3 (2501–5000), N4 (5001–10000), N5 (10001+)
 */
function calculateLevel(xp: number): number {
  if (xp <= 1000) return 1;
  if (xp <= 2500) return 2;
  if (xp <= 5000) return 3;
  if (xp <= 10000) return 4;
  return 5;
}

/**
 * Verifica se o usuário estudou hoje e atualiza o streak.
 * Retorna o novo valor de streak.
 */
function calculateStreak(lastStudyDate: string | undefined, currentStreak: number): number {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (!lastStudyDate) return 1; // primeiro estudo

  const last = new Date(lastStudyDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak; // já estudou hoje, mantém
  if (diffDays === 1) return currentStreak + 1; // dia seguinte, incrementa
  return 1; // mais de 1 dia sem estudar, reseta
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;
    const lessonId = event.pathParameters?.id;

    if (!lessonId) return notFound("ID da lição não informado.");

    const body = parseBody<CompleteLessonBody>(event);
    if (!body?.answers || Object.keys(body.answers).length === 0) {
      return badRequest("Respostas são obrigatórias.");
    }

    // 1. Busca todos os exercícios da lição com as respostas corretas
    const exercisesResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `LESSON#${lessonId}`,
          ":sk": "EXERCISE#",
        },
      })
    );

    const exercises = (exercisesResult.Items ?? []) as ExerciseRecord[];
    if (exercises.length === 0) return notFound("Exercícios não encontrados.");

    // 2. Corrige as respostas
    let correctCount = 0;
    const wrongExercises: string[] = [];

    for (const exercise of exercises) {
      const userAnswer = body.answers[exercise.exerciseId];
      if (userAnswer === exercise.correctAnswerId) {
        correctCount++;
      } else {
        wrongExercises.push(exercise.exerciseId);
      }
    }

    const totalCount = exercises.length;
    const accuracy = correctCount / totalCount;
    const passed = accuracy >= MIN_PASS_RATE;

    // 3. Registra erros recorrentes para revisão inteligente
    const now = new Date().toISOString();
    for (const exerciseId of wrongExercises) {
      const errorKey = Keys.error(userId, exerciseId);
      const existing = await dynamo.send(
        new GetCommand({ TableName: TABLE_NAME, Key: errorKey })
      );

      if (existing.Item) {
        // Incrementa o contador de erros
        await dynamo.send(
          new UpdateCommand({
            TableName: TABLE_NAME,
            Key: errorKey,
            UpdateExpression:
              "SET errorCount = errorCount + :inc, totalAttempts = totalAttempts + :inc, lastErrorAt = :now",
            ExpressionAttributeValues: { ":inc": 1, ":now": now },
          })
        );
      } else {
        // Cria o registro de erro
        const exercise = exercises.find((e) => e.exerciseId === exerciseId)!;
        await dynamo.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: {
              ...errorKey,
              userId,
              exerciseId,
              lessonId: exercise.lessonId,
              errorCount: 1,
              totalAttempts: 1,
              lastErrorAt: now,
            },
          })
        );
      }
    }

    // Se não passou, retorna sem atualizar progresso
    if (!passed) {
      return ok({
        passed: false,
        correctCount,
        wrongCount: totalCount - correctCount,
        xpEarned: 0,
        message: `Você acertou ${correctCount}/${totalCount}. Precisa de ${Math.ceil(MIN_PASS_RATE * 100)}% para passar.`,
      });
    }

    // 4. Calcula XP ganho
    const userResult = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.user(userId) })
    );
    const user = userResult.Item as UserRecord;

    const newStreak = calculateStreak(user.lastStudyDate, user.streak);
    let xpEarned = XP_BASE;
    if (accuracy > 0.9) xpEarned += XP_BONUS_HIGH_SCORE;
    if (newStreak % 7 === 0) xpEarned += XP_BONUS_STREAK_7;

    const newXP = user.xp + xpEarned;
    const newLevel = calculateLevel(newXP);
    const today = new Date().toISOString().split("T")[0];

    // 5. Atualiza o perfil do usuário (XP, nível, streak)
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.user(userId),
        UpdateExpression:
          "SET xp = :xp, #level = :level, streak = :streak, lastStudyDate = :today",
        ExpressionAttributeNames: { "#level": "level" },
        ExpressionAttributeValues: {
          ":xp": newXP,
          ":level": newLevel,
          ":streak": newStreak,
          ":today": today,
        },
      })
    );

    // 6. Salva no histórico de lições
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...Keys.history(userId, now),
          userId,
          lessonId,
          completedAt: now,
          correctAnswers: correctCount,
          wrongAnswers: totalCount - correctCount,
          xpEarned,
        },
      })
    );

    // 7. Busca a lição para encontrar a próxima
    const lessonResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: { ":sk": `LESSON#${lessonId}` },
        Limit: 1,
      })
    );

    let nextLessonId: string | undefined;
    if (lessonResult.Items && lessonResult.Items.length > 0) {
      const currentLesson = lessonResult.Items[0] as LessonRecord;

      // Busca a próxima lição do mesmo módulo (order + 1)
      const nextLessonsResult = await dynamo.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
          FilterExpression: "#order = :nextOrder",
          ExpressionAttributeNames: { "#order": "order" },
          ExpressionAttributeValues: {
            ":pk": `MODULE#${currentLesson.moduleId}`,
            ":sk": "LESSON#",
            ":nextOrder": currentLesson.order + 1,
          },
        })
      );

      if (nextLessonsResult.Items && nextLessonsResult.Items.length > 0) {
        nextLessonId = (nextLessonsResult.Items[0] as LessonRecord).lessonId;
      }
    }

    // 8. Verifica e desbloqueia conquistas (passa accuracy e lessonId para checar módulo/curso)
    await checkAndUnlockAchievements(userId, newStreak, newXP, accuracy, lessonId, now);

    return ok({
      passed: true,
      correctCount,
      wrongCount: totalCount - correctCount,
      xpEarned,
      newXP,
      newLevel,
      newStreak,
      nextLessonId,
    });
  } catch (err) {
    console.error("completeLesson error:", err);
    return serverError("Erro ao concluir lição.");
  }
};

/**
 * Verifica e desbloqueia conquistas automaticamente após completar uma lição.
 *
 * Conquistas suportadas:
 * - "first-lesson"     → ao concluir a primeira lição
 * - "streak-7"         → ao atingir 7 dias de streak (semana perfeita)
 * - "perfect-score"    → ao acertar 100% em uma lição (pode repetir)
 * - "module-complete"  → ao concluir todas as lições de um módulo
 * - "course-complete"  → ao concluir um curso inteiro
 */
async function checkAndUnlockAchievements(
  userId: string,
  streak: number,
  xp: number,
  accuracy: number,
  lessonId: string,
  now: string
): Promise<void> {
  // --- Conquista: Primeira Lição ---
  await unlockIfEligible(userId, "first-lesson", xp >= XP_BASE, now);

  // --- Conquista: Semana Perfeita (streak >= 7) ---
  await unlockIfEligible(userId, "streak-7", streak >= 7, now);

  // --- Conquista: Nota Máxima (100% de acerto) ---
  // Esta conquista pode ser obtida múltiplas vezes, então sempre registra
  if (accuracy === 1) {
    await unlockRepeatable(userId, "perfect-score", now);
  }

  // --- Conquista: Módulo Completo ---
  await checkModuleComplete(userId, lessonId, now);

  // --- Conquista: Curso Completo ---
  await checkCourseComplete(userId, lessonId, now);
}

/**
 * Desbloqueia uma conquista se a condição for verdadeira e ainda não foi desbloqueada.
 */
async function unlockIfEligible(
  userId: string,
  achievementId: string,
  condition: boolean,
  now: string
): Promise<void> {
  if (!condition) return;

  const key = Keys.achievement(userId, achievementId);
  const existing = await dynamo.send(
    new GetCommand({ TableName: TABLE_NAME, Key: key })
  );

  // Só desbloqueia se ainda não foi desbloqueado
  if (!existing.Item?.unlocked) {
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: "SET unlocked = :true, unlockedAt = :now",
        ExpressionAttributeValues: { ":true": true, ":now": now },
      })
    );
  }
}

/**
 * Registra uma conquista repetível (ex: nota máxima).
 * Sempre marca como unlocked e atualiza a data para a mais recente.
 * Incrementa um contador de vezes obtida.
 */
async function unlockRepeatable(
  userId: string,
  achievementId: string,
  now: string
): Promise<void> {
  const key = Keys.achievement(userId, achievementId);

  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: key,
      UpdateExpression:
        "SET unlocked = :true, unlockedAt = :now, timesEarned = if_not_exists(timesEarned, :zero) + :inc",
      ExpressionAttributeValues: {
        ":true": true,
        ":now": now,
        ":zero": 0,
        ":inc": 1,
      },
    })
  );
}

/**
 * Verifica se todas as lições do módulo da lição concluída foram completadas.
 * Se sim, desbloqueia a conquista "module-complete".
 */
async function checkModuleComplete(
  userId: string,
  lessonId: string,
  now: string
): Promise<void> {
  // 1. Descobre a qual módulo pertence a lição (via GSI1)
  const lessonLookup = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: { ":sk": `LESSON#${lessonId}` },
      Limit: 1,
    })
  );

  if (!lessonLookup.Items || lessonLookup.Items.length === 0) return;
  const currentLesson = lessonLookup.Items[0] as LessonRecord;
  const moduleId = currentLesson.moduleId;

  // 2. Busca todas as lições do módulo
  const moduleLessons = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `MODULE#${moduleId}`,
        ":sk": "LESSON#",
      },
    })
  );

  const allLessons = (moduleLessons.Items ?? []) as LessonRecord[];
  if (allLessons.length === 0) return;

  // 3. Verifica se todas as lições do módulo estão no histórico do usuário
  const historyResult = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "HISTORY#",
      },
    })
  );

  const completedLessonIds = new Set(
    (historyResult.Items ?? []).map((h: any) => h.lessonId)
  );

  // Verifica se TODAS as lições do módulo foram concluídas
  const allCompleted = allLessons.every((l) => completedLessonIds.has(l.lessonId));

  if (allCompleted) {
    await unlockRepeatable(userId, "module-complete", now);
  }
}

/**
 * Verifica se todas as lições de todos os módulos do curso foram completadas.
 * Se sim, desbloqueia a conquista "course-complete".
 */
async function checkCourseComplete(
  userId: string,
  lessonId: string,
  now: string
): Promise<void> {
  // 1. Descobre a qual módulo pertence a lição
  const lessonLookup = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: { ":sk": `LESSON#${lessonId}` },
      Limit: 1,
    })
  );

  if (!lessonLookup.Items || lessonLookup.Items.length === 0) return;
  const currentLesson = lessonLookup.Items[0] as LessonRecord;
  const moduleId = currentLesson.moduleId;

  // 2. Descobre o curso do módulo (via GSI1 no módulo)
  const moduleLookup = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "SK = :sk",
      ExpressionAttributeValues: { ":sk": `MODULE#${moduleId}` },
      Limit: 1,
    })
  );

  if (!moduleLookup.Items || moduleLookup.Items.length === 0) return;
  const courseId = (moduleLookup.Items[0] as any).courseId;

  // 3. Busca todos os módulos do curso
  const courseModules = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `COURSE#${courseId}`,
        ":sk": "MODULE#",
      },
    })
  );

  const modules = (courseModules.Items ?? []) as any[];
  if (modules.length === 0) return;

  // 4. Busca todas as lições de todos os módulos
  const allCourseLessonIds: string[] = [];
  for (const mod of modules) {
    const modLessons = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `MODULE#${mod.moduleId}`,
          ":sk": "LESSON#",
        },
      })
    );
    for (const lesson of (modLessons.Items ?? []) as LessonRecord[]) {
      allCourseLessonIds.push(lesson.lessonId);
    }
  }

  if (allCourseLessonIds.length === 0) return;

  // 5. Verifica se todas as lições do curso estão no histórico
  const historyResult = await dynamo.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userId}`,
        ":sk": "HISTORY#",
      },
    })
  );

  const completedLessonIds = new Set(
    (historyResult.Items ?? []).map((h: any) => h.lessonId)
  );

  const allCompleted = allCourseLessonIds.every((id) => completedLessonIds.has(id));

  if (allCompleted) {
    await unlockRepeatable(userId, "course-complete", now);
  }
}
