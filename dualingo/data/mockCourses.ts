/**
 * mockCourses.ts — Dados mock de cursos, módulos e lições.
 *
 * Estrutura: 2 cursos × 5 módulos × 5 lições = 50 lições no total.
 * Cada lição tem 3 exercícios definidos em mockExercises.ts.
 *
 * Regra de desbloqueio:
 *   - Lição 1 do Módulo 1: disponível (ponto de entrada)
 *   - Demais lições: bloqueadas até a anterior ser concluída
 *   - O progressStore gerencia o desbloqueio em tempo real
 *
 * Quando o backend estiver pronto, substituir pelo retorno real de:
 *   GET /courses/{id}  →  módulos + lições com status calculado pelo servidor
 */

import type { Module, Lesson } from "../types";

// ── Tipos auxiliares ──────────────────────────────────────────────────────────

/** Módulo com suas lições embutidas */
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

/** Curso completo com todos os módulos e lições */
export interface CourseTrailData {
  courseId: string;
  name: string;
  modules: ModuleWithLessons[];
}

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Cria uma lição com os campos obrigatórios.
 * A primeira lição de cada curso começa como "available"; as demais como "locked".
 */
function makeLesson(
  lessonId: string,
  moduleId: string,
  name: string,
  order: number,
  xpReward: number,
  status: Lesson["status"] = "locked"
): Lesson {
  return { lessonId, moduleId, name, order, xpReward, status };
}

