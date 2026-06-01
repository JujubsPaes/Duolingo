/**
 * progressStore — Controla o desbloqueio progressivo das lições.
 *
 * A ideia é simples: quando o aluno conclui uma lição, a próxima desbloqueia.
 * Esse store guarda só as "exceções" (overrides) — o que mudou em relação ao
 * estado inicial dos mocks. Assim nao precisa duplicar todos os dados.
 */

import { create } from "zustand";
import { MOCK_COURSES } from "../data/mockCourses";
import type { Lesson } from "../types";

type LessonStatus = Lesson["status"]; // "locked" | "available" | "completed"
type LessonOverrideMap = Record<string, LessonStatus>;
type CourseOverrideMap = Record<string, LessonOverrideMap>;

interface ProgressState {
  // Guarda só as lições que tiveram status alterado (o resto vem do mock)
  overrides: CourseOverrideMap;

  // Listas de módulos e cursos já concluídos (pra disparar conquistas)
  completedModules: string[];
  completedCourses: string[];

  // Marca lição como concluída e desbloqueia a próxima na sequência
  completeLesson: (courseId: string, lessonId: string) => {
    moduleCompleted: boolean;
    courseCompleted: boolean;
  };

  // Monta o mapa completo de status de um curso (mock + overrides)
  getStatusMap: (courseId: string) => Record<string, LessonStatus>;

  // Existe por compatibilidade, mas não faz nada de fato
  initCourse: (courseId: string) => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  overrides: {},
  completedModules: [],
  completedCourses: [],

  // Não precisa inicializar nada — os mocks ja têm o estado inicial
  initCourse: () => {},

  completeLesson: (courseId, lessonId) => {
    const course = MOCK_COURSES[courseId];
    if (!course) return { moduleCompleted: false, courseCompleted: false };

    // Junta todas as lições do curso em ordem sequencial
    const allLessons = course.modules
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((m) => m.lessons.slice().sort((a, b) => a.order - b.order));

    // Encontra a posição da lição que foi concluída
    const idx = allLessons.findIndex((l) => l.lessonId === lessonId);
    if (idx === -1) return { moduleCompleted: false, courseCompleted: false };

    let moduleCompleted = false;
    let courseCompleted = false;

    set((state) => {
      const courseOverrides = { ...(state.overrides[courseId] ?? {}) };

      // Marca a lição atual como concluída
      courseOverrides[lessonId] = "completed";

      // Desbloqueia a próxima lição (se existir e estiver travada)
      const next = allLessons[idx + 1];
      if (next) {
        const nextCurrentStatus = courseOverrides[next.lessonId] ?? next.status;
        if (nextCurrentStatus === "locked") {
          courseOverrides[next.lessonId] = "available";
        }
      }

      // Checa se todas as lições do módulo atual foram concluídas
      const currentLesson = allLessons[idx];
      const currentModule = course.modules.find(
        (m) => m.moduleId === currentLesson.moduleId
      );

      if (currentModule) {
        const moduleLessonsCompleted = currentModule.lessons.every(
          (l) => (courseOverrides[l.lessonId] ?? l.status) === "completed"
        );
        if (moduleLessonsCompleted && !state.completedModules.includes(currentModule.moduleId)) {
          moduleCompleted = true;
        }
      }

      // Checa se TODAS as lições do curso foram concluídas
      const allCourseLessonsCompleted = allLessons.every(
        (l) => (courseOverrides[l.lessonId] ?? l.status) === "completed"
      );
      if (allCourseLessonsCompleted && !state.completedCourses.includes(courseId)) {
        courseCompleted = true;
      }

      return {
        overrides: { ...state.overrides, [courseId]: courseOverrides },
        completedModules: moduleCompleted && currentModule
          ? [...state.completedModules, currentModule.moduleId]
          : state.completedModules,
        completedCourses: courseCompleted
          ? [...state.completedCourses, courseId]
          : state.completedCourses,
      };
    });

    return { moduleCompleted, courseCompleted };
  },

  // Retorna o status de cada lição do curso, combinando mock + alterações locais
  getStatusMap: (courseId) => {
    const course = MOCK_COURSES[courseId];
    if (!course) return {};

    const courseOverrides = get().overrides[courseId] ?? {};
    const map: Record<string, LessonStatus> = {};

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        // Se tem override, usa ele; senão, usa o status original do mock
        map[lesson.lessonId] = courseOverrides[lesson.lessonId] ?? lesson.status;
      }
    }
    return map;
  },
}));
