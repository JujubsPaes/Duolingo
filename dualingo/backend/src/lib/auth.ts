import { APIGatewayProxyEvent } from "aws-lambda";
import { CognitoClaims } from "../types";

/**
 * Extrai o userId (sub) e email do token JWT do Cognito.
 * O API Gateway com Cognito Authorizer já valida o token antes de chegar aqui.
 * Os claims ficam disponíveis em requestContext.authorizer.claims.
 */
export function getUserFromEvent(event: APIGatewayProxyEvent): CognitoClaims {
  const claims = event.requestContext?.authorizer?.claims as CognitoClaims;

  if (!claims?.sub) {
    throw new Error("Token inválido ou ausente.");
  }

  return claims;
}

/**
 * Extrai e faz parse seguro do body da requisição.
 * Retorna null se o body estiver vazio ou inválido.
 */
export function parseBody<T>(event: APIGatewayProxyEvent): T | null {
  if (!event.body) return null;
  try {
    return JSON.parse(event.body) as T;
  } catch {
    return null;
  }
}
