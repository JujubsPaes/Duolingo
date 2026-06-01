/**
 * Funções de validação de entrada
 * 
 * Sanitiza e valida os payloads recebidos nas requisições
 * antes de persistir no DynamoDB. Previne injeção de dados maliciosos.
 */

import { CourseInput, ModuleInput, LessonInput, ExerciseInput } from '../types';

/**
 * Valida o payload de criação/edição de curso.
 * Retorna null se válido, ou uma mensagem de erro.
 */
export function validateCourseInput(input: Partial<CourseInput>): string | null {
  if (!input.name || input.name.trim().length === 0) {
    return 'O campo "name" é obrigatório';
  }
  if (!input.description || input.description.trim().length === 0) {
    return 'O campo "description" é obrigatório';
  }
  if (input.order === undefined || input.order < 0) {
    return 'O campo "order" deve ser um número >= 0';
  }
  return null;
}

/**
 * Valida o payload de criação/edição de módulo.
 * Retorna null se válido, ou uma mensagem de erro.
 */
export function validateModuleInput(input: Partial<ModuleInput>): string | null {
  if (!input.courseId || input.courseId.trim().length === 0) {
    return 'O campo "courseId" é obrigatório';
  }
  if (!input.name || input.name.trim().length === 0) {
    return 'O campo "name" é obrigatório';
  }
  if (!input.description || input.description.trim().length === 0) {
    return 'O campo "description" é obrigatório';
  }
  if (input.order === undefined || input.order < 0) {
    return 'O campo "order" deve ser um número >= 0';
  }
  return null;
}

/**
 * Valida o payload de criação/edição de lição.
 * Retorna null se válido, ou uma mensagem de erro.
 */
export function validateLessonInput(input: Partial<LessonInput>): string | null {
  if (!input.moduleId || input.moduleId.trim().length === 0) {
    return 'O campo "moduleId" é obrigatório';
  }
  if (!input.name || input.name.trim().length === 0) {
    return 'O campo "name" é obrigatório';
  }
  if (!input.description || input.description.trim().length === 0) {
    return 'O campo "description" é obrigatório';
  }
  if (input.order === undefined || input.order < 0) {
    return 'O campo "order" deve ser um número >= 0';
  }
  if (input.xpReward !== undefined && input.xpReward < 0) {
    return 'O campo "xpReward" deve ser um número >= 0';
  }
  return null;
}

/**
 * Valida o payload de criação/edição de exercício.
 * Retorna null se válido, ou uma mensagem de erro.
 */
export function validateExerciseInput(input: Partial<ExerciseInput>): string | null {
  if (!input.lessonId || input.lessonId.trim().length === 0) {
    return 'O campo "lessonId" é obrigatório';
  }
  if (!input.type || !['multiple_choice', 'true_false'].includes(input.type)) {
    return 'O campo "type" deve ser "multiple_choice" ou "true_false"';
  }
  if (!input.question || input.question.trim().length === 0) {
    return 'O campo "question" é obrigatório';
  }
  if (!input.options || !Array.isArray(input.options) || input.options.length < 2) {
    return 'O campo "options" deve ser um array com pelo menos 2 opções';
  }
  // Múltipla escolha precisa de exatamente 4 opções
  if (input.type === 'multiple_choice' && input.options.length !== 4) {
    return 'Exercícios de múltipla escolha devem ter exatamente 4 opções';
  }
  // Verdadeiro/Falso precisa de exatamente 2 opções
  if (input.type === 'true_false' && input.options.length !== 2) {
    return 'Exercícios de verdadeiro/falso devem ter exatamente 2 opções';
  }
  if (!input.correctAnswer || !input.options.includes(input.correctAnswer)) {
    return 'O campo "correctAnswer" deve ser uma das opções fornecidas';
  }
  if (input.order === undefined || input.order < 0) {
    return 'O campo "order" deve ser um número >= 0';
  }
  return null;
}

/**
 * Sanitiza uma string removendo caracteres potencialmente perigosos.
 * Previne injeção de scripts ou dados maliciosos.
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}
