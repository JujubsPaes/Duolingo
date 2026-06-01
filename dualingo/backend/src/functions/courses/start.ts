import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, badRequest, notFound, serverError } from "../../lib/response";
import { CourseRecord, ModuleRecord, LessonRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;
    const courseId = event.pathParameters?.id;

    if (!courseId) return notFound("ID do curso não informado.");

    // 1. Verifica se o curso existe
    const courseResult = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.course(courseId) })
    );

    if (!courseResult.Item) return notFound("Curso não encontrado.");

    // 2. Verifica se o usuário já iniciou este curso
    const existingProgress = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.progress(userId, courseId) })
    );

    if (existingProgress.Item) {
      return badRequest("Você já iniciou este curso.");
    }

    // 3. Busca o primeiro módulo do curso (order = 1)
    const modulesResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `COURSE#${courseId}`,
          ":sk": "MODULE#",
        },
      })
    );

    const modules = (modulesResult.Items ?? []) as ModuleRecord[];
    modules.sort((a, b) => a.order - b.order);
    const firstModule = modules[0];

    if (!firstModule) return notFound("Nenhum módulo encontrado para este curso.");

    // 4. Busca a primeira lição do primeiro módulo
    const lessonsResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `MODULE#${firstModule.moduleId}`,
          ":sk": "LESSON#",
        },
      })
    );

    const lessons = (lessonsResult.Items ?? []) as LessonRecord[];
    lessons.sort((a, b) => a.order - b.order);
    const firstLesson = lessons[0];

    if (!firstLesson) return notFound("Nenhuma lição encontrada para o primeiro módulo.");

    // 5. Cria o registro de progresso inicial
    const now = new Date().toISOString();
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...Keys.progress(userId, courseId),
          userId,
          courseId,
          currentModuleId: firstModule.moduleId,
          currentLessonId: firstLesson.lessonId,
          xpAccumulated: 0,
          percentComplete: 0,
          updatedAt: now,
        },
      })
    );

    return ok({
      message: "Curso iniciado com sucesso.",
      currentModuleId: firstModule.moduleId,
      currentLessonId: firstLesson.lessonId,
    });
  } catch (err) {
    console.error("startCourse error:", err);
    return serverError("Erro ao iniciar curso.");
  }
};
