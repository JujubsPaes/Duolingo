import api from "./api";
import {
  UserProgress,
  LessonHistory,
  GamificationData,
  ReviewSuggestion,
  Exercise,
  ApiResponse,
} from "../types";

// ── Progresso ─────────────────────────────────────────────────────────────────

/**
 * Retorna o progresso geral do usuário em todos os cursos.
 * GET /progress
 */
export async function getProgress(): Promise<UserProgress[]> {
  const response = await api.get<ApiResponse<UserProgress[]>>("/progress");
  return response.data.data;
}

/**
 * Retorna o progresso do usuário em um curso específico.
 * GET /progress/{courseId}
 */
export async function getCourseProgress(courseId: string): Promise<UserProgress> {
  const response = await api.get<ApiResponse<UserProgress>>(`/progress/${courseId}`);
  return response.data.data;
}

// ── Gamificação ───────────────────────────────────────────────────────────────

/**
 * Retorna XP, nível, streak e conquistas do usuário.
 * GET /gamification
 */
export async function getGamification(): Promise<GamificationData> {
  const response = await api.get<ApiResponse<GamificationData>>("/gamification");
  return response.data.data;
}

/**
 * Resgata a recompensa de uma conquista desbloqueada.
 * Marca a conquista como rewardClaimed no backend.
 */
export async function claimAchievementReward(achievementId: string): Promise<void> {
  await api.post(`/gamification/achievements/${achievementId}/claim`);
}

/**
 * Notifica o backend que uma conquista foi desbloqueada.
 * Persiste o desbloqueio no banco de dados.
 */
export async function unlockAchievement(achievementId: string): Promise<void> {
  await api.post(`/gamification/achievements/${achievementId}/unlock`);
}

// ── Histórico ─────────────────────────────────────────────────────────────────

/**
 * Retorna o histórico de lições completadas pelo usuário.
 * GET /history
 */
export async function getHistory(): Promise<LessonHistory[]> {
  const response = await api.get<ApiResponse<LessonHistory[]>>("/history");
  return response.data.data;
}

// ── Revisão Inteligente ───────────────────────────────────────────────────────

/**
 * Retorna sugestões de conteúdo para revisão baseadas nos erros do usuário.
 * Exercícios com taxa de erro > 50% são priorizados.
 * GET /review/suggestions
 */
export async function getReviewSuggestions(): Promise<ReviewSuggestion[]> {
  const response = await api.get<ApiResponse<ReviewSuggestion[]>>("/review/suggestions");
  return response.data.data;
}

/**
 * Retorna exercícios personalizados para revisão.
 * GET /review/exercises
 */
export async function getReviewExercises(): Promise<Exercise[]> {
  const response = await api.get<ApiResponse<Exercise[]>>("/review/exercises");
  return response.data.data;
}
