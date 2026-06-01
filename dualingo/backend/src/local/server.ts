/**
 * Servidor Express local que emula o API Gateway + Lambda.
 * 
 * Permite rodar o backend localmente sem depender da AWS.
 * Todas as rotas espelham exatamente o serverless.yml.
 * 
 * Para rodar: npm run dev:local
 * 
 * Em produção, o deploy é feito via Serverless Framework na AWS.
 * Este servidor é apenas para desenvolvimento local.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Carrega variáveis de ambiente do .env
dotenv.config();

// Importa os handlers das rotas
import { authRouter } from "./routes/auth";
import { coursesRouter } from "./routes/courses";
import { lessonsRouter } from "./routes/lessons";
import { progressRouter } from "./routes/progress";
import { gamificationRouter, getHistory } from "./routes/gamification";
import { reviewRouter } from "./routes/review";
import { adminRouter } from "./routes/admin";
import { seedLocalDatabase } from "./seed-local";
import { authMiddleware } from "./auth-middleware";

// Popula o banco em memória com os dados dos cursos
seedLocalDatabase();

const app = express();
const PORT = process.env.PORT ?? 3001;

// Middlewares globais
app.use(cors()); // Permite requisições do Expo (qualquer origem em dev)
app.use(express.json()); // Parse do body JSON

// Health check — útil para verificar se o servidor está rodando
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Rotas de debug (apenas desenvolvimento) ───────────────────────────────────
// Acesse http://localhost:3001/dev/users para ver todos os usuários cadastrados
app.get("/dev/users", (_req, res) => {
  const { getAllItems } = require("./database");
  const allItems = getAllItems();
  const users = allItems
    .filter((item: any) => item.SK === "PROFILE")
    .map((u: any) => ({
      userId: u.userId,
      name: u.name,
      email: u.email,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      createdAt: u.createdAt,
    }));

  res.json({ total: users.length, users });
});

// Acesse http://localhost:3001/dev/db para ver TODOS os dados do banco
app.get("/dev/db", (_req, res) => {
  const { getAllItems } = require("./database");
  const allItems = getAllItems();
  res.json({ total: allItems.length, items: allItems });
});

// POST /dev/sync-user — Sincroniza XP/streak/level do debug panel com o banco
app.post("/dev/sync-user", authMiddleware, (req, res) => {
  const db = require("./database");
  const userId = (req as any).userId;
  const { xp, level, streak, lastStudyDate } = req.body;

  const updates: Record<string, any> = {};
  if (xp !== undefined) updates.xp = xp;
  if (level !== undefined) updates.level = level;
  if (streak !== undefined) updates.streak = streak;
  if (lastStudyDate !== undefined) updates.lastStudyDate = lastStudyDate;

  const updated = db.updateItem(`USER#${userId}`, "PROFILE", updates);

  if (!updated) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  return res.json({ success: true, data: { xp: updated.xp, level: updated.level, streak: updated.streak } });
});

// Rotas da API (espelham o serverless.yml)
app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/lessons", lessonsRouter);
app.use("/progress", progressRouter);
app.use("/gamification", gamificationRouter);
app.use("/review", reviewRouter);
app.use("/admin", adminRouter);
// Rota de histórico fica no nível raiz (como no serverless.yml)
app.get("/history", authMiddleware, (req, res) => getHistory(req, res));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Backend Dualingo rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📌 Rotas disponíveis:`);
  console.log(`   POST /auth/register`);
  console.log(`   POST /auth/login`);
  console.log(`   POST /auth/forgot-password`);
  console.log(`   PUT  /auth/profile`);
  console.log(`   GET  /courses`);
  console.log(`   GET  /courses/:id`);
  console.log(`   GET  /courses/:id/modules/:moduleId`);
  console.log(`   POST /courses/:id/start`);
  console.log(`   GET  /lessons/:id`);
  console.log(`   POST /lessons/:id/complete`);
  console.log(`   POST /lessons/:id/repeat`);
  console.log(`   GET  /progress`);
  console.log(`   GET  /progress/:courseId`);
  console.log(`   GET  /gamification`);
  console.log(`   POST /gamification/achievements/:id/claim`);
  console.log(`   GET  /history`);
  console.log(`   GET  /review/suggestions`);
  console.log(`   GET  /review/exercises`);
  console.log(`   ── Admin ──`);
  console.log(`   GET/POST       /admin/courses`);
  console.log(`   PUT/DELETE     /admin/courses/:id`);
  console.log(`   GET/POST       /admin/modules`);
  console.log(`   PUT/DELETE     /admin/modules/:id`);
  console.log(`   GET/POST       /admin/lessons`);
  console.log(`   PUT/DELETE     /admin/lessons/:id`);
  console.log(`   GET/POST       /admin/exercises`);
  console.log(`   PUT/DELETE     /admin/exercises/:id`);
  console.log(`   GET            /admin/reports\n`);
});

export default app;
