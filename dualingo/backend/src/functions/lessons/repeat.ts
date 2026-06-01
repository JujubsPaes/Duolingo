import { APIGatewayProxyHandler } from "aws-lambda";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    getUserFromEvent(event);

    const lessonId = event.pathParameters?.id;
    if (!lessonId) return notFound("ID da lição não informado.");

    // Repetir uma lição não altera o progresso — apenas sinaliza ao frontend
    // que pode recarregar os exercícios via GET /lessons/{id}
    // O histórico de erros é mantido para a revisão inteligente
    return ok({ lessonId, message: "Lição disponível para repetição." });
  } catch (err) {
    console.error("repeatLesson error:", err);
    return serverError("Erro ao repetir lição.");
  }
};
