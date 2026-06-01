import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";
import { ProgressRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;
    const courseId = event.pathParameters?.courseId;

    if (!courseId) return notFound("ID do curso não informado.");

    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.progress(userId, courseId),
      })
    );

    if (!result.Item) return notFound("Progresso não encontrado para este curso.");

    const p = result.Item as ProgressRecord;

    return ok({
      userId: p.userId,
      courseId: p.courseId,
      currentModuleId: p.currentModuleId,
      currentLessonId: p.currentLessonId,
      xpAccumulated: p.xpAccumulated,
      percentComplete: p.percentComplete,
    });
  } catch (err) {
    console.error("getCourseProgress error:", err);
    return serverError("Erro ao buscar progresso do curso.");
  }
};
