import api from "./api";
import { Course, Module, Lesson, ApiResponse } from "../types";

// ── Cursos e Trilhas ──────────────────────────────────────────────────────────

/**
 * Lista todos os cursos disponíveis.
 * GET /courses
 */
export async function getCourses(): Promise<Course[]> {
  const response = await api.get<ApiResponse<Course[]>>("/courses");
  return response.data.data;
}

/**
 * Retorna os detalhes de um curso com seus módulos.
 * GET /courses/{id}
 */
export async function getCourse(courseId: string): Promise<Course & { modules: Module[] }> {
  const response = await api.get<ApiResponse<Course & { modules: Module[] }>>(
    `/courses/${courseId}`
  );
  return response.data.data;
}

/**
 * Retorna um módulo com suas lições e o status de cada uma
 * (locked / available / completed) calculado pelo backend.
 * GET /courses/{id}/modules/{moduleId}
 */
export async function getModule(
  courseId: string,
  moduleId: string
): Promise<Module & { lessons: Lesson[] }> {
  const response = await api.get<ApiResponse<Module & { lessons: Lesson[] }>>(
    `/courses/${courseId}/modules/${moduleId}`
  );
  return response.data.data;
}

/**
 * Inicia um curso para o usuário (cria o registro de progresso).
 * POST /courses/{id}/start
 */
export async function startCourse(courseId: string): Promise<void> {
  await api.post(`/courses/${courseId}/start`);
}
