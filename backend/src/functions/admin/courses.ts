/**
 * Handler de administração de Cursos
 * 
 * Endpoints:
 * - POST   /admin/courses      → Criar novo curso
 * - PUT    /admin/courses/{id} → Editar curso existente
 * - DELETE /admin/courses/{id} → Excluir curso (sem apagar progresso de usuários)
 * - GET    /admin/courses      → Listar todos os cursos
 * 
 * Cada curso é armazenado no DynamoDB com:
 *   PK = COURSE#<courseId>
 *   SK = METADATA
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, queryItems, updateItem, deleteItem, scanTable } from '../../lib/dynamo';
import { success, created, badRequest, notFound, serverError } from '../../lib/response';
import { validateCourseInput, sanitizeString } from '../../lib/validators';
import { CourseInput } from '../../types';

/**
 * POST /admin/courses
 * Cria um novo curso na plataforma.
 */
export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Faz o parse do body da requisição
    const body = JSON.parse(event.body || '{}') as CourseInput;

    // Valida os campos obrigatórios
    const validationError = validateCourseInput(body);
    if (validationError) {
      return badRequest(validationError);
    }

    // Gera um ID único para o curso
    const courseId = uuidv4();
    const now = new Date().toISOString();

    // Monta o item no formato do DynamoDB (Single Table Design)
    const course = {
      PK: `COURSE#${courseId}`,
      SK: 'METADATA',
      courseId,
      name: sanitizeString(body.name),
      description: sanitizeString(body.description),
      order: body.order,
      imageUrl: body.imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    // Persiste no DynamoDB
    await putItem(course);

    return created(course, 'Curso criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return serverError('Erro ao criar curso');
  }
}

/**
 * PUT /admin/courses/{id}
 * Atualiza os dados de um curso existente.
 */
export async function update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Extrai o ID do curso da URL
    const courseId = event.pathParameters?.id;
    if (!courseId) {
      return badRequest('ID do curso não fornecido');
    }

    // Verifica se o curso existe antes de atualizar
    const existing = await getItem(`COURSE#${courseId}`, 'METADATA');
    if (!existing) {
      return notFound('Curso não encontrado');
    }

    // Faz o parse do body com os campos a atualizar
    const body = JSON.parse(event.body || '{}') as Partial<CourseInput>;

    // Monta o objeto de atualizações (apenas campos fornecidos)
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name) updates.name = sanitizeString(body.name);
    if (body.description) updates.description = sanitizeString(body.description);
    if (body.order !== undefined) updates.order = body.order;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;

    // Atualiza no DynamoDB
    const updated = await updateItem(`COURSE#${courseId}`, 'METADATA', updates);

    return success(updated, 'Curso atualizado com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    return serverError('Erro ao atualizar curso');
  }
}

/**
 * DELETE /admin/courses/{id}
 * Remove um curso da plataforma.
 * 
 * IMPORTANTE: Não apaga o progresso dos usuários que já estudaram este curso.
 * O progresso fica órfão mas preservado, conforme regra de negócio.
 */
export async function remove(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) {
      return badRequest('ID do curso não fornecido');
    }

    // Verifica se o curso existe
    const existing = await getItem(`COURSE#${courseId}`, 'METADATA');
    if (!existing) {
      return notFound('Curso não encontrado');
    }

    // Remove apenas o registro do curso (METADATA)
    // Os módulos associados também são removidos para manter consistência
    // Mas NUNCA removemos registros de progresso (USER#/PROGRESS#)
    await deleteItem(`COURSE#${courseId}`, 'METADATA');

    // Remove os módulos associados ao curso
    const modules = await queryItems(`COURSE#${courseId}`, 'MODULE#');
    for (const mod of modules) {
      await deleteItem(mod.PK as string, mod.SK as string);
    }

    return success(null, 'Curso excluído com sucesso');
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    return serverError('Erro ao excluir curso');
  }
}

/**
 * GET /admin/courses
 * Lista todos os cursos cadastrados, ordenados pelo campo "order".
 */
export async function list(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Busca todos os itens com SK = METADATA (que são cursos)
    // Usa scan com filtro porque cursos têm PKs diferentes
    const items = await scanTable(
      'SK = :sk',
      { ':sk': 'METADATA' }
    );

    // Filtra apenas os que começam com COURSE# e ordena
    const courses = items
      .filter((item) => (item.PK as string).startsWith('COURSE#'))
      .sort((a, b) => (a.order as number) - (b.order as number));

    return success(courses);
  } catch (error) {
    console.error('Erro ao listar cursos:', error);
    return serverError('Erro ao listar cursos');
  }
}
