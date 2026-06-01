/**
 * achievementStore — Sistema de conquistas do app.
 *
 * Cada conquista tem condições pra desbloquear (ex: completar 1 lição, streak de 7 dias).
 * Quando desbloqueada, aparece um modal bonito e o aluno pode resgatar XP como recompensa.
 * As conquistas são sincronizadas com o backend pra nao perder se trocar de dispositivo.
 */

import { create } from "zustand";
import type { Achievement } from "../types";
import * as progressService from "../services/progressService";

export const ACHIEVEMENT_XP: Record<string, number> = {
  "first-lesson": 250,
  "streak-7": 500,
  "perfect-score": 300,
  "module-complete": 750,
  "course-complete": 2500,
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    achievementId: "first-lesson",
    name: "Primeira Lição",
    description: "Complete sua primeira lição no app.",
    icon: "🎯",
    unlocked: false,
    rewardClaimed: false,
    reward: `+${ACHIEVEMENT_XP["first-lesson"]} XP`,
    repeatable: false,
    timesEarned: 0,
  },
  {
    achievementId: "streak-7",
    name: "Semana Perfeita",
    description: "Mantenha um streak de 7 dias consecutivos.",
    icon: "🔥",
    unlocked: false,
    rewardClaimed: false,
    reward: `+${ACHIEVEMENT_XP["streak-7"]} XP`,
    repeatable: false,
    timesEarned: 0,
  },
  {
    achievementId: "perfect-score",
    name: "Nota Máxima",
    description: "Acerte 100% dos exercícios em uma lição.",
    icon: "⭐",
    unlocked: false,
    rewardClaimed: false,
    reward: `+${ACHIEVEMENT_XP["perfect-score"]} XP`,
    repeatable: false,
    timesEarned: 0,
  },
  {
    achievementId: "module-complete",
    name: "Módulo Completo",
    description: "Conclua todas as lições de um módulo.",
    icon: "📚",
    unlocked: false,
    rewardClaimed: false,
    reward: `+${ACHIEVEMENT_XP["module-complete"]} XP`,
    repeatable: false,
    timesEarned: 0,
  },
  {
    achievementId: "course-complete",
    name: "Curso Completo",
    description: "Conclua um curso inteiro.",
    icon: "🏆",
    unlocked: false,
    rewardClaimed: false,
    reward: `+${ACHIEVEMENT_XP["course-complete"]} XP`,
    repeatable: false,
    timesEarned: 0,
  },
];

interface AchievementState {
  achievements: Achievement[];
  newlyUnlocked: Achievement | null;
  unlock: (achievementId: string) => boolean;
  /** Desbloqueia conquistas ligadas ao streak (ex.: Semana Perfeita em 7+ dias) */
  checkStreakAchievements: (streak: number) => void;
  claimReward: (achievementId: string) => number;
  clearNewlyUnlocked: () => void;
  hydrateFromApi: (achievements: Achievement[]) => void;
  reset: () => void;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: DEFAULT_ACHIEVEMENTS,
  newlyUnlocked: null,

  unlock: (achievementId) => {
    const current = get().achievements.find((a) => a.achievementId === achievementId);
    if (!current || current.unlocked) return false;

    const updated: Achievement = {
      ...current,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
      timesEarned: 1,
    };

    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.achievementId === achievementId ? updated : a
      ),
      newlyUnlocked: updated,
    }));

    // Persiste o desbloqueio no backend
    progressService.unlockAchievement(achievementId).catch((err) => {
      console.warn("[Achievement] Erro ao salvar desbloqueio no backend:", err?.message);
    });

    return true;
  },

  checkStreakAchievements: (streak) => {
    if (streak >= 7) {
      get().unlock("streak-7");
    }
  },

  claimReward: (achievementId) => {
    const achievement = get().achievements.find((a) => a.achievementId === achievementId);
    if (!achievement || !achievement.unlocked || achievement.rewardClaimed) return 0;

    const xpGained = ACHIEVEMENT_XP[achievementId] ?? 0;

    set((state) => ({
      achievements: state.achievements.map((a) =>
        a.achievementId === achievementId ? { ...a, rewardClaimed: true } : a
      ),
    }));

    return xpGained;
  },

  clearNewlyUnlocked: () => set({ newlyUnlocked: null }),

  hydrateFromApi: (achievements) => set({ achievements }),

  reset: () =>
    set({ achievements: DEFAULT_ACHIEVEMENTS, newlyUnlocked: null }),
}));
