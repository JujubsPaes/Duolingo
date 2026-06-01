/**
 * Rotas de gamificação — GET /gamification, POST /gamification/achievements/:id/claim, GET /history
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const gamificationRouter = Router();

gamificationRouter.use(authMiddleware);

// ── GET /gamification ─────────────────────────────────────────────────────────
gamificationRouter.get("/", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // Busca o perfil do usuário
    const user = db.getItem(`USER#${userId}`, "PROFILE");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    // Busca as conquistas
    const achievements = db.queryItems(`USER#${userId}`, "ACHIEVEMENT#")
      .map((a) => ({
        achievementId: a.achievementId,
        name: a.name,
        description: a.description,
        icon: a.icon,
        unlocked: a.unlocked,
        rewardClaimed: a.rewardClaimed,
        unlockedAt: a.unlockedAt,
        reward: a.reward,
        repeatable: a.repeatable ?? false,
        timesEarned: a.timesEarned ?? 0,
      }));

    return res.json({
      success: true,
      data: {
        userId: user.userId,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastStudyDate: user.lastStudyDate,
        name: user.name,
        role: user.role || "user",
        achievements,
      },
    });
  } catch (err) {
    console.error("getGamification error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar gamificação." });
  }
});

// ── POST /gamification/achievements/:id/unlock ────────────────────────────────
// Chamado pelo frontend quando uma conquista é desbloqueada localmente
gamificationRouter.post("/achievements/:id/unlock", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const achievementId = req.params.id;

    const achievement = db.getItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`);
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Conquista não encontrada." });
    }

    // Desbloqueia (ou incrementa se repetível)
    const now = new Date().toISOString();
    if (!achievement.unlocked || achievement.repeatable) {
      db.updateItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`, {
        unlocked: true,
        unlockedAt: now,
        timesEarned: (achievement.timesEarned ?? 0) + 1,
      });
    }

    return res.json({
      success: true,
      data: { message: "Conquista desbloqueada.", achievementId },
    });
  } catch (err) {
    console.error("unlockAchievement error:", err);
    return res.status(500).json({ success: false, message: "Erro ao desbloquear conquista." });
  }
});

// ── POST /gamification/achievements/:id/claim ─────────────────────────────────
gamificationRouter.post("/achievements/:id/claim", (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const achievementId = req.params.id;

    const achievement = db.getItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`);
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Conquista não encontrada." });
    }

    if (!achievement.unlocked) {
      return res.status(400).json({ success: false, message: "Conquista ainda não desbloqueada." });
    }

    if (achievement.rewardClaimed) {
      return res.status(400).json({ success: false, message: "Recompensa já resgatada." });
    }

    // Marca como resgatada
    db.updateItem(`USER#${userId}`, `ACHIEVEMENT#${achievementId}`, {
      rewardClaimed: true,
    });

    // Adiciona XP ao perfil
    const user = db.getItem(`USER#${userId}`, "PROFILE");
    if (user) {
      const newXP = user.xp + achievement.xpReward;
      db.updateItem(`USER#${userId}`, "PROFILE", {
        xp: newXP,
        level: calculateLevel(newXP),
      });
    }

    return res.json({
      success: true,
      data: {
        message: `Recompensa resgatada: ${achievement.reward}`,
        xpEarned: achievement.xpReward,
      },
    });
  } catch (err) {
    console.error("claimAchievement error:", err);
    return res.status(500).json({ success: false, message: "Erro ao resgatar recompensa." });
  }
});

// ── GET /history ──────────────────────────────────────────────────────────────
gamificationRouter.get("/history", (req: Request, res: Response) => {
  // Rota alternativa: /history (sem /gamification prefix)
  return getHistory(req, res);
});

// Também responde em /gamification/history (caso o router seja montado em /history)
function getHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const history = db.queryItems(`USER#${userId}`, "HISTORY#")
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 50)
      .map((h) => ({
        lessonId: h.lessonId,
        completedAt: h.completedAt,
        correctAnswers: h.correctAnswers,
        wrongAnswers: h.wrongAnswers,
        xpEarned: h.xpEarned,
      }));

    return res.json({ success: true, data: history });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar histórico." });
  }
}

// Exporta getHistory para uso na rota /history no nível raiz
export { getHistory };

function calculateLevel(xp: number): number {
  if (xp <= 1000) return 1;
  if (xp <= 2500) return 2;
  if (xp <= 5000) return 3;
  if (xp <= 10000) return 4;
  return 5;
}
