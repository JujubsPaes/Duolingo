/**
 * Rotas de lições — GET /lessons/:id, POST /lessons/:id/complete, POST /lessons/:id/repeat
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const lessonsRouter = Router();

// Todas as rotas de lições são protegidas
lessonsRouter.use(authMiddleware);

// Regras de negócio de XP
const XP_BASE = 10;
const XP_BONUS_HIGH_SCORE = 5;
const XP_BONUS_STREAK_7 = 500;
const MIN_PASS_RATE = 0.7;

// ── GET /lessons/:id ──────────────────────────────────────────────────────────
lessonsRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;

    // Busca a lição pelo SK via "GSI1" simulado
    const lessons = db.queryBySK(`LESSON#${lessonId}`);
    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: "Lição não encontrada." });
    }

    const lesson = lessons[0];

    // Busca os exercícios da lição
    const exercises = db.queryItems(`LESSON#${lessonId}`, "EXERCISE#")
      .sort((a, b) => a.order - b.order)
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        lessonId: ex.lessonId,
        type: ex.type,
        question: ex.question,
        prompt: ex.prompt,
        imageUrl: ex.imageUrl,
        options: ex.options,
        // NÃO envia correctAnswerId (segurança)
      }));

    return res.json({
      success: true,
      data: {
        lessonId: lesson.lessonId,
        moduleId: lesson.moduleId,
        name: lesson.name,
        xpReward: lesson.xpReward,
        exercises,
      },
    });
  } catch (err) {
    console.error("getLesson error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar lição." });
  }
});

// ── POST /lessons/:id/complete ────────────────────────────────────────────────
lessonsRouter.post("/:id/complete", (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;
    const userId = (req as any).userId;
    const { answers } = req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ success: false, message: "Respostas são obrigatórias." });
    }

    console.log(`[complete] Lição: ${lessonId}, Respostas:`, answers);

    // Busca os exercícios com as respostas corretas
    const exercises = db.queryItems(`LESSON#${lessonId}`, "EXERCISE#");
    if (exercises.length === 0) {
      return res.status(404).json({ success: false, message: "Exercícios não encontrados." });
    }

    // Corrige as respostas
    let correctCount = 0;
    const wrongExercises: string[] = [];

    for (const exercise of exercises) {
      const userAnswer = answers[exercise.exerciseId];
      if (userAnswer === exercise.correctAnswerId) {
        correctCount++;
      } else {
        wrongExercises.push(exercise.exerciseId);
      }
    }

    const totalCount = exercises.length;
    const accuracy = correctCount / totalCount;
    const passed = accuracy >= MIN_PASS_RATE;

    const now = new Date().toISOString();

    // Registra erros para revisão inteligente
    for (const exerciseId of wrongExercises) {
      const errorKey = { PK: `USER#${userId}`, SK: `ERROR#${exerciseId}` };
      const existing = db.getItem(errorKey.PK, errorKey.SK);

      if (existing) {
        db.updateItem(errorKey.PK, errorKey.SK, {
          errorCount: existing.errorCount + 1,
          totalAttempts: existing.totalAttempts + 1,
          lastErrorAt: now,
        });
      } else {
        const exercise = exercises.find((e) => e.exerciseId === exerciseId)!;
        db.putItem({
          ...errorKey,
          userId,
          exerciseId,
          lessonId: exercise.lessonId,
          errorCount: 1,
          totalAttempts: 1,
          lastErrorAt: now,
        });
      }
    }

    // Se não passou, retorna sem atualizar progresso
    if (!passed) {
      return res.json({
        success: true,
        data: {
          passed: false,
          correctCount,
          wrongCount: totalCount - correctCount,
          xpEarned: 0,
          message: `Você acertou ${correctCount}/${totalCount}. Precisa de 70% para passar.`,
        },
      });
    }

    // Busca o perfil do usuário para calcular XP e streak
    const user = db.getItem(`USER#${userId}`, "PROFILE");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    // Calcula streak
    const today = new Date().toISOString().split("T")[0];
    const newStreak = calculateStreak(user.lastStudyDate, user.streak);

    // Calcula XP
    let xpEarned = XP_BASE;
    if (accuracy > 0.9) xpEarned += XP_BONUS_HIGH_SCORE;
    if (newStreak % 7 === 0 && newStreak > 0) xpEarned += XP_BONUS_STREAK_7;

    const newXP = user.xp + xpEarned;
    const newLevel = calculateLevel(newXP);

    // Atualiza o perfil do usuário
    db.updateItem(`USER#${userId}`, "PROFILE", {
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      lastStudyDate: today,
    });

    // Salva no histórico
    db.putItem({
      PK: `USER#${userId}`,
      SK: `HISTORY#${now}`,
      userId,
      lessonId,
      completedAt: now,
      correctAnswers: correctCount,
      wrongAnswers: totalCount - correctCount,
      xpEarned,
    });

    // Busca a próxima lição
    const lesson = db.queryBySK(`LESSON#${lessonId}`)[0];
    let nextLessonId: string | undefined;

    if (lesson) {
      const moduleLessons = db.queryItems(`MODULE#${lesson.moduleId}`, "LESSON#")
        .sort((a, b) => a.order - b.order);

      const nextLesson = moduleLessons.find((l) => l.order === lesson.order + 1);
      if (nextLesson) {
        nextLessonId = nextLesson.lessonId;
      }

      // Atualiza o progresso do curso (se existir)
      const moduleData = db.queryBySK(`MODULE#${lesson.moduleId}`)[0];
      if (moduleData) {
        const courseId = moduleData.courseId;
        const progress = db.getItem(`USER#${userId}`, `PROGRESS#${courseId}`);

        if (progress) {
          // Calcula percentual de conclusão
          const allModules = db.queryItems(`COURSE#${courseId}`, "MODULE#");
          let totalLessons = 0;
          let completedLessons = 0;

          for (const mod of allModules) {
            const modLessons = db.queryItems(`MODULE#${mod.moduleId}`, "LESSON#");
            totalLessons += modLessons.length;
          }

          // Conta lições no histórico deste curso
          const history = db.queryItems(`USER#${userId}`, "HISTORY#");
          const completedLessonIds = new Set(history.map((h) => h.lessonId));

          for (const mod of allModules) {
            const modLessons = db.queryItems(`MODULE#${mod.moduleId}`, "LESSON#");
            for (const l of modLessons) {
              if (completedLessonIds.has(l.lessonId)) completedLessons++;
            }
          }

          const percentComplete = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

          db.updateItem(`USER#${userId}`, `PROGRESS#${courseId}`, {
            currentLessonId: nextLessonId ?? progress.currentLessonId,
            xpAccumulated: progress.xpAccumulated + xpEarned,
            percentComplete,
            updatedAt: now,
          });
        }
      }
    }

    // Verifica conquistas
    checkAchievements(userId, newStreak, accuracy, now);

    return res.json({
      success: true,
      data: {
        passed: true,
        correctCount,
        wrongCount: totalCount - correctCount,
        xpEarned,
        newXP,
        newLevel,
        newStreak,
        nextLessonId,
      },
    });
  } catch (err) {
    console.error("completeLesson error:", err);
    return res.status(500).json({ success: false, message: "Erro ao concluir lição." });
  }
});

// ── POST /lessons/:id/repeat ──────────────────────────────────────────────────
lessonsRouter.post("/:id/repeat", (req: Request, res: Response) => {
  const lessonId = req.params.id;
  return res.json({
    success: true,
    data: { lessonId, message: "Lição disponível para repetição." },
  });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateLevel(xp: number): number {
  if (xp <= 1000) return 1;
  if (xp <= 2500) return 2;
  if (xp <= 5000) return 3;
  if (xp <= 10000) return 4;
  return 5;
}

function calculateStreak(lastStudyDate: string | null, currentStreak: number): number {
  const today = new Date().toISOString().split("T")[0];
  if (!lastStudyDate) return 1;

  const last = new Date(lastStudyDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

function checkAchievements(userId: string, streak: number, accuracy: number, now: string) {
  // Primeira lição
  unlockAchievement(userId, "first-lesson", now);

  // Semana perfeita
  if (streak >= 7) {
    unlockAchievement(userId, "streak-7", now);
  }

  // Nota máxima
  if (accuracy === 1) {
    unlockAchievement(userId, "perfect-score", now);
  }
}

function unlockAchievement(userId: string, achievementId: string, now: string) {
  const achievement = db.getItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`);
  if (!achievement) return;

  if (!achievement.unlocked || achievement.repeatable) {
    db.updateItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`, {
      unlocked: true,
      unlockedAt: now,
      timesEarned: (achievement.timesEarned ?? 0) + 1,
    });
  }
}
