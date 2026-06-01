import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, serverError } from "../../lib/response";
import { ProgressRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    // Busca todo o progresso do usuário em todos os cursos
    const result = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "PROGRESS#",
        },
      })
    );

    const progress = (result.Items ?? []) as ProgressRecord[];

    return ok(
      progress.map((p) => ({
        userId: p.userId,
        courseId: p.courseId,
        currentModuleId: p.currentModuleId,
        currentLessonId: p.currentLessonId,
        xpAccumulated: p.xpAccumulated,
        percentComplete: p.percentComplete,
      }))
    );
  } catch (err) {
    console.error("getProgress error:", err);
    return serverError("Erro ao buscar progresso.");
  }
};
