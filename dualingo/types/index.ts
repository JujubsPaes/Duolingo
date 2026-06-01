// ─────────────────────────────────────────────
// Tipos globais do projeto Dualingo
// Espelham o modelo de dados do DynamoDB (Single Table Design)
// ─────────────────────────────────────────────

// ── Usuário ──────────────────────────────────

export type UserRole = "user" | "admin";

export interface User {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate?: string; // ISO date string
  role?: UserRole; // "admin" para administradores, "user" para alunos (padrão)
}

// ── Auth ─────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string;
}

// ── Cursos e Trilhas ─────────────────────────

export interface Course {
  courseId: string;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export interface Module {
  moduleId: string;
  courseId: string;
  name: string;
  order: number;
}

export interface Lesson {
  lessonId: string;
  moduleId: string;
  name: string;
  order: number;
  xpReward: number;
  // Status calculado pelo backend com base no progresso do usuário
  status: "locked" | "available" | "completed";
}

// ── Exercícios ───────────────────────────────

export type ExerciseType = "multiple_choice" | "true_false";

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface Exercise {
  exerciseId: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  prompt?: string;
  options?: ExerciseOption[]; // múltipla escolha
  correctAnswerId: string;
  explanation?: string;
}

// ── Progresso ────────────────────────────────

export interface UserProgress {
  userId: string;
  courseId: string;
  currentModuleId: string;
  currentLessonId: string;
  xpAccumulated: number;
  percentComplete: number;
}

export interface LessonHistory {
  lessonId: string;
  completedAt: string; // ISO date string
  correctAnswers: number;
  wrongAnswers: number;
  xpEarned: number;
}

// ── Gamificação ──────────────────────────────

export interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  lastStudyDate?: string;
  achievements: Achievement[];
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardClaimed: boolean;
  unlockedAt?: string; // ISO date string
  reward: string;      // ex: "+50 XP"
  repeatable: boolean; // se pode ser obtida mais de uma vez
  timesEarned: number; // quantas vezes foi obtida
}

// ── Revisão Inteligente ──────────────────────

export interface ReviewSuggestion {
  lessonId: string;
  lessonName: string;
  errorRate: number; // 0 a 1
}

// ── Respostas da API ─────────────────────────

// Envelope padrão de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Resposta de erro da API
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
