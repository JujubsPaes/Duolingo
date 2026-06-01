/**
 * Tipos compartilhados do backend Dualingo
 * 
 * Todas as interfaces seguem o modelo Single Table Design do DynamoDB,
 * onde PK (Partition Key) e SK (Sort Key) definem a entidade.
 */

// ==========================================
// Entidades do DynamoDB
// ==========================================

/** Representa um curso na plataforma (ex: "Expo", "AWS Nuvem") */
export interface Course {
  PK: string;           // COURSE#<courseId>
  SK: string;           // METADATA
  courseId: string;
  name: string;
  description: string;
  order: number;        // Ordem de exibição na lista de cursos
  imageUrl?: string;    // URL da imagem de capa (S3)
  createdAt: string;
  updatedAt: string;
}

/** Representa um módulo dentro de um curso */
export interface Module {
  PK: string;           // COURSE#<courseId>
  SK: string;           // MODULE#<moduleId>
  moduleId: string;
  courseId: string;
  name: string;
  description: string;
  order: number;        // Ordem dentro do curso
  createdAt: string;
  updatedAt: string;
}

/** Representa uma lição dentro de um módulo */
export interface Lesson {
  PK: string;           // MODULE#<moduleId>
  SK: string;           // LESSON#<lessonId>
  lessonId: string;
  moduleId: string;
  name: string;
  description: string;
  order: number;        // Ordem dentro do módulo
  xpReward: number;    // XP base ao completar (padrão: 10)
  createdAt: string;
  updatedAt: string;
}

/** Tipos de exercício suportados pela plataforma */
export type ExerciseType = 'multiple_choice' | 'true_false';

/** Representa um exercício dentro de uma lição */
export interface Exercise {
  PK: string;           // LESSON#<lessonId>
  SK: string;           // EXERCISE#<exerciseId>
  exerciseId: string;
  lessonId: string;
  type: ExerciseType;
  question: string;
  options: string[];          // Opções de resposta (4 para múltipla escolha, 2 para V/F)
  correctAnswer: string;     // Resposta correta (deve estar em options)
  explanation?: string;      // Explicação da resposta (exibida após responder)
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// DTOs de entrada (payloads das requisições)
// ==========================================

/** Payload para criar/editar um curso */
export interface CourseInput {
  name: string;
  description: string;
  order: number;
  imageUrl?: string;
}

/** Payload para criar/editar um módulo */
export interface ModuleInput {
  courseId: string;
  name: string;
  description: string;
  order: number;
}

/** Payload para criar/editar uma lição */
export interface LessonInput {
  moduleId: string;
  name: string;
  description: string;
  order: number;
  xpReward?: number;
}

/** Payload para criar/editar um exercício */
export interface ExerciseInput {
  lessonId: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  order: number;
}

// ==========================================
// Resposta padronizada da API
// ==========================================

/** Formato padrão de resposta de todos os endpoints */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// Relatórios
// ==========================================

/** Dados retornados pelo endpoint de relatórios */
export interface ReportsData {
  totalUsers: number;
  mostCompletedLessons: Array<{
    lessonId: string;
    lessonName: string;
    completionCount: number;
  }>;
  averageAccuracyByExercise: Array<{
    exerciseId: string;
    question: string;
    averageAccuracy: number;
  }>;
  topStreakUsers: Array<{
    userId: string;
    userName: string;
    streak: number;
  }>;
}
