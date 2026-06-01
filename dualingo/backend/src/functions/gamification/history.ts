import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, serverError } from "../../lib/response";
import { HistoryRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    // Busca todo o histórico de lições do usuário, ordenado por data (mais recente primeiro)
    const result = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "HISTORY#",
        },
        // ScanIndexForward: false retorna em ordem decrescente (mais recente primeiro)
        ScanIndexForward: false,
        Limit: 50, // últimas 50 lições
      })
    );

    const history = (result.Items ?? []) as HistoryRecord[];

    return ok(
      history.map((h) => ({
        lessonId: h.lessonId,
        completedAt: h.completedAt,
        correctAnswers: h.correctAnswers,
        wrongAnswers: h.wrongAnswers,
        xpEarned: h.xpEarned,
      }))
    );
  } catch (err) {
    console.error("getHistory error:", err);
    return serverError("Erro ao buscar histórico.");
  }
};
