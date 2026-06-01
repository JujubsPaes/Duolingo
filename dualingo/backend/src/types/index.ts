// ─────────────────────────────────────────────────────────────────────────────
// Tipos do Backend — espelham o modelo de dados do DynamoDB
// ─────────────────────────────────────────────────────────────────────────────

// ── Usuário ───────────────────────────────────────────────────────────────────

export interface UserRecord {
  PK: string;           // USER#<userId>
  SK: string;           // PROFILE
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  streak: number;
  lastStudyDate?: string; // YYYY-MM-DD
  createdAt: string;
}

// ── Curso ─────────────────────────────────────────────────────────────────────

export interface CourseRecord {
  PK: string;           // COURSE#<courseId>
  SK: string;           // METADATA
  courseId: string;
  name: string;
  description: string;
  imageUrl?: string;
  order: number;
}

// ── Módulo ────────────────────────────────────────────────────────────────────

export interface ModuleRecord {
  PK: string;           // COURSE#<courseId>
  SK: string;           // MODULE#<moduleId>
  moduleId: string;
  courseId: string;
  name: string;
  order: number;
}

// ── Lição ─────────────────────────────────────────────────────────────────────

export interface LessonRecord {
  PK: string;           // MODULE#<moduleId>
  SK: string;           // LESSON#<lessonId>
  lessonId: string;
  moduleId: string;
  name: string;
  order: number;
  xpReward: number;
}

// ── Exercício ─────────────────────────────────────────────────────────────────

export type ExerciseType = "multiple_choice" | "true_false";

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface ExerciseRecord {
  PK: string;           // LESSON#<lessonId>
  SK: string;           // EXERCISE#<exerciseId>
  exerciseId: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  prompt?: string;
  imageUrl?: string;
  // Opções para múltipla escolha (ausente em true_false)
  options?: ExerciseOption[];
  // Resposta correta: ID da opção (múltipla escolha) ou "true"/"false"
  correctAnswerId: string;
  explanation?: string;
  order: number;
}

// ── Progresso ─────────────────────────────────────────────────────────────────

export interface ProgressRecord {
  PK: string;           // USER#<userId>
  SK: string;           // PROGRESS#<courseId>
  userId: string;
  courseId: string;
  currentModuleId: string;
  currentLessonId: string;
  xpAccumulated: number;
  percentComplete: number;
  updatedAt: string;
}

// ── Histórico de lição ────────────────────────────────────────────────────────

export interface HistoryRecord {
  PK: string;           // USER#<userId>
  SK: string;           // HISTORY#<timestamp>
  userId: string;
  lessonId: string;
  completedAt: string;  // ISO timestamp
  correctAnswers: number;
  wrongAnswers: number;
  xpEarned: number;
}

// ── Conquista ─────────────────────────────────────────────────────────────────

export interface AchievementRecord {
  PK: string;           // USER#<userId>
  SK: string;           // ACHIEVEMENT#<achievementId>
  userId: string;
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rewardClaimed: boolean;
  unlockedAt?: string;
  reward: string;       // ex: "+50 XP"
  xpReward: number;     // valor numérico para somar ao XP
  repeatable: boolean;  // se pode ser obtida mais de uma vez
  timesEarned: number;  // quantas vezes foi obtida (para conquistas repetíveis)
}

// ── Erro recorrente (revisão inteligente) ─────────────────────────────────────

export interface ErrorRecord {
  PK: string;           // USER#<userId>
  SK: string;           // ERROR#<exerciseId>
  userId: string;
  exerciseId: string;
  lessonId: string;
  errorCount: number;   // total de erros neste exercício
  totalAttempts: number;
  lastErrorAt: string;  // ISO timestamp
}

// ── Respostas da API ──────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Payload do token JWT do Cognito (claims)
export interface CognitoClaims {
  sub: string;          // userId
  email: string;
  "cognito:username": string;
}
