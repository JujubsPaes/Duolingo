import { APIGatewayProxyResult } from "aws-lambda";

// Headers CORS padrão para todas as respostas
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

/**
 * Resposta de sucesso (2xx)
 */
export function ok<T>(data: T, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, data }),
  };
}

/**
 * Resposta de criação (201)
 */
export function created<T>(data: T): APIGatewayProxyResult {
  return ok(data, 201);
}

/**
 * Resposta de erro com mensagem
 */
export function error(
  message: string,
  statusCode = 500,
  details?: string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      success: false,
      message,
      ...(details ? { error: details } : {}),
    }),
  };
}

export const badRequest = (msg: string) => error(msg, 400);
export const unauthorized = (msg = "Não autorizado.") => error(msg, 401);
export const forbidden = (msg = "Acesso negado.") => error(msg, 403);
export const notFound = (msg = "Recurso não encontrado.") => error(msg, 404);
export const serverError = (msg = "Erro interno do servidor.") => error(msg, 500);
