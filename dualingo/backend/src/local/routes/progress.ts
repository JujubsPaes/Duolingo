/**
 * Rotas de progresso — GET /progress, GET /progress/:courseId
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const progressRouter = Router();

progressRouter.use(authMiddleware);

// ── GET /progress ─────────────────────────────────────────────────────────────
progressRouter.get("/", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Busca todo o progresso do usuário
    const progress = db.queryItems(`USER#${userId}`, "PROGRESS#")
      .map((p) => ({
        userId: p.userId,
        courseId: p.courseId,
        currentModuleId: p.currentModuleId,
        currentLessonId: p.currentLessonId,
        xpAccumulated: p.xpAccumulated,
        percentComplete: p.percentComplete,
      }));

    return res.json({ success: true, data: progress });
  } catch (err) {
    console.error("getProgress error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar progresso." });
  }
});

// ── GET /progress/:courseId ────────────────────────────────────────────────────
progressRouter.get("/:courseId", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const courseId = req.params.courseId;

    const progress = db.getItem(`USER#${userId}`, `PROGRESS#${courseId}`);

    if (!progress) {
      return res.status(404).json({ success: false, message: "Progresso não encontrado." });
    }

    return res.json({
      success: true,
      data: {
        userId: progress.userId,
        courseId: progress.courseId,
        currentModuleId: progress.currentModuleId,
        currentLessonId: progress.currentLessonId,
        xpAccumulated: progress.xpAccumulated,
        percentComplete: progress.percentComplete,
      },
    });
  } catch (err) {
    console.error("getCourseProgress error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar progresso do curso." });
  }
});
