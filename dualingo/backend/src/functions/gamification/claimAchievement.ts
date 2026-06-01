import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent } from "../../lib/auth";
import { ok, badRequest, notFound, serverError } from "../../lib/response";
import { AchievementRecord } from "../../types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;
    const achievementId = event.pathParameters?.id;

    if (!achievementId) return badRequest("ID da conquista não informado.");

    // 1. Busca a conquista do usuário
    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.achievement(userId, achievementId),
      })
    );

    if (!result.Item) return notFound("Conquista não encontrada.");

    const achievement = result.Item as AchievementRecord;

    if (!achievement.unlocked) {
      return badRequest("Esta conquista ainda não foi desbloqueada.");
    }

    if (achievement.rewardClaimed) {
      return badRequest("Recompensa já foi resgatada.");
    }

    // 2. Marca a recompensa como resgatada
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.achievement(userId, achievementId),
        UpdateExpression: "SET rewardClaimed = :true",
        ExpressionAttributeValues: { ":true": true },
      })
    );

    // 3. Adiciona o XP da recompensa ao perfil do usuário
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.user(userId),
        UpdateExpression: "SET xp = xp + :xp",
        ExpressionAttributeValues: { ":xp": achievement.xpReward },
      })
    );

    return ok({
      message: `Recompensa resgatada: ${achievement.reward}`,
      xpEarned: achievement.xpReward,
    });
  } catch (err) {
    console.error("claimAchievement error:", err);
    return serverError("Erro ao resgatar recompensa.");
  }
};
