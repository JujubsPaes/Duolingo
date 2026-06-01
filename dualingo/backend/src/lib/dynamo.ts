import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Nome da tabela principal — Single Table Design
export const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "duolingo-app";

// Cliente base do DynamoDB
const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

// Cliente de documento — converte automaticamente tipos JS ↔ DynamoDB
export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // não salva campos undefined
    convertEmptyValues: false,
  },
});

// ── Padrões de chave (Single Table Design) ────────────────────────────────────
// Cada entidade tem um PK e SK bem definidos para evitar colisões

export const Keys = {
  user: (userId: string) => ({
    PK: `USER#${userId}`,
    SK: "PROFILE",
  }),

  course: (courseId: string) => ({
    PK: `COURSE#${courseId}`,
    SK: "METADATA",
  }),

  module: (courseId: string, moduleId: string) => ({
    PK: `COURSE#${courseId}`,
    SK: `MODULE#${moduleId}`,
  }),

  lesson: (moduleId: string, lessonId: string) => ({
    PK: `MODULE#${moduleId}`,
    SK: `LESSON#${lessonId}`,
  }),

  exercise: (lessonId: string, exerciseId: string) => ({
    PK: `LESSON#${lessonId}`,
    SK: `EXERCISE#${exerciseId}`,
  }),

  progress: (userId: string, courseId: string) => ({
    PK: `USER#${userId}`,
    SK: `PROGRESS#${courseId}`,
  }),

  history: (userId: string, timestamp: string) => ({
    PK: `USER#${userId}`,
    SK: `HISTORY#${timestamp}`,
  }),

  achievement: (userId: string, achievementId: string) => ({
    PK: `USER#${userId}`,
    SK: `ACHIEVEMENT#${achievementId}`,
  }),

  // Erros recorrentes — usados pela revisão inteligente
  error: (userId: string, exerciseId: string) => ({
    PK: `USER#${userId}`,
    SK: `ERROR#${exerciseId}`,
  }),
};
