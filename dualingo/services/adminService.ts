/**
 * Service de administração — conecta os painéis admin ao backend.
 * 
 * Endpoints consumidos:
 *   GET/POST/PUT/DELETE /admin/courses
 *   GET/POST/PUT/DELETE /admin/modules
 *   GET/POST/PUT/DELETE /admin/lessons
 *   GET/POST/PUT/DELETE /admin/exercises
 *   GET /admin/reports
 */

import api from "./api";
import { ApiResponse } from "../types";

// ── Tipos locais do admin ─────────────────────────────────────────────────────

export interface AdminCourse {
  courseId: string;
  name: string;
  description: string;
  order: number;
  imageUrl?: string;
  createdAt?: string;
}

export interface AdminModule {
  moduleId: string;
  courseId: string;
  name: string;
  description?: string;
  order: number;
  createdAt?: string;
}

export interface AdminLesson {
  lessonId: string;
  moduleId: string;
  name: string;
  description?: string;
  order: number;
  xpReward: number;
  createdAt?: string;
}

export interface AdminExercise {
  exerciseId: string;
  lessonId: string;
  type: "multiple_choice" | "true_false";
  question: string;
  options: Array<{ id: string; label: string }>;
  correctAnswerId: string;
  explanation?: string;
  order: number;
  createdAt?: string;
}

export interface AdminReports {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalExercises: number;
  mostCompletedLessons: Array<{ lessonId: string; lessonName: string; completionCount: number }>;
  topStreakUsers: Array<{ userId: string; userName: string; streak: number }>;
  averageAccuracyByExercise: Array<{ exerciseId: string; question: string; averageAccuracy: number }>;
  generatedAt: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// CURSOS
// ══════════════════════════════════════════════════════════════════════════════

export async function getCourses(): Promise<AdminCourse[]> {
  const res = await api.get<ApiResponse<AdminCourse[]>>("/admin/courses");
  return res.data.data;
}

export async function createCourse(data: { name: string; description: string; order: number; imageUrl?: string }): Promise<AdminCourse> {
  const res = await api.post<ApiResponse<AdminCourse>>("/admin/courses", data);
  return res.data.data;
}

export async function updateCourse(courseId: string, data: Partial<{ name: string; description: string; order: number; imageUrl: string }>): Promise<AdminCourse> {
  const res = await api.put<ApiResponse<AdminCourse>>(`/admin/courses/${courseId}`, data);
  return res.data.data;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await api.delete(`/admin/courses/${courseId}`);
}

// ══════════════════════════════════════════════════════════════════════════════
// MÓDULOS
// ══════════════════════════════════════════════════════════════════════════════

export async function getModules(courseId: string): Promise<AdminModule[]> {
  const res = await api.get<ApiResponse<AdminModule[]>>(`/admin/modules`, { params: { courseId } });
  return res.data.data;
}

export async function createModule(data: { courseId: string; name: string; description?: string; order: number }): Promise<AdminModule> {
  const res = await api.post<ApiResponse<AdminModule>>("/admin/modules", data);
  return res.data.data;
}

export async function updateModule(moduleId: string, data: { courseId: string; name?: string; description?: string; order?: number }): Promise<AdminModule> {
  const res = await api.put<ApiResponse<AdminModule>>(`/admin/modules/${moduleId}`, data);
  return res.data.data;
}

export async function deleteModule(moduleId: string, courseId: string): Promise<void> {
  await api.delete(`/admin/modules/${moduleId}`, { params: { courseId } });
}

// ══════════════════════════════════════════════════════════════════════════════
// LIÇÕES
// ══════════════════════════════════════════════════════════════════════════════

export async function getLessons(moduleId: string): Promise<AdminLesson[]> {
  const res = await api.get<ApiResponse<AdminLesson[]>>(`/admin/lessons`, { params: { moduleId } });
  return res.data.data;
}

export async function createLesson(data: { moduleId: string; name: string; description?: string; order: number; xpReward?: number }): Promise<AdminLesson> {
  const res = await api.post<ApiResponse<AdminLesson>>("/admin/lessons", data);
  return res.data.data;
}

export async function updateLesson(lessonId: string, data: { moduleId: string; name?: string; description?: string; order?: number; xpReward?: number }): Promise<AdminLesson> {
  const res = await api.put<ApiResponse<AdminLesson>>(`/admin/lessons/${lessonId}`, data);
  return res.data.data;
}

export async function deleteLesson(lessonId: string, moduleId: string): Promise<void> {
  await api.delete(`/admin/lessons/${lessonId}`, { params: { moduleId } });
}

// ══════════════════════════════════════════════════════════════════════════════
// EXERCÍCIOS
// ══════════════════════════════════════════════════════════════════════════════

export async function getExercises(lessonId: string): Promise<AdminExercise[]> {
  const res = await api.get<ApiResponse<AdminExercise[]>>(`/admin/exercises`, { params: { lessonId } });
  return res.data.data;
}

export async function createExercise(data: {
  lessonId: string;
  type: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  correctAnswerId: string;
  explanation?: string;
  order: number;
}): Promise<AdminExercise> {
  const res = await api.post<ApiResponse<AdminExercise>>("/admin/exercises", data);
  return res.data.data;
}

export async function updateExercise(exerciseId: string, data: {
  lessonId: string;
  type?: string;
  question?: string;
  options?: Array<{ id: string; label: string }>;
  correctAnswerId?: string;
  explanation?: string;
  order?: number;
}): Promise<AdminExercise> {
  const res = await api.put<ApiResponse<AdminExercise>>(`/admin/exercises/${exerciseId}`, data);
  return res.data.data;
}

export async function deleteExercise(exerciseId: string, lessonId: string): Promise<void> {
  await api.delete(`/admin/exercises/${exerciseId}`, { params: { lessonId } });
}

// ══════════════════════════════════════════════════════════════════════════════
// RELATÓRIOS
// ══════════════════════════════════════════════════════════════════════════════

export async function getReports(): Promise<AdminReports> {
  const res = await api.get<ApiResponse<AdminReports>>("/admin/reports");
  return res.data.data;
}
