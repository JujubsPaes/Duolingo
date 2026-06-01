/**
 * Handler de administração de Lições
 * 
 * Endpoints:
 * - POST   /admin/lessons      → Criar nova lição
 * - PUT    /admin/lessons/{id} → Editar lição existente
 * - DELETE /admin/lessons/{id} → Excluir lição
 * - GET    /admin/lessons      → Listar lições (filtro por moduleId via query string)
 * 
 * Cada lição é armazenada no DynamoDB com:
 *   PK = MODULE#<moduleId>
 *   SK = LESSON#<lessonId>
 * 
 * Isso permite buscar todas as lições de um módulo com uma única query.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, queryItems, updateItem, deleteItem } from '../../lib/dynamo';
import { success, created, badRequest, notFound, serverError } from '../../lib/response';
import { validateLessonInput, sanitizeString } from '../../lib/validators';
import { LessonInput } from '../../types';

// XP padrão por lição concluída (conforme regra de negócio)
const DEFAULT_XP_REWARD = 10;

/**
 * POST /admin/lessons
 * Cria uma nova lição dentro de um módulo.
 */
export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}') as LessonInput;

    // Valida campos obrigatórios
    const validationError = validateLessonInput(body);
    if (validationError) {
      return badRequest(validationError);
    }

    const lessonId = uuidv4();
    const now = new Date().toISOString();

    // PK é o módulo pai, SK identifica a lição
    const lesson = {
      PK: `MODULE#${body.moduleId}`,
      SK: `LESSON#${lessonId}`,
      lessonId,
      moduleId: body.moduleId,
      name: sanitizeString(body.name),
      description: sanitizeString(body.description),
      order: body.order,
      xpReward: body.xpReward ?? DEFAULT_XP_REWARD, // Usa 10 XP se não informado
      createdAt: now,
      updatedAt: now,
    };

    await putItem(lesson);

    return created(lesson, 'Lição criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar lição:', error);
    return serverError('Erro ao criar lição');
  }
}

/**
 * PUT /admin/lessons/{id}
 * Atualiza os dados de uma lição existente.
 * Requer moduleId no body para localizar o item no DynamoDB.
 */
export async function update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const lessonId = event.pathParameters?.id;
    if (!lessonId) {
      return badRequest('ID da lição não fornecido');
    }

    const body = JSON.parse(event.body || '{}') as Partial<LessonInput>;

    // moduleId é necessário para montar a PK
    if (!body.moduleId) {
      return badRequest('O campo "moduleId" é obrigatório para identificar a lição');
    }

    // Verifica se a lição existe
    const existing = await getItem(`MODULE#${body.moduleId}`, `LESSON#${lessonId}`);
    if (!existing) {
      return notFound('Lição não encontrada');
    }

    // Monta atualizações parciais
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name) updates.name = sanitizeString(body.name);
    if (body.description) updates.description = sanitizeString(body.description);
    if (body.order !== undefined) updates.order = body.order;
    if (body.xpReward !== undefined) updates.xpReward = body.xpReward;

    const updated = await updateItem(`MODULE#${body.moduleId}`, `LESSON#${lessonId}`, updates);

    return success(updated, 'Lição atualizada com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar lição:', error);
    return serverError('Erro ao atualizar lição');
  }
}

/**
 * DELETE /admin/lessons/{id}
 * Remove uma lição e seus exercícios associados.
 * Requer moduleId como query parameter para localizar o item.
 */
export async function remove(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const lessonId = event.pathParameters?.id;
    const moduleId = event.queryStringParameters?.moduleId;

    if (!lessonId) {
      return badRequest('ID da lição não fornecido');
    }
    if (!moduleId) {
      return badRequest('Query parameter "moduleId" é obrigatório');
    }

    // Verifica se a lição existe
    const existing = await getItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`);
    if (!existing) {
      return notFound('Lição não encontrada');
    }

    // Remove a lição
    await deleteItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`);

    // Remove os exercícios associados à lição
    const exercises = await queryItems(`LESSON#${lessonId}`, 'EXERCISE#');
    for (const exercise of exercises) {
      await deleteItem(exercise.PK as string, exercise.SK as string);
    }

    return success(null, 'Lição excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir lição:', error);
    return serverError('Erro ao excluir lição');
  }
}

/**
 * GET /admin/lessons?moduleId=xxx
 * Lista todas as lições de um módulo específico, ordenadas pelo campo "order".
 */
export async function list(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const moduleId = event.queryStringParameters?.moduleId;

    if (!moduleId) {
      return badRequest('Query parameter "moduleId" é obrigatório');
    }

    // Busca todas as lições do módulo (PK = MODULE#xxx, SK começa com LESSON#)
    const lessons = await queryItems(`MODULE#${moduleId}`, 'LESSON#');

    // Ordena pelo campo "order"
    const sorted = lessons.sort((a, b) => (a.order as number) - (b.order as number));

    return success(sorted);
  } catch (error) {
    console.error('Erro ao listar lições:', error);
    return serverError('Erro ao listar lições');
  }
}
