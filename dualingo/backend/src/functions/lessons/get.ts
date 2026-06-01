import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";
import { LessonRecord, ExerciseRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    getUserFromEvent(event); // valida autenticação

    const lessonId = event.pathParameters?.id;
    if (!lessonId) return notFound("ID da lição não informado.");

    // 1. Busca os metadados da lição
    // A lição está armazenada com PK=MODULE#<moduleId>, SK=LESSON#<lessonId>
    // Usamos o GSI1 (SK como PK) para buscar pelo lessonId diretamente
    const lessonResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "SK = :sk",
        ExpressionAttributeValues: {
          ":sk": `LESSON#${lessonId}`,
        },
        Limit: 1,
      })
    );

    if (!lessonResult.Items || lessonResult.Items.length === 0) {
      return notFound("Lição não encontrada.");
    }

    const lesson = lessonResult.Items[0] as LessonRecord;

    // 2. Busca todos os exercícios da lição ordenados por `order`
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

    // Ordena os exercícios pela propriedade `order`
    exercises.sort((a, b) => a.order - b.order);

    // Formata os exercícios para o frontend
    // Remove a resposta correta do payload (segurança)
    const exercisesForClient = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      lessonId: ex.lessonId,
      type: ex.type,
      question: ex.question,
      prompt: ex.prompt,
      imageUrl: ex.imageUrl,
      options: ex.options, // undefined para true_false
      // NÃO enviamos correctAnswerId aqui — só após o usuário responder
    }));

    return ok({
      lessonId: lesson.lessonId,
      moduleId: lesson.moduleId,
      name: lesson.name,
      xpReward: lesson.xpReward,
      exercises: exercisesForClient,
    });
  } catch (err) {
    console.error("getLesson error:", err);
    return serverError("Erro ao buscar lição.");
  }
};
