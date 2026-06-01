/**
 * Rotas de cursos — GET /courses, GET /courses/:id, GET /courses/:id/modules/:moduleId, POST /courses/:id/start
 */

import { Router, Request, Response } from "express";
import db from "../database";
import { authMiddleware } from "../auth-middleware";

export const coursesRouter = Router();

// Todas as rotas de cursos são protegidas
coursesRouter.use(authMiddleware);

// ── GET /courses ──────────────────────────────────────────────────────────────
coursesRouter.get("/", (_req: Request, res: Response) => {
  try {
    // Busca todos os cursos (SK = "METADATA")
    const courses = db.queryBySK("METADATA")
      .filter((item) => item.PK.startsWith("COURSE#"))
      .sort((a, b) => a.order - b.order)
      .map((c) => ({
        courseId: c.courseId,
        name: c.name,
        description: c.description,
        imageUrl: c.imageUrl,
        order: c.order,
      }));

    return res.json({ success: true, data: courses });
  } catch (err) {
    console.error("listCourses error:", err);
    return res.status(500).json({ success: false, message: "Erro ao listar cursos." });
  }
});

// ── GET /courses/:id ──────────────────────────────────────────────────────────
coursesRouter.get("/:id", (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const course = db.getItem(`COURSE#${courseId}`, "METADATA");

    if (!course) {
      return res.status(404).json({ success: false, message: "Curso não encontrado." });
    }

    // Busca os módulos do curso
    const modules = db.queryItems(`COURSE#${courseId}`, "MODULE#")
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        moduleId: m.moduleId,
        courseId: m.courseId,
        name: m.name,
        order: m.order,
      }));

    return res.json({
      success: true,
      data: {
        courseId: course.courseId,
        name: course.name,
        description: course.description,
        imageUrl: course.imageUrl,
        order: course.order,
        modules,
      },
    });
  } catch (err) {
    console.error("getCourse error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar curso." });
  }
});

// ── GET /courses/:id/modules/:moduleId ────────────────────────────────────────
coursesRouter.get("/:id/modules/:moduleId", (req: Request, res: Response) => {
  try {
    const { id: courseId, moduleId } = req.params;
    const userId = (req as any).userId;

    // Busca o módulo
    const module = db.getItem(`COURSE#${courseId}`, `MODULE#${moduleId}`);
    if (!module) {
      return res.status(404).json({ success: false, message: "Módulo não encontrado." });
    }

    // Busca as lições do módulo
    const lessons = db.queryItems(`MODULE#${moduleId}`, "LESSON#")
      .sort((a, b) => a.order - b.order);

    // Busca o progresso do usuário neste curso
    const progress = db.getItem(`USER#${userId}`, `PROGRESS#${courseId}`);

    // Busca o histórico de lições completadas pelo usuário
    const history = db.queryItems(`USER#${userId}`, "HISTORY#");
    const completedLessonIds = new Set(history.map((h) => h.lessonId));

    // Calcula o status de cada lição baseado no histórico real
    const lessonsWithStatus = lessons.map((lesson, index) => {
      let status: "locked" | "available" | "completed" = "locked";

      if (completedLessonIds.has(lesson.lessonId)) {
        // Lição já foi completada pelo usuário
        status = "completed";
      } else if (index === 0 && !progress) {
        // Primeira lição do módulo e usuário ainda não iniciou o curso
        status = "available";
      } else if (index === 0 && progress) {
        // Primeira lição do módulo — disponível se o módulo anterior foi concluído
        // ou se é o primeiro módulo
        const allModules = db.queryItems(`COURSE#${courseId}`, "MODULE#")
          .sort((a, b) => a.order - b.order);
        const currentModuleIndex = allModules.findIndex((m) => m.moduleId === moduleId);

        if (currentModuleIndex === 0) {
          status = "available";
        } else {
          // Verifica se todas as lições do módulo anterior foram completadas
          const prevModule = allModules[currentModuleIndex - 1];
          if (prevModule) {
            const prevLessons = db.queryItems(`MODULE#${prevModule.moduleId}`, "LESSON#");
            const allPrevCompleted = prevLessons.every((l) => completedLessonIds.has(l.lessonId));
            status = allPrevCompleted ? "available" : "locked";
          }
        }
      } else {
        // Lições seguintes: disponível se a anterior foi completada
        const prevLesson = lessons[index - 1];
        if (prevLesson && completedLessonIds.has(prevLesson.lessonId)) {
          status = "available";
        }
      }

      return {
        lessonId: lesson.lessonId,
        moduleId: lesson.moduleId,
        name: lesson.name,
        order: lesson.order,
        xpReward: lesson.xpReward,
        status,
      };
    });

    return res.json({
      success: true,
      data: {
        moduleId: module.moduleId,
        courseId: module.courseId,
        name: module.name,
        order: module.order,
        lessons: lessonsWithStatus,
      },
    });
  } catch (err) {
    console.error("getModule error:", err);
    return res.status(500).json({ success: false, message: "Erro ao buscar módulo." });
  }
});

// ── POST /courses/:id/start ───────────────────────────────────────────────────
coursesRouter.post("/:id/start", (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req as any).userId;

    // Verifica se o curso existe
    const course = db.getItem(`COURSE#${courseId}`, "METADATA");
    if (!course) {
      return res.status(404).json({ success: false, message: "Curso não encontrado." });
    }

    // Verifica se já iniciou — se sim, retorna sucesso (idempotente)
    const existing = db.getItem(`USER#${userId}`, `PROGRESS#${courseId}`);
    if (existing) {
      return res.json({
        success: true,
        data: {
          message: "Curso já iniciado.",
          currentModuleId: existing.currentModuleId,
          currentLessonId: existing.currentLessonId,
        },
      });
    }

    // Busca o primeiro módulo
    const modules = db.queryItems(`COURSE#${courseId}`, "MODULE#")
      .sort((a, b) => a.order - b.order);

    if (modules.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhum módulo encontrado." });
    }

    const firstModule = modules[0];

    // Busca a primeira lição do primeiro módulo
    const lessons = db.queryItems(`MODULE#${firstModule.moduleId}`, "LESSON#")
      .sort((a, b) => a.order - b.order);

    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: "Nenhuma lição encontrada." });
    }

    const firstLesson = lessons[0];

    // Cria o registro de progresso
    db.putItem({
      PK: `USER#${userId}`,
      SK: `PROGRESS#${courseId}`,
      userId,
      courseId,
      currentModuleId: firstModule.moduleId,
      currentLessonId: firstLesson.lessonId,
      xpAccumulated: 0,
      percentComplete: 0,
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      data: {
        message: "Curso iniciado com sucesso.",
        currentModuleId: firstModule.moduleId,
        currentLessonId: firstLesson.lessonId,
      },
    });
  } catch (err) {
    console.error("startCourse error:", err);
    return res.status(500).json({ success: false, message: "Erro ao iniciar curso." });
  }
});
