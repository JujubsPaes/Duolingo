import { APIGatewayProxyHandler } from "aws-lambda";
import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, serverError } from "../../lib/response";
import { ErrorRecord, ExerciseRecord } from "../../types";

const MIN_ERROR_RATE = 0.5;
const MIN_ERROR_COUNT = 3;
const MAX_REVIEW_EXERCISES = 10;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    // 1. Busca os exercícios com alta taxa de erro
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

    // Filtra e ordena por taxa de erro (mais frágeis primeiro)
    const fragile = errors
      .filter((e) => e.errorCount / e.totalAttempts > MIN_ERROR_RATE && e.errorCount >= MIN_ERROR_COUNT)
      .sort((a, b) => b.errorCount / b.totalAttempts - a.errorCount / a.totalAttempts)
      .slice(0, MAX_REVIEW_EXERCISES);

    if (fragile.length === 0) return ok([]);

    // 2. Busca os dados completos de cada exercício
    const exercises = [];
    for (const err of fragile) {
      const result = await dynamo.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: Keys.exercise(err.lessonId, err.exerciseId),
        })
      );

      if (!result.Item) continue;
      const ex = result.Item as ExerciseRecord;

      exercises.push({
        exerciseId: ex.exerciseId,
        lessonId: ex.lessonId,
        type: ex.type,
        question: ex.question,
        prompt: ex.prompt,
        imageUrl: ex.imageUrl,
        options: ex.options,
        // Para revisão, enviamos a resposta correta e a explicação
        correctAnswerId: ex.correctAnswerId,
        explanation: ex.explanation,
      });
    }

    return ok(exercises);
  } catch (err) {
    console.error("getReviewExercises error:", err);
    return serverError("Erro ao buscar exercícios de revisão.");
  }
};
