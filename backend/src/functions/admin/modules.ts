/**
 * Handler de administração de Módulos
 * 
 * Endpoints:
 * - POST   /admin/modules      → Criar novo módulo
 * - PUT    /admin/modules/{id} → Editar módulo existente
 * - DELETE /admin/modules/{id} → Excluir módulo
 * - GET    /admin/modules      → Listar módulos (filtro por courseId via query string)
 * 
 * Cada módulo é armazenado no DynamoDB com:
 *   PK = COURSE#<courseId>
 *   SK = MODULE#<moduleId>
 * 
 * Isso permite buscar todos os módulos de um curso com uma única query.
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, queryItems, updateItem, deleteItem } from '../../lib/dynamo';
import { success, created, badRequest, notFound, serverError } from '../../lib/response';
import { validateModuleInput, sanitizeString } from '../../lib/validators';
import { ModuleInput } from '../../types';

/**
 * POST /admin/modules
 * Cria um novo módulo dentro de um curso.
 */
export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || '{}') as ModuleInput;

    // Valida campos obrigatórios
    const validationError = validateModuleInput(body);
    if (validationError) {
      return badRequest(validationError);
    }

    // Verifica se o curso pai existe
    const courseExists = await getItem(`COURSE#${body.courseId}`, 'METADATA');
    if (!courseExists) {
      return notFound('Curso não encontrado. Verifique o courseId.');
    }

    const moduleId = uuidv4();
    const now = new Date().toISOString();

    // PK é o curso pai, SK identifica o módulo
    const module = {
      PK: `COURSE#${body.courseId}`,
      SK: `MODULE#${moduleId}`,
      moduleId,
      courseId: body.courseId,
      name: sanitizeString(body.name),
      description: sanitizeString(body.description),
      order: body.order,
      createdAt: now,
      updatedAt: now,
    };

    await putItem(module);

    return created(module, 'Módulo criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    return serverError('Erro ao criar módulo');
  }
}

/**
 * PUT /admin/modules/{id}
 * Atualiza os dados de um módulo existente.
 * Requer courseId no body para localizar o item no DynamoDB.
 */
export async function update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const moduleId = event.pathParameters?.id;
    if (!moduleId) {
      return badRequest('ID do módulo não fornecido');
    }

    const body = JSON.parse(event.body || '{}') as Partial<ModuleInput>;

    // courseId é necessário para montar a PK e localizar o item
    if (!body.courseId) {
      return badRequest('O campo "courseId" é obrigatório para identificar o módulo');
    }

    // Verifica se o módulo existe
    const existing = await getItem(`COURSE#${body.courseId}`, `MODULE#${moduleId}`);
    if (!existing) {
      return notFound('Módulo não encontrado');
    }

    // Monta atualizações parciais
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name) updates.name = sanitizeString(body.name);
    if (body.description) updates.description = sanitizeString(body.description);
    if (body.order !== undefined) updates.order = body.order;

    const updated = await updateItem(`COURSE#${body.courseId}`, `MODULE#${moduleId}`, updates);

    return success(updated, 'Módulo atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    return serverError('Erro ao atualizar módulo');
  }
}

/**
 * DELETE /admin/modules/{id}
 * Remove um módulo e suas lições associadas.
 * Requer courseId como query parameter para localizar o item.
 */
export async function remove(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const moduleId = event.pathParameters?.id;
    const courseId = event.queryStringParameters?.courseId;

    if (!moduleId) {
      return badRequest('ID do módulo não fornecido');
    }
    if (!courseId) {
      return badRequest('Query parameter "courseId" é obrigatório');
    }

    // Verifica se o módulo existe
    const existing = await getItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);
    if (!existing) {
      return notFound('Módulo não encontrado');
    }

    // Remove o módulo
    await deleteItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);

    // Remove as lições associadas ao módulo
    const lessons = await queryItems(`MODULE#${moduleId}`, 'LESSON#');
    for (const lesson of lessons) {
      await deleteItem(lesson.PK as string, lesson.SK as string);
    }

    return success(null, 'Módulo excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    return serverError('Erro ao excluir módulo');
  }
}

/**
 * GET /admin/modules?courseId=xxx
 * Lista todos os módulos de um curso específico, ordenados pelo campo "order".
 */
export async function list(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const courseId = event.queryStringParameters?.courseId;

    if (!courseId) {
      return badRequest('Query parameter "courseId" é obrigatório');
    }

    // Busca todos os módulos do curso (PK = COURSE#xxx, SK começa com MODULE#)
    const modules = await queryItems(`COURSE#${courseId}`, 'MODULE#');

    // Ordena pelo campo "order"
    const sorted = modules.sort((a, b) => (a.order as number) - (b.order as number));

    return success(sorted);
  } catch (error) {
    console.error('Erro ao listar módulos:', error);
    return serverError('Erro ao listar módulos');
  }
}
