import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, serverError } from "../../lib/response";
import { ErrorRecord, LessonRecord } from "../../types";

// Taxa de erro mínima para sugerir revisão (50%)
const MIN_ERROR_RATE = 0.5;
// Número mínimo de erros para sugerir revisão
const MIN_ERROR_COUNT = 3;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    // 1. Busca todos os registros de erro do usuário
    const errorsResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "ERROR#",
        },
      })
    );

    const errors = (errorsResult.Items ?? []) as ErrorRecord[];

    // 2. Filtra exercícios "frágeis": taxa de erro > 50% E ao menos 3 erros
    const fragileErrors = errors.filter((e) => {
      const errorRate = e.errorCount / e.totalAttempts;
      return errorRate > MIN_ERROR_RATE && e.errorCount >= MIN_ERROR_COUNT;
    });

    if (fragileErrors.length === 0) {
      return ok([]);
    }

    // 3. Agrupa por lição e calcula a taxa de erro média por lição
    const lessonErrorMap = new Map<string, { errorCount: number; totalAttempts: number }>();

    for (const err of fragileErrors) {
      const existing = lessonErrorMap.get(err.lessonId) ?? { errorCount: 0, totalAttempts: 0 };
      lessonErrorMap.set(err.lessonId, {
        errorCount: existing.errorCount + err.errorCount,
        totalAttempts: existing.totalAttempts + err.totalAttempts,
      });
    }

    // 4. Busca os nomes das lições para montar a resposta
    const suggestions = [];
    for (const [lessonId, stats] of lessonErrorMap.entries()) {
      const lessonResult = await dynamo.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "SK = :sk",
          ExpressionAttributeValues: { ":sk": `LESSON#${lessonId}` },
          Limit: 1,
        })
      );

      const lesson = lessonResult.Items?.[0] as LessonRecord | undefined;
      if (!lesson) continue;

      suggestions.push({
        lessonId,
        lessonName: lesson.name,
        errorRate: stats.errorCount / stats.totalAttempts,
      });
    }

    // Ordena por taxa de erro (maior primeiro)
    suggestions.sort((a, b) => b.errorRate - a.errorRate);

    return ok(suggestions);
  } catch (err) {
    console.error("getReviewSuggestions error:", err);
    return serverError("Erro ao buscar sugestões de revisão.");
  }
};
