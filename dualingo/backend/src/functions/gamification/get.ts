import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, notFound, serverError } from "../../lib/response";
import { UserRecord, AchievementRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;

    // 1. Busca o perfil do usuário (XP, nível, streak)
    const userResult = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.user(userId) })
    );

    if (!userResult.Item) return notFound("Usuário não encontrado.");
    const user = userResult.Item as UserRecord;

    // 2. Busca todas as conquistas do usuário
    const achievementsResult = await dynamo.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":sk": "ACHIEVEMENT#",
        },
      })
    );

    const achievements = (achievementsResult.Items ?? []) as AchievementRecord[];

    return ok({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastStudyDate: user.lastStudyDate,
      achievements: achievements.map((a) => ({
        achievementId: a.achievementId,
        name: a.name,
        description: a.description,
        icon: a.icon,
        unlocked: a.unlocked,
        rewardClaimed: a.rewardClaimed,
        unlockedAt: a.unlockedAt,
        reward: a.reward,
        repeatable: a.repeatable ?? false,
        timesEarned: a.timesEarned ?? 0,
      })),
    });
  } catch (err) {
    console.error("getGamification error:", err);
    return serverError("Erro ao buscar dados de gamificação.");
  }
};
