import api from "./api";
import { Exercise, Lesson, ApiResponse } from "../types";

// Resposta ao concluir uma lição
interface CompleteLessonRequest {
  answers: Record<string, string>; // { exerciseId: answerId }
}

interface CompleteLessonResponse {
  passed: boolean;          // true se acertou >= 70%
  correctCount: number;
  wrongCount: number;
  xpEarned: number;
  newXP?: number;           // XP total atualizado
  newLevel?: number;        // nível atualizado
  newStreak?: number;       // streak atualizado
  nextLessonId?: string;    // próxima lição desbloqueada (se houver)
}

// ── Lições e Exercícios ───────────────────────────────────────────────────────

/**
 * Carrega uma lição com todos os seus exercícios.
 * GET /lessons/{id}
 */
export async function getLesson(
  lessonId: string
): Promise<Lesson & { exercises: Exercise[] }> {
  const response = await api.get<ApiResponse<Lesson & { exercises: Exercise[] }>>(
    `/lessons/${lessonId}`
  );
  return response.data.data;
}

/**
 * Conclui uma lição enviando as respostas do usuário.
 * O backend valida, calcula XP e atualiza o progresso.
 * Regra: precisa de >= 70% de acerto para passar.
 * POST /lessons/{id}/complete
 */
export async function completeLesson(
  lessonId: string,
  data: CompleteLessonRequest
): Promise<CompleteLessonResponse> {
  const response = await api.post<ApiResponse<CompleteLessonResponse>>(
    `/lessons/${lessonId}/complete`,
    data
  );
  return response.data.data;
}

/**
 * Marca a lição para ser repetida (reseta o progresso da lição).
 * POST /lessons/{id}/repeat
 */
export async function repeatLesson(lessonId: string): Promise<void> {
  await api.post(`/lessons/${lessonId}/repeat`);
}
