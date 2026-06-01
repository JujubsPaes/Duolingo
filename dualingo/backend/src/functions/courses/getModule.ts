import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";
import { ModuleRecord, LessonRecord, ProgressRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    const courseId = event.pathParameters?.id;
    const moduleId = event.pathParameters?.moduleId;
    if (!courseId || !moduleId) return notFound("IDs não informados.");

    // 1. Busca o módulo
    const moduleResult = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.module(courseId, moduleId),
      })
    );

    if (!moduleResult.Item) return notFound("Módulo não encontrado.");
    const module = moduleResult.Item as ModuleRecord;

    // 2. Busca todas as lições do módulo
    const lessonsResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `MODULE#${moduleId}`,
          ":sk": "LESSON#",
        },
      })
    );

    const lessons = (lessonsResult.Items ?? []) as LessonRecord[];
    lessons.sort((a, b) => a.order - b.order);

    // 3. Busca o progresso do usuário neste curso para calcular o status de cada lição
    const progressResult = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.progress(userId, courseId),
      })
    );

    const progress = progressResult.Item as ProgressRecord | undefined;

    // 4. Calcula o status de cada lição
    // Regra: a primeira lição está sempre disponível.
    // As demais só ficam disponíveis após a anterior ser concluída.
    const lessonsWithStatus = lessons.map((lesson, index) => {
      let status: "locked" | "available" | "completed" = "locked";

      if (!progress) {
        // Usuário ainda não iniciou o curso — só a primeira lição está disponível
        status = index === 0 ? "available" : "locked";
      } else {
        const currentLessonOrder = lessons.find(
          (l) => l.lessonId === progress.currentLessonId
        )?.order ?? 0;

        if (lesson.order < currentLessonOrder) {
          status = "completed";
        } else if (lesson.order === currentLessonOrder) {
          status = "available";
        } else {
          status = "locked";
        }
      }

      return {
        lessonId: lesson.lessonId,
        moduleId: lesson.moduleId,
        name: lesson.name,
        order: lesson.order,
        xpReward: lesson.xpReward,
        status,
      };
    });

    return ok({
      moduleId: module.moduleId,
      courseId: module.courseId,
      name: module.name,
      order: module.order,
      lessons: lessonsWithStatus,
    });
  } catch (err) {
    console.error("getModule error:", err);
    return serverError("Erro ao buscar módulo.");
  }
};
