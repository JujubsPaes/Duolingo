/**
 * Handler de administração de Exercícios
 * 
 * Endpoints:
 * - POST   /admin/exercises      → Criar novo exercício
 * - PUT    /admin/exercises/{id} → Editar exercício existente
 * - DELETE /admin/exercises/{id} → Excluir exercício
 * - GET    /admin/exercises      → Listar exercícios (filtro por lessonId via query string)
 * 
 * Cada exercício é armazenado no DynamoDB com:
 *   PK = LESSON#<lessonId>
 *   SK = EXERCISE#<exerciseId>
 * 
 * Tipos suportados no MVP:
 * - multiple_choice: 4 opções, 1 correta
 * - true_false: 2 opções (Verdadeiro/Falso)
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, queryItems, updateItem, deleteItem } from '../../lib/dynamo';
import { success, created, badRequest, notFound, serverError } from '../../lib/response';
import { validateExerciseInput, sanitizeString } from '../../lib/validators';
import { ExerciseInput } from '../../types';

/**
 * POST /admin/exercises
 * Cria um novo exercício dentro de uma lição.
 */
export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}') as ExerciseInput;

    // Valida campos obrigatórios e regras de tipo
    const validationError = validateExerciseInput(body);
    if (validationError) {
      return badRequest(validationError);
    }

    const exerciseId = uuidv4();
    const now = new Date().toISOString();

    // PK é a lição pai, SK identifica o exercício
    const exercise = {
      PK: `LESSON#${body.lessonId}`,
      SK: `EXERCISE#${exerciseId}`,
      exerciseId,
      lessonId: body.lessonId,
      type: body.type,
      question: sanitizeString(body.question),
      options: body.options.map(sanitizeString),
      correctAnswer: sanitizeString(body.correctAnswer),
      explanation: body.explanation ? sanitizeString(body.explanation) : null,
      order: body.order,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(exercise);

    return created(exercise, 'Exercício criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar exercício:', error);
    return serverError('Erro ao criar exercício');
  }
}

/**
 * PUT /admin/exercises/{id}
 * Atualiza os dados de um exercício existente.
 * Requer lessonId no body para localizar o item no DynamoDB.
 */
export async function update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const exerciseId = event.pathParameters?.id;
    if (!exerciseId) {
      return badRequest('ID do exercício não fornecido');
    }

    const body = JSON.parse(event.body || '{}') as Partial<ExerciseInput>;

    // lessonId é necessário para montar a PK
    if (!body.lessonId) {
      return badRequest('O campo "lessonId" é obrigatório para identificar o exercício');
    }

    // Verifica se o exercício existe
    const existing = await getItem(`LESSON#${body.lessonId}`, `EXERCISE#${exerciseId}`);
    if (!existing) {
      return notFound('Exercício não encontrado');
    }

    // Monta atualizações parciais
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.type) updates.type = body.type;
    if (body.question) updates.question = sanitizeString(body.question);
    if (body.options) updates.options = body.options.map(sanitizeString);
    if (body.correctAnswer) updates.correctAnswer = sanitizeString(body.correctAnswer);
    if (body.explanation !== undefined) {
      updates.explanation = body.explanation ? sanitizeString(body.explanation) : null;
    }
    if (body.order !== undefined) updates.order = body.order;

    // Validação extra: se mudou options ou correctAnswer, garante consistência
    const finalOptions = (updates.options || existing.options) as string[];
    const finalAnswer = (updates.correctAnswer || existing.correctAnswer) as string;
    if (!finalOptions.includes(finalAnswer)) {
      return badRequest('A "correctAnswer" deve ser uma das opções fornecidas');
    }

    const updated = await updateItem(`LESSON#${body.lessonId}`, `EXERCISE#${exerciseId}`, updates);

    return success(updated, 'Exercício atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar exercício:', error);
    return serverError('Erro ao atualizar exercício');
  }
}

/**
 * DELETE /admin/exercises/{id}
 * Remove um exercício de uma lição.
 * Requer lessonId como query parameter para localizar o item.
 */
export async function remove(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const exerciseId = event.pathParameters?.id;
    const lessonId = event.queryStringParameters?.lessonId;

    if (!exerciseId) {
      return badRequest('ID do exercício não fornecido');
    }
    if (!lessonId) {
      return badRequest('Query parameter "lessonId" é obrigatório');
    }

    // Verifica se o exercício existe
    const existing = await getItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`);
    if (!existing) {
      return notFound('Exercício não encontrado');
    }

    // Remove o exercício
    await deleteItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`);

    return success(null, 'Exercício excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir exercício:', error);
    return serverError('Erro ao excluir exercício');
  }
}

/**
 * GET /admin/exercises?lessonId=xxx
 * Lista todos os exercícios de uma lição específica, ordenados pelo campo "order".
 */
export async function list(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const lessonId = event.queryStringParameters?.lessonId;

    if (!lessonId) {
      return badRequest('Query parameter "lessonId" é obrigatório');
    }

    // Busca todos os exercícios da lição (PK = LESSON#xxx, SK começa com EXERCISE#)
    const exercises = await queryItems(`LESSON#${lessonId}`, 'EXERCISE#');

    // Ordena pelo campo "order"
    const sorted = exercises.sort((a, b) => (a.order as number) - (b.order as number));

    return success(sorted);
  } catch (error) {
    console.error('Erro ao listar exercícios:', error);
    return serverError('Erro ao listar exercícios');
  }
}
