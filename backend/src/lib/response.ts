/**
 * Módulo de respostas HTTP padronizadas
 * 
 * Garante que todos os endpoints retornem no mesmo formato,
 * facilitando o consumo no frontend e a depuração de erros.
 */

import { APIGatewayProxyResult } from 'aws-lambda';

// Headers CORS padrão para todas as respostas
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
};

/**
 * Resposta de sucesso (200 OK)
 * Usada quando a operação foi concluída com sucesso e retorna dados.
 */
export function success(data: unknown, message?: string): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data,
      message,
    }),
  };
}

/**
 * Resposta de criação (201 Created)
 * Usada quando um novo recurso foi criado com sucesso.
 */
export function created(data: unknown, message?: string): APIGatewayProxyResult {
  return {
    statusCode: 201,
    headers: corsHeaders,
    body: JSON.stringify({
      success: true,
      data,
      message,
    }),
  };
}

/**
 * Resposta de erro de validação (400 Bad Request)
 * Usada quando o payload da requisição é inválido ou incompleto.
 */
export function badRequest(error: string): APIGatewayProxyResult {
  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({
      success: false,
      error,
    }),
  };
}

/**
 * Resposta de não encontrado (404 Not Found)
 * Usada quando o recurso solicitado não existe no banco.
 */
export function notFound(error: string): APIGatewayProxyResult {
  return {
    statusCode: 404,
    headers: corsHeaders,
    body: JSON.stringify({
      success: false,
      error,
    }),
  };
}

/**
 * Resposta de erro interno (500 Internal Server Error)
 * Usada quando ocorre um erro inesperado no servidor.
 * Nunca expõe detalhes internos ao cliente em produção.
 */
export function serverError(error: string): APIGatewayProxyResult {
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error,
    }),
  };
}
