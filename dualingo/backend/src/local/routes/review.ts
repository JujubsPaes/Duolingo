/**
 * Rotas de revisão inteligente — GET /review/suggestions, GET /review/exercises
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const reviewRouter = Router();

reviewRouter.use(authMiddleware);

const MIN_ERROR_RATE = 0.5;
const MIN_ERROR_COUNT = 3;
const MAX_REVIEW_EXERCISES = 10;

// ── GET /review/suggestions ───────────────────────────────────────────────────
reviewRouter.get("/suggestions", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Busca todos os erros do usuário
    const errors = db.queryItems(`USER#${userId}`, "ERROR#");

    // Filtra exercícios frágeis
    const fragile = errors.filter((e) => {
      const errorRate = e.errorCount / e.totalAttempts;
      return errorRate > MIN_ERROR_RATE && e.errorCount >= MIN_ERROR_COUNT;
    });

    if (fragile.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Agrupa por lição
    const lessonErrorMap = new Map<string, { errorCount: number; totalAttempts: number }>();

    for (const err of fragile) {
      const existing = lessonErrorMap.get(err.lessonId) ?? { errorCount: 0, totalAttempts: 0 };
      lessonErrorMap.set(err.lessonId, {
        errorCount: existing.errorCount + err.errorCount,
        totalAttempts: existing.totalAttempts + err.totalAttempts,
      });
    }

    // Busca nomes das lições
    const suggestions = [];
    for (const [lessonId, stats] of lessonErrorMap.entries()) {
      const lessons = db.queryBySK(`LESSON#${lessonId}`);
      const lesson = lessons[0];
      if (!lesson) continue;

      suggestions.push({
        lessonId,
        lessonName: lesson.name,
        errorRate: stats.errorCount / stats.totalAttempts,
      });
    }

    suggestions.sort((a, b) => b.errorRate - a.errorRate);

    return res.json({ success: true, data: suggestions });
  } catch (err) {
    console.error("getReviewSuggestions error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar sugestões." });
  }
});

// ── GET /review/exercises ─────────────────────────────────────────────────────
reviewRouter.get("/exercises", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const errors = db.queryItems(`USER#${userId}`, "ERROR#");

    const fragile = errors
      .filter((e) => e.errorCount / e.totalAttempts > MIN_ERROR_RATE && e.errorCount >= MIN_ERROR_COUNT)
      .sort((a, b) => b.errorCount / b.totalAttempts - a.errorCount / a.totalAttempts)
      .slice(0, MAX_REVIEW_EXERCISES);

    if (fragile.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const exercises = [];
    for (const err of fragile) {
      const ex = db.getItem(`LESSON#${err.lessonId}`, `EXERCISE#${err.exerciseId}`);
      if (!ex) continue;

      exercises.push({
        exerciseId: ex.exerciseId,
        lessonId: ex.lessonId,
        type: ex.type,
        question: ex.question,
        prompt: ex.prompt,
        options: ex.options,
        correctAnswerId: ex.correctAnswerId,
        explanation: ex.explanation,
      });
    }

    return res.json({ success: true, data: exercises });
  } catch (err) {
    console.error("getReviewExercises error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar exercícios de revisão." });
  }
});
