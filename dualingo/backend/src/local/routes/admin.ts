/**
 * Rotas de administração — CRUD de cursos, módulos, lições, exercícios + relatórios.
 * 
 * Todas as rotas são protegidas por JWT (authMiddleware).
 * Em produção, seriam protegidas por Cognito Authorizer com role "admin".
 * 
 * Endpoints:
 *   POST/PUT/DELETE /admin/courses
 *   POST/PUT/DELETE /admin/modules
 *   POST/PUT/DELETE /admin/lessons
 *   POST/PUT/DELETE /admin/exercises
 *   GET /admin/reports
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const adminRouter = Router();

// Todas as rotas admin são protegidas
adminRouter.use(authMiddleware);

// ══════════════════════════════════════════════════════════════════════════════
// CURSOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/courses — Lista todos os cursos
adminRouter.get("/courses", (_req: Request, res: Response) => {
  try {
    const courses = db.queryBySK("METADATA")
      .filter((item) => item.PK.startsWith("COURSE#"))
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        courseId: c.courseId,
        name: c.name,
        description: c.description,
        order: c.order,
        imageUrl: c.imageUrl,
        createdAt: c.createdAt,
      }));

    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error("[admin] listCourses error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar cursos." });
  }
});

// POST /admin/courses — Criar curso
adminRouter.post("/courses", (req: Request, res: Response) => {
  try {
    const { name, description, order, imageUrl } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "Nome e descrição são obrigatórios." });
    }

    const courseId = db.generateId();
    const now = new Date().toISOString();

    const course = {
      PK: `COURSE#${courseId}`,
      SK: "METADATA",
      courseId,
      name: name.trim(),
      description: description.trim(),
      order: order ?? 0,
      imageUrl: imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    db.putItem(course);

    return res.status(201).json({ success: true, data: course, message: "Curso criado com sucesso." });
  } catch (err) {
    console.error("[admin] createCourse error:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar curso." });
  }
});

// PUT /admin/courses/:id — Editar curso
adminRouter.put("/courses/:id", (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const existing = db.getItem(`COURSE#${courseId}`, "METADATA");

    if (!existing) {
      return res.status(404).json({ success: false, message: "Curso não encontrado." });
    }

    const { name, description, order, imageUrl } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };

    if (name) updates.name = name.trim();
    if (description) updates.description = description.trim();
    if (order !== undefined) updates.order = order;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;

    const updated = db.updateItem(`COURSE#${courseId}`, "METADATA", updates);

    return res.json({ success: true, data: updated, message: "Curso atualizado." });
  } catch (err) {
    console.error("[admin] updateCourse error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar curso." });
  }
});

// DELETE /admin/courses/:id — Excluir curso (sem apagar progresso de usuários)
adminRouter.delete("/courses/:id", (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const existing = db.getItem(`COURSE#${courseId}`, "METADATA");

    if (!existing) {
      return res.status(404).json({ success: false, message: "Curso não encontrado." });
    }

    // Remove o curso
    db.deleteItem(`COURSE#${courseId}`, "METADATA");

    // Remove módulos associados (mas NUNCA progresso de usuários)
    const modules = db.queryItems(`COURSE#${courseId}`, "MODULE#");
    for (const mod of modules) {
      db.deleteItem(mod.PK, mod.SK);
    }

    return res.json({ success: true, message: "Curso excluído. Progresso dos alunos preservado." });
  } catch (err) {
    console.error("[admin] deleteCourse error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir curso." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/modules?courseId=xxx — Lista módulos de um curso
adminRouter.get("/modules", (req: Request, res: Response) => {
  try {
    const courseId = req.query.courseId as string;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId é obrigatório." });
    }

    const modules = db.queryItems(`COURSE#${courseId}`, "MODULE#")
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        moduleId: m.moduleId,
        courseId: m.courseId,
        name: m.name,
        order: m.order,
        createdAt: m.createdAt,
      }));

    return res.json({ success: true, data: modules });
  } catch (err) {
    console.error("[admin] listModules error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar módulos." });
  }
});

// POST /admin/modules — Criar módulo
adminRouter.post("/modules", (req: Request, res: Response) => {
  try {
    const { courseId, name, description, order } = req.body;

    if (!courseId || !name) {
      return res.status(400).json({ success: false, message: "courseId e name são obrigatórios." });
    }

    // Verifica se o curso existe
    const course = db.getItem(`COURSE#${courseId}`, "METADATA");
    if (!course) {
      return res.status(404).json({ success: false, message: "Curso não encontrado." });
    }

    const moduleId = db.generateId();
    const now = new Date().toISOString();

    const module = {
      PK: `COURSE#${courseId}`,
      SK: `MODULE#${moduleId}`,
      moduleId,
      courseId,
      name: name.trim(),
      description: (description || "").trim(),
      order: order ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    db.putItem(module);

    return res.status(201).json({ success: true, data: module, message: "Módulo criado." });
  } catch (err) {
    console.error("[admin] createModule error:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar módulo." });
  }
});

// PUT /admin/modules/:id — Editar módulo
adminRouter.put("/modules/:id", (req: Request, res: Response) => {
  try {
    const moduleId = req.params.id;
    const { courseId, name, description, order } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId é obrigatório no body." });
    }

    const existing = db.getItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Módulo não encontrado." });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (order !== undefined) updates.order = order;

    const updated = db.updateItem(`COURSE#${courseId}`, `MODULE#${moduleId}`, updates);

    return res.json({ success: true, data: updated, message: "Módulo atualizado." });
  } catch (err) {
    console.error("[admin] updateModule error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar módulo." });
  }
});

// DELETE /admin/modules/:id?courseId=xxx — Excluir módulo
adminRouter.delete("/modules/:id", (req: Request, res: Response) => {
  try {
    const moduleId = req.params.id;
    const courseId = req.query.courseId as string;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId é obrigatório." });
    }

    const existing = db.getItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Módulo não encontrado." });
    }

    db.deleteItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);

    // Remove lições do módulo
    const lessons = db.queryItems(`MODULE#${moduleId}`, "LESSON#");
    for (const lesson of lessons) {
      // Remove exercícios da lição
      const exercises = db.queryItems(`LESSON#${lesson.lessonId}`, "EXERCISE#");
      for (const ex of exercises) {
        db.deleteItem(ex.PK, ex.SK);
      }
      db.deleteItem(lesson.PK, lesson.SK);
    }

    return res.json({ success: true, message: "Módulo excluído com suas lições e exercícios." });
  } catch (err) {
    console.error("[admin] deleteModule error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir módulo." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// LIÇÕES
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/lessons?moduleId=xxx — Lista lições de um módulo
adminRouter.get("/lessons", (req: Request, res: Response) => {
  try {
    const moduleId = req.query.moduleId as string;
    if (!moduleId) {
      return res.status(400).json({ success: false, message: "moduleId é obrigatório." });
    }

    const lessons = db.queryItems(`MODULE#${moduleId}`, "LESSON#")
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        lessonId: l.lessonId,
        moduleId: l.moduleId,
        name: l.name,
        order: l.order,
        xpReward: l.xpReward,
        createdAt: l.createdAt,
      }));

    return res.json({ success: true, data: lessons });
  } catch (err) {
    console.error("[admin] listLessons error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar lições." });
  }
});

// POST /admin/lessons — Criar lição
adminRouter.post("/lessons", (req: Request, res: Response) => {
  try {
    const { moduleId, name, description, order, xpReward } = req.body;

    if (!moduleId || !name) {
      return res.status(400).json({ success: false, message: "moduleId e name são obrigatórios." });
    }

    const lessonId = db.generateId();
    const now = new Date().toISOString();

    const lesson = {
      PK: `MODULE#${moduleId}`,
      SK: `LESSON#${lessonId}`,
      lessonId,
      moduleId,
      name: name.trim(),
      description: (description || "").trim(),
      order: order ?? 0,
      xpReward: xpReward ?? 10,
      createdAt: now,
      updatedAt: now,
    };

    db.putItem(lesson);

    return res.status(201).json({ success: true, data: lesson, message: "Lição criada." });
  } catch (err) {
    console.error("[admin] createLesson error:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar lição." });
  }
});

// PUT /admin/lessons/:id — Editar lição
adminRouter.put("/lessons/:id", (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;
    const { moduleId, name, description, order, xpReward } = req.body;

    if (!moduleId) {
      return res.status(400).json({ success: false, message: "moduleId é obrigatório no body." });
    }

    const existing = db.getItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lição não encontrada." });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (name) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (order !== undefined) updates.order = order;
    if (xpReward !== undefined) updates.xpReward = xpReward;

    const updated = db.updateItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`, updates);

    return res.json({ success: true, data: updated, message: "Lição atualizada." });
  } catch (err) {
    console.error("[admin] updateLesson error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar lição." });
  }
});

// DELETE /admin/lessons/:id?moduleId=xxx — Excluir lição
adminRouter.delete("/lessons/:id", (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;
    const moduleId = req.query.moduleId as string;

    if (!moduleId) {
      return res.status(400).json({ success: false, message: "moduleId é obrigatório." });
    }

    const existing = db.getItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Lição não encontrada." });
    }

    db.deleteItem(`MODULE#${moduleId}`, `LESSON#${lessonId}`);

    // Remove exercícios da lição
    const exercises = db.queryItems(`LESSON#${lessonId}`, "EXERCISE#");
    for (const ex of exercises) {
      db.deleteItem(ex.PK, ex.SK);
    }

    return res.json({ success: true, message: "Lição excluída com seus exercícios." });
  } catch (err) {
    console.error("[admin] deleteLesson error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir lição." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// EXERCÍCIOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/exercises?lessonId=xxx — Lista exercícios de uma lição
adminRouter.get("/exercises", (req: Request, res: Response) => {
  try {
    const lessonId = req.query.lessonId as string;
    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lessonId é obrigatório." });
    }

    const exercises = db.queryItems(`LESSON#${lessonId}`, "EXERCISE#")
      .sort((a, b) => a.order - b.order)
      .map((e) => ({
        exerciseId: e.exerciseId,
        lessonId: e.lessonId,
        type: e.type,
        question: e.question,
        options: e.options,
        correctAnswerId: e.correctAnswerId,
        explanation: e.explanation,
        order: e.order,
        createdAt: e.createdAt,
      }));

    return res.json({ success: true, data: exercises });
  } catch (err) {
    console.error("[admin] listExercises error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar exercícios." });
  }
});

// POST /admin/exercises — Criar exercício
adminRouter.post("/exercises", (req: Request, res: Response) => {
  try {
    const { lessonId, type, question, options, correctAnswerId, explanation, order } = req.body;

    if (!lessonId || !type || !question || !options || !correctAnswerId) {
      return res.status(400).json({
        success: false,
        message: "lessonId, type, question, options e correctAnswerId são obrigatórios.",
      });
    }

    const exerciseId = db.generateId();
    const now = new Date().toISOString();

    const exercise = {
      PK: `LESSON#${lessonId}`,
      SK: `EXERCISE#${exerciseId}`,
      exerciseId,
      lessonId,
      type,
      question: question.trim(),
      options,
      correctAnswerId,
      explanation: explanation || null,
      order: order ?? 0,
      createdAt: now,
      updatedAt: now,
    };

    db.putItem(exercise);

    return res.status(201).json({ success: true, data: exercise, message: "Exercício criado." });
  } catch (err) {
    console.error("[admin] createExercise error:", err);
    return res.status(500).json({ success: false, message: "Erro ao criar exercício." });
  }
});

// PUT /admin/exercises/:id — Editar exercício
adminRouter.put("/exercises/:id", (req: Request, res: Response) => {
  try {
    const exerciseId = req.params.id;
    const { lessonId, type, question, options, correctAnswerId, explanation, order } = req.body;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lessonId é obrigatório no body." });
    }

    const existing = db.getItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Exercício não encontrado." });
    }

    const updates: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (type) updates.type = type;
    if (question) updates.question = question.trim();
    if (options) updates.options = options;
    if (correctAnswerId) updates.correctAnswerId = correctAnswerId;
    if (explanation !== undefined) updates.explanation = explanation;
    if (order !== undefined) updates.order = order;

    const updated = db.updateItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`, updates);

    return res.json({ success: true, data: updated, message: "Exercício atualizado." });
  } catch (err) {
    console.error("[admin] updateExercise error:", err);
    return res.status(500).json({ success: false, message: "Erro ao atualizar exercício." });
  }
});

// DELETE /admin/exercises/:id?lessonId=xxx — Excluir exercício
adminRouter.delete("/exercises/:id", (req: Request, res: Response) => {
  try {
    const exerciseId = req.params.id;
    const lessonId = req.query.lessonId as string;

    if (!lessonId) {
      return res.status(400).json({ success: false, message: "lessonId é obrigatório." });
    }

    const existing = db.getItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Exercício não encontrado." });
    }

    db.deleteItem(`LESSON#${lessonId}`, `EXERCISE#${exerciseId}`);

    return res.json({ success: true, message: "Exercício excluído." });
  } catch (err) {
    console.error("[admin] deleteExercise error:", err);
    return res.status(500).json({ success: false, message: "Erro ao excluir exercício." });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/reports — Métricas de uso da plataforma
adminRouter.get("/reports", (_req: Request, res: Response) => {
  try {
    const allItems = db.getAllItems();

    // Total de usuários
    const users = allItems.filter((i) => i.PK.startsWith("USER#") && i.SK === "PROFILE");
    const totalUsers = users.length;

    // Total de cursos, lições e exercícios
    const totalCourses = allItems.filter((i) => i.PK.startsWith("COURSE#") && i.SK === "METADATA").length;
    const totalLessons = allItems.filter((i) => i.SK.startsWith("LESSON#") && i.PK.startsWith("MODULE#")).length;
    const totalExercises = allItems.filter((i) => i.SK.startsWith("EXERCISE#") && i.PK.startsWith("LESSON#")).length;

    // Lições mais concluídas (do histórico)
    const history = allItems.filter((i) => i.SK.startsWith("HISTORY#"));
    const lessonCount: Record<string, number> = {};
    for (const h of history) {
      lessonCount[h.lessonId] = (lessonCount[h.lessonId] || 0) + 1;
    }

    // Busca nomes das lições
    const lessonItems = allItems.filter((i) => i.SK.startsWith("LESSON#") && i.PK.startsWith("MODULE#"));
    const lessonNameMap: Record<string, string> = {};
    for (const l of lessonItems) {
      lessonNameMap[l.lessonId] = l.name;
    }

    const mostCompletedLessons = Object.entries(lessonCount)
      .map(([lessonId, count]) => ({
        lessonId,
        lessonName: lessonNameMap[lessonId] || "Desconhecida",
        completionCount: count,
      }))
      .sort((a, b) => b.completionCount - a.completionCount)
      .slice(0, 10);

    // Top streak
    const topStreakUsers = users
      .filter((u) => u.streak > 0)
      .map((u) => ({ userId: u.userId, userName: u.name, streak: u.streak }))
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 10);

    // Taxa de acerto por exercício (baseado nos erros registrados)
    const errors = allItems.filter((i) => i.SK.startsWith("ERROR#"));
    const exerciseErrors: Record<string, { errors: number; attempts: number }> = {};
    for (const e of errors) {
      const exId = e.SK.replace("ERROR#", "");
      if (!exerciseErrors[exId]) exerciseErrors[exId] = { errors: 0, attempts: 0 };
      exerciseErrors[exId].errors += e.errorCount || 1;
      exerciseErrors[exId].attempts += e.totalAttempts || 1;
    }

    const exerciseItems = allItems.filter((i) => i.SK.startsWith("EXERCISE#") && i.PK.startsWith("LESSON#"));
    const exerciseQuestionMap: Record<string, string> = {};
    for (const ex of exerciseItems) {
      exerciseQuestionMap[ex.exerciseId] = ex.question;
    }

    const averageAccuracyByExercise = Object.entries(exerciseErrors)
      .map(([exerciseId, data]) => ({
        exerciseId,
        question: exerciseQuestionMap[exerciseId] || "Desconhecido",
        averageAccuracy: Math.round(((data.attempts - data.errors) / data.attempts) * 100),
      }))
      .sort((a, b) => a.averageAccuracy - b.averageAccuracy)
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalLessons,
        totalExercises,
        mostCompletedLessons,
        topStreakUsers,
        averageAccuracyByExercise,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[admin] reports error:", err);
    return res.status(500).json({ success: false, message: "Erro ao gerar relatórios." });
  }
});
