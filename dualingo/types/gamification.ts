/**
 * Tipos relacionados ao sistema de gamificação (XP, nível, streak).
 */

/** Estado completo de gamificação do usuário */
export interface GamificationState {
  xp: number;         // XP total acumulado
  level: number;      // Nível atual calculado com base no XP
  streak: number;     // Dias consecutivos de estudo
  lastStudyDate: string | null; // ISO date da última lição concluída
  /** Dias em que o usuário estudou (YYYY-MM-DD, horário local) */
  studiedDays: string[];
}

/** Resultado de uma lição concluída, usado para calcular o XP ganho */
export interface LessonResult {
  correctAnswers: number; // Quantidade de respostas corretas
  totalQuestions: number; // Total de questões da lição
  streakDays: number;     // Streak atual do usuário no momento da conclusão
}

/** Detalhamento do XP ganho em uma lição */
export interface XPBreakdown {
  base: number;          // XP proporcional ao acerto (acertos/total × 1000)
  streakBonus: number;   // +500 se streak >= 7 dias
  total: number;         // Soma final
  accuracyPercent: number; // Percentual de acerto (0–100)
}

/**
 * Thresholds de XP para cada nível.
 * Conforme a user story:
 * - N1: 0 – 1000 XP
 * - N2: 1001 – 2500 XP
 * - N3: 2501 – 5000 XP
 * - N4: 5001 – 10000 XP
 * - N5: 10001+
 */
export const LEVEL_THRESHOLDS: Record<number, { min: number; max: number }> = {
  1: { min: 0,     max: 1000  },
  2: { min: 1001,  max: 2500  },
  3: { min: 2501,  max: 5000  },
  4: { min: 5001,  max: 10000 },
  5: { min: 10001, max: Infinity },
};
