/**
 * seedAchievements — Inicializa as conquistas padrão para um usuário.
 *
 * Chamado internamente após o registro do usuário para criar os registros
 * de conquista no DynamoDB com status "bloqueado" (unlocked: false).
 *
 * Conquistas disponíveis:
 * - first-lesson:    Primeira lição concluída
 * - streak-7:        Semana perfeita (7 dias de streak)
 * - perfect-score:   Nota máxima (100% em uma lição) — repetível
 * - module-complete: Módulo completo — repetível
 * - course-complete: Curso completo — repetível
 */

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";

// Definição das conquistas padrão do sistema
// Valores de XP proporcionais: lição perfeita = 1000 XP, streak 7 = 500 XP bônus
export const DEFAULT_ACHIEVEMENTS = [
  {
    achievementId: "first-lesson",
    name: "Primeira Lição",
    description: "Complete sua primeira lição no app.",
    icon: "🎯",
    reward: "+250 XP",
    xpReward: 250,
    repeatable: false,
  },
  {
    achievementId: "streak-7",
    name: "Semana Perfeita",
    description: "Mantenha um streak de 7 dias consecutivos.",
    icon: "🔥",
    reward: "+500 XP",
    xpReward: 500,
    repeatable: false,
  },
  {
    achievementId: "perfect-score",
    name: "Nota Máxima",
    description: "Acerte 100% dos exercícios em uma lição.",
    icon: "⭐",
    reward: "+300 XP",
    xpReward: 300,
    repeatable: true,
  },
  {
    achievementId: "module-complete",
    name: "Módulo Completo",
    description: "Conclua todas as lições de um módulo.",
    icon: "📚",
    reward: "+750 XP",
    xpReward: 750,
    repeatable: true,
  },
  {
    achievementId: "course-complete",
    name: "Curso Completo",
    description: "Conclua um curso inteiro.",
    icon: "🏆",
    reward: "+2500 XP",
    xpReward: 2500,
    repeatable: true,
  },
];

/**
 * Cria os registros de conquista para um novo usuário.
 * Cada conquista começa bloqueada (unlocked: false, rewardClaimed: false).
 */
export async function seedUserAchievements(userId: string): Promise<void> {
  for (const achievement of DEFAULT_ACHIEVEMENTS) {
    const key = Keys.achievement(userId, achievement.achievementId);

    await dynamo.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...key,
          userId,
          achievementId: achievement.achievementId,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          unlocked: false,
          rewardClaimed: false,
          reward: achievement.reward,
          xpReward: achievement.xpReward,
          repeatable: achievement.repeatable,
          timesEarned: 0,
        },
        // Não sobrescreve se já existir (idempotente)
        ConditionExpression: "attribute_not_exists(PK)",
      })
    );
  }
}