// ─────────────────────────────────────────────────────────────────────────────
// CURSO EXPO — 5 módulos × 5 lições
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_EXPO_COURSE: CourseTrailData = {
  courseId: "expo",
  name: "Expo",
  modules: [
    // ── Módulo 1: Introdução ao Expo ────────────────────────────────────────
    {
      moduleId: "mod-expo-1",
      courseId: "expo",
      name: "Introdução ao Expo",
      order: 1,
      lessons: [
        makeLesson("lesson-expo-1-1", "mod-expo-1", "O que é o Expo?",        1, 10, "available"),
        makeLesson("lesson-expo-1-2", "mod-expo-1", "Instalação e Ambiente",   2, 10),
        makeLesson("lesson-expo-1-3", "mod-expo-1", "Estrutura do Projeto",    3, 10),
        makeLesson("lesson-expo-1-4", "mod-expo-1", "Interface e Componentes", 4, 10),
        makeLesson("lesson-expo-1-5", "mod-expo-1", "Navegação e Recursos",    5, 15),
      ],
    },

    // ── Módulo 2: Componentes e Estilização ─────────────────────────────────
    {
      moduleId: "mod-expo-2",
      courseId: "expo",
      name: "Componentes e Estilização",
      order: 2,
      lessons: [
        makeLesson("lesson-expo-2-1", "mod-expo-2", "StyleSheet e Flexbox",       1, 10),
        makeLesson("lesson-expo-2-2", "mod-expo-2", "Imagens e Assets",           2, 10),
        makeLesson("lesson-expo-2-3", "mod-expo-2", "Animações com Reanimated",   3, 15),
        makeLesson("lesson-expo-2-4", "mod-expo-2", "Gestos e Interações",        4, 15),
        makeLesson("lesson-expo-2-5", "mod-expo-2", "ScrollView e FlatList",      5, 15),
      ],
    },

    // ── Módulo 3: Navegação com Expo Router ─────────────────────────────────
    {
      moduleId: "mod-expo-3",
      courseId: "expo",
      name: "Navegação com Expo Router",
      order: 3,
      lessons: [
        makeLesson("lesson-expo-3-1", "mod-expo-3", "Expo Router Básico",         1, 10),
        makeLesson("lesson-expo-3-2", "mod-expo-3", "Parâmetros de Rota",         2, 10),
        makeLesson("lesson-expo-3-3", "mod-expo-3", "Layouts e Grupos",           3, 15),
        makeLesson("lesson-expo-3-4", "mod-expo-3", "Stack e Modal",              4, 15),
        makeLesson("lesson-expo-3-5", "mod-expo-3", "Auth Guard e Redirecionamento", 5, 20),
      ],
    },

    // ── Módulo 4: APIs e Estado ──────────────────────────────────────────────
    {
      moduleId: "mod-expo-4",
      courseId: "expo",
      name: "APIs e Estado",
      order: 4,
      lessons: [
        makeLesson("lesson-expo-4-1", "mod-expo-4", "Fetch e Axios",             1, 10),
        makeLesson("lesson-expo-4-2", "mod-expo-4", "React Query",               2, 15),
        makeLesson("lesson-expo-4-3", "mod-expo-4", "Zustand",                   3, 15),
        makeLesson("lesson-expo-4-4", "mod-expo-4", "Armazenamento Seguro",      4, 15),
        makeLesson("lesson-expo-4-5", "mod-expo-4", "Tratamento de Erros",       5, 20),
      ],
    },

    // ── Módulo 5: Build, Deploy e Boas Práticas ──────────────────────────────
    {
      moduleId: "mod-expo-5",
      courseId: "expo",
      name: "Build e Deploy",
      order: 5,
      lessons: [
        makeLesson("lesson-expo-5-1", "mod-expo-5", "Build com EAS",             1, 15),
        makeLesson("lesson-expo-5-2", "mod-expo-5", "Variáveis de Ambiente",     2, 15),
        makeLesson("lesson-expo-5-3", "mod-expo-5", "TypeScript no Expo",        3, 15),
        makeLesson("lesson-expo-5-4", "mod-expo-5", "Performance e Otimização",  4, 20),
        makeLesson("lesson-expo-5-5", "mod-expo-5", "Publicação e OTA",          5, 20),
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CURSO AWS — 5 módulos × 5 lições
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_AWS_COURSE: CourseTrailData = {
  courseId: "aws",
  name: "Amazon AWS",
  modules: [
    // ── Módulo 1: Conceitos de Cloud ────────────────────────────────────────
    {
      moduleId: "mod-aws-1",
      courseId: "aws",
      name: "Conceitos de Cloud",
      order: 1,
      lessons: [
        makeLesson("lesson-aws-1-1", "mod-aws-1", "O que é Cloud Computing?",          1, 10, "available"),
        makeLesson("lesson-aws-1-2", "mod-aws-1", "Regiões e Zonas de Disponibilidade", 2, 10),
        makeLesson("lesson-aws-1-3", "mod-aws-1", "Modelos de Serviço (IaaS/PaaS/SaaS)", 3, 10),
        makeLesson("lesson-aws-1-4", "mod-aws-1", "Console AWS e IAM",                 4, 10),
        makeLesson("lesson-aws-1-5", "mod-aws-1", "Responsabilidade Compartilhada",    5, 15),
      ],
    },

    // ── Módulo 2: Infraestrutura AWS ────────────────────────────────────────
    {
      moduleId: "mod-aws-2",
      courseId: "aws",
      name: "Infraestrutura AWS",
      order: 2,
      lessons: [
        makeLesson("lesson-aws-2-1", "mod-aws-2", "Amazon EC2",       1, 10),
        makeLesson("lesson-aws-2-2", "mod-aws-2", "Amazon S3",        2, 10),
        makeLesson("lesson-aws-2-3", "mod-aws-2", "AWS Lambda",       3, 15),
        makeLesson("lesson-aws-2-4", "mod-aws-2", "API Gateway",      4, 15),
        makeLesson("lesson-aws-2-5", "mod-aws-2", "DynamoDB",         5, 20),
      ],
    },

    // ── Módulo 3: Serviços Principais ───────────────────────────────────────
    {
      moduleId: "mod-aws-3",
      courseId: "aws",
      name: "Serviços Principais",
      order: 3,
      lessons: [
        makeLesson("lesson-aws-3-1", "mod-aws-3", "Amazon RDS",        1, 10),
        makeLesson("lesson-aws-3-2", "mod-aws-3", "Amazon Cognito",    2, 15),
        makeLesson("lesson-aws-3-3", "mod-aws-3", "Amazon CloudFront", 3, 15),
        makeLesson("lesson-aws-3-4", "mod-aws-3", "SQS e SNS",         4, 15),
        makeLesson("lesson-aws-3-5", "mod-aws-3", "CloudWatch",        5, 20),
      ],
    },

    // ── Módulo 4: Segurança na AWS ──────────────────────────────────────────
    {
      moduleId: "mod-aws-4",
      courseId: "aws",
      name: "Segurança na AWS",
      order: 4,
      lessons: [
        makeLesson("lesson-aws-4-1", "mod-aws-4", "IAM Avançado",          1, 15),
        makeLesson("lesson-aws-4-2", "mod-aws-4", "Criptografia e KMS",    2, 15),
        makeLesson("lesson-aws-4-3", "mod-aws-4", "VPC e Redes",           3, 15),
        makeLesson("lesson-aws-4-4", "mod-aws-4", "Shield e WAF",          4, 20),
        makeLesson("lesson-aws-4-5", "mod-aws-4", "Auditoria com CloudTrail", 5, 20),
      ],
    },

    // ── Módulo 5: Custos, Suporte e Boas Práticas ───────────────────────────
    {
      moduleId: "mod-aws-5",
      courseId: "aws",
      name: "Custos e Boas Práticas",
      order: 5,
      lessons: [
        makeLesson("lesson-aws-5-1", "mod-aws-5", "Modelo de Preços",           1, 15),
        makeLesson("lesson-aws-5-2", "mod-aws-5", "AWS Free Tier",              2, 15),
        makeLesson("lesson-aws-5-3", "mod-aws-5", "Well-Architected Framework", 3, 20),
        makeLesson("lesson-aws-5-4", "mod-aws-5", "Serverless Framework",       4, 20),
        makeLesson("lesson-aws-5-5", "mod-aws-5", "Revisão e Boas Práticas",    5, 20),
      ],
    },
  ],
};

// ── Mapa de lookup ────────────────────────────────────────────────────────────

/** Mapa courseId → dados do curso. Usado na CourseScreen para lookup direto. */
export const MOCK_COURSES: Record<string, CourseTrailData> = {
  expo: MOCK_EXPO_COURSE,
  aws:  MOCK_AWS_COURSE,
};
