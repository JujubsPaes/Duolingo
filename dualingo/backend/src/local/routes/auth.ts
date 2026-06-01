/**
 * Rotas de autenticação — POST /auth/register, /auth/login, /auth/forgot-password, PUT /auth/profile
 * 
 * Localmente usa JWT simples + banco em memória.
 * Em produção, usa Cognito + DynamoDB.
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../database";
import { generateTokens, authMiddleware } from "../auth-middleware";

export const authRouter = Router();

// ── POST /auth/register ───────────────────────────────────────────────────────
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nome, email e senha são obrigatórios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve ter ao menos 6 caracteres.",
      });
    }

    // Verifica se o email já está cadastrado
    const existing = db.queryByField("email", email.toLowerCase());
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este email já está cadastrado.",
      });
    }

    // Cria o usuário
    const userId = db.generateId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    db.putItem({
      PK: `USER#${userId}`,
      SK: "PROFILE",
      userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword, // Em produção, o Cognito gerencia a senha
      xp: 0,
      level: 1,
      streak: 0,
      lastStudyDate: null,
      createdAt: now,
    });

    // Inicializa as conquistas do novo usuário
    seedUserAchievements(userId);

    return res.status(201).json({
      success: true,
      data: { message: "Cadastro realizado com sucesso!" },
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar conta." });
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios.",
      });
    }

    // Busca o usuário pelo email
    const users = db.queryByField("email", email.toLowerCase().trim());
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos.",
      });
    }

    const user = users[0];

    // Verifica a senha
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos.",
      });
    }

    // Gera os tokens JWT
    const tokens = generateTokens(user.userId, user.email, user.name);

    return res.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          lastStudyDate: user.lastStudyDate,
          role: user.role || "user",
        },
        tokens,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ success: false, message: "Erro ao fazer login." });
  }
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
authRouter.post("/forgot-password", (_req: Request, res: Response) => {
  // Localmente, apenas simula o envio (não envia email de verdade)
  return res.json({
    success: true,
    data: { message: "Se o email estiver cadastrado, você receberá as instruções." },
  });
});

// ── PUT /auth/profile (protegida) ─────────────────────────────────────────────
authRouter.put("/profile", authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, avatarUrl } = req.body;

    if (!name && !avatarUrl) {
      return res.status(400).json({
        success: false,
        message: "Informe ao menos um campo para atualizar.",
      });
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = name.trim();
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const updated = db.updateItem(`USER#${userId}`, "PROFILE", updates);

    if (!updated) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.json({
      success: true,
      data: {
        userId: updated.userId,
        name: updated.name,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
        xp: updated.xp,
        level: updated.level,
        streak: updated.streak,
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar perfil." });
  }
});

// ── Helper: Inicializa conquistas para um novo usuário ────────────────────────

function seedUserAchievements(userId: string) {
  const achievements = [
    { id: "first-lesson", name: "Primeira Lição", description: "Complete sua primeira lição no app.", icon: "🎯", reward: "+250 XP", xpReward: 250, repeatable: false },
    { id: "streak-7", name: "Semana Perfeita", description: "Mantenha um streak de 7 dias consecutivos.", icon: "🔥", reward: "+500 XP", xpReward: 500, repeatable: false },
    { id: "perfect-score", name: "Nota Máxima", description: "Acerte 100% dos exercícios em uma lição.", icon: "⭐", reward: "+300 XP", xpReward: 300, repeatable: true },
    { id: "module-complete", name: "Módulo Completo", description: "Conclua todas as lições de um módulo.", icon: "📚", reward: "+750 XP", xpReward: 750, repeatable: true },
    { id: "course-complete", name: "Curso Completo", description: "Conclua um curso inteiro.", icon: "🏆", reward: "+2500 XP", xpReward: 2500, repeatable: true },
  ];

  for (const a of achievements) {
    db.putItem({
      PK: `USER#${userId}`,
      SK: `ACHIEVEMENT#${a.id}`,
      userId,
      achievementId: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked: false,
      rewardClaimed: false,
      reward: a.reward,
      xpReward: a.xpReward,
      repeatable: a.repeatable,
      timesEarned: 0,
    });
  }
}
