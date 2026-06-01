/**
 * Store de gamificação usando Context API + useReducer.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { GamificationState, LessonResult, XPBreakdown } from "../types/gamification";
import { LEVEL_THRESHOLDS } from "../types/gamification";
import { useUserStore } from "./userStore";
import { useAchievementStore } from "./achievementStore";
import { toLocalDateString } from "../utils/date";

export function calculateLevel(xp: number): number {
  for (const [lvl, range] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= range.min && xp <= range.max) return Number(lvl);
  }
  return 5;
}

export function getLevelRange(level: number): { min: number; max: number } {
  const key = Math.floor(level);
  return LEVEL_THRESHOLDS[key] ?? { min: 0, max: 999 };
}

export function calculateXPGain(result: LessonResult): XPBreakdown {
  const accuracyPercent =
    result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0;

  const base = Math.round(
    (result.correctAnswers / Math.max(result.totalQuestions, 1)) * 1000
  );
  const streakBonus =
    result.streakDays > 0 && result.streakDays % 7 === 0 ? 500 : 0;

  return {
    base,
    streakBonus,
    total: base + streakBonus,
    accuracyPercent,
  };
}

/** Calcula streak após um dia de estudo aprovado. Sem limite máximo. */
export function updateStreak(
  currentStreak: number,
  lastStudyDate: string | null
): number {
  const today = toLocalDateString();

  if (!lastStudyDate) return 1;
  if (lastStudyDate === today) return currentStreak;

  const last = new Date(`${lastStudyDate}T12:00:00`);
  const now = new Date(`${today}T12:00:00`);
  const diffDays = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

function syncUserStore(state: GamificationState) {
  useUserStore.getState().hydrateFromGamification({
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    achievements: [],
  });
  useAchievementStore.getState().checkStreakAchievements(state.streak);
}

type Action =
  | { type: "ADD_XP"; payload: number }
  | { type: "COMPLETE_LESSON"; payload: LessonResult & { streakDays: number } }
  | { type: "SET_STREAK"; payload: number }
  | { type: "ADVANCE_STREAK_DEBUG"; payload: number }
  | { type: "HYDRATE"; payload: Partial<GamificationState> }
  | { type: "RESET" };

const initialState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  studiedDays: [],
};

function gamificationReducer(
  state: GamificationState,
  action: Action
): GamificationState {
  switch (action.type) {
    case "ADD_XP": {
      const newXP = state.xp + action.payload;
      return {
        ...state,
        xp: newXP,
        level: calculateLevel(newXP),
      };
    }

    case "COMPLETE_LESSON": {
      const breakdown = calculateXPGain(action.payload);
      const newXP = state.xp + breakdown.total;
      const today = toLocalDateString();
      const newStreak = action.payload.streakDays;
      const studiedDays = state.studiedDays.includes(today)
        ? state.studiedDays
        : [...state.studiedDays, today];

      return {
        xp: newXP,
        level: calculateLevel(newXP),
        streak: newStreak,
        lastStudyDate: today,
        studiedDays,
      };
    }

    case "SET_STREAK":
      return { ...state, streak: action.payload };

    case "ADVANCE_STREAK_DEBUG": {
      const days = Math.max(1, action.payload);
      const today = toLocalDateString();
      let newStreak = state.streak;
      let newXP = state.xp;

      for (let i = 0; i < days; i++) {
        newStreak += 1;
        const bonusXP = newStreak > 0 && newStreak % 7 === 0 ? 500 : 0;
        newXP += 10 + bonusXP;
      }

      const studiedDays = state.studiedDays.includes(today)
        ? state.studiedDays
        : [...state.studiedDays, today];

      return {
        ...state,
        streak: newStreak,
        xp: newXP,
        level: calculateLevel(newXP),
        lastStudyDate: today,
        studiedDays,
      };
    }

    case "RESET":
      return initialState;

    case "HYDRATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

interface GamificationContextValue {
  state: GamificationState;
  completeLesson: (result: LessonResult) => XPBreakdown;
  addXP: (amount: number) => void;
  setStreak: (streak: number) => void;
  /** Debug: +N dias de streak e XP proporcional (10 + bônus 500 a cada 7 dias) */
  advanceStreakDay: (days?: number) => void;
  /** Hidrata o estado com dados do backend (chamado após login) */
  hydrate: (data: Partial<GamificationState>) => void;
  reset: () => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);

  const completeLesson = useCallback(
    (result: LessonResult): XPBreakdown => {
      const today = toLocalDateString();
      const newStreak = updateStreak(state.streak, state.lastStudyDate);
      const breakdown = calculateXPGain({ ...result, streakDays: newStreak });
      const newXP = state.xp + breakdown.total;

      dispatch({
        type: "COMPLETE_LESSON",
        payload: { ...result, streakDays: newStreak },
      });

      const studiedDays = state.studiedDays.includes(today)
        ? state.studiedDays
        : [...state.studiedDays, today];

      syncUserStore({
        xp: newXP,
        level: calculateLevel(newXP),
        streak: newStreak,
        lastStudyDate: today,
        studiedDays,
      });

      return breakdown;
    },
    [state.xp, state.streak, state.lastStudyDate, state.studiedDays]
  );

  const addXP = useCallback(
    (amount: number) => {
      dispatch({ type: "ADD_XP", payload: amount });
      const newXP = state.xp + amount;
      syncUserStore({
        xp: newXP,
        level: calculateLevel(newXP),
        streak: useUserStore.getState().streak,
        lastStudyDate: state.lastStudyDate,
        studiedDays: state.studiedDays,
      });
    },
    [state.xp, state.lastStudyDate, state.studiedDays]
  );

  const setStreak = useCallback(
    (streak: number) => {
      dispatch({ type: "SET_STREAK", payload: streak });
      syncUserStore({
        ...state,
        streak,
      });
    },
    [state]
  );

  const advanceStreakDay = useCallback(
    (days = 1) => {
      const count = Math.max(1, days);
      dispatch({ type: "ADVANCE_STREAK_DEBUG", payload: count });

      const today = toLocalDateString();
      let newStreak = state.streak;
      let newXP = state.xp;
      for (let i = 0; i < count; i++) {
        newStreak += 1;
        const bonusXP = newStreak > 0 && newStreak % 7 === 0 ? 500 : 0;
        newXP += 10 + bonusXP;
      }
      const studiedDays = state.studiedDays.includes(today)
        ? state.studiedDays
        : [...state.studiedDays, today];

      syncUserStore({
        xp: newXP,
        level: calculateLevel(newXP),
        streak: newStreak,
        lastStudyDate: today,
        studiedDays,
      });
    },
    [state]
  );

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    syncUserStore(initialState);
  }, []);

  const hydrate = useCallback((data: Partial<GamificationState>) => {
    dispatch({ type: "HYDRATE", payload: data });
  }, []);

  return (
    <GamificationContext.Provider
      value={{ state, completeLesson, addXP, setStreak, advanceStreakDay, hydrate, reset }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification(): GamificationContextValue {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error("useGamification deve ser usado dentro de GamificationProvider");
  }
  return ctx;
}
