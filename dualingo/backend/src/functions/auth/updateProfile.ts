import { APIGatewayProxyHandler } from "aws-lambda";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { updateUserAttributes } from "../../lib/cognito";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { getUserFromEvent, parseBody } from "../../lib/auth";
import { ok, badRequest, notFound, serverError } from "../../lib/response";

interface UpdateProfileBody {
  name?: string;
  avatarUrl?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const claims = getUserFromEvent(event);
    const userId = claims.sub;
    const body = parseBody<UpdateProfileBody>(event);

    if (!body?.name && !body?.avatarUrl) {
      return badRequest("Informe ao menos um campo para atualizar.");
    }

    // Verifica se o usuário existe
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.user(userId) })
    );

    if (!existing.Item) {
      return notFound("Usuário não encontrado.");
    }

    // Monta as expressões de atualização dinamicamente
    const updateExpressions: string[] = [];
    const expressionValues: Record<string, any> = {};
    const cognitoAttributes: { name: string; value: string }[] = [];

    if (body.name) {
      updateExpressions.push("#name = :name");
      expressionValues[":name"] = body.name;
      cognitoAttributes.push({ name: "name", value: body.name });
    }

    if (body.avatarUrl) {
      updateExpressions.push("avatarUrl = :avatarUrl");
      expressionValues[":avatarUrl"] = body.avatarUrl;
    }

    // Atualiza no DynamoDB
    await dynamo.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: Keys.user(userId),
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: body.name ? { "#name": "name" } : undefined,
        ExpressionAttributeValues: expressionValues,
      })
    );

    // Sincroniza o nome no Cognito também
    if (cognitoAttributes.length > 0) {
      await updateUserAttributes(userId, cognitoAttributes);
    }

    // Retorna o perfil atualizado
    const updated = await dynamo.send(
      new GetCommand({ TableName: TABLE_NAME, Key: Keys.user(userId) })
    );

    const user = updated.Item!;
    return ok({
      userId: user.userId,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return serverError("Erro ao atualizar perfil.");
  }
};
