import { APIGatewayProxyHandler } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { authenticateUser } from "../../lib/cognito";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { parseBody } from "../../lib/auth";
import { ok, badRequest, unauthorized, serverError } from "../../lib/response";
import { UserRecord } from "../../types";

interface LoginBody {
  email: string;
  password: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = parseBody<LoginBody>(event);

    if (!body?.email || !body?.password) {
      return badRequest("Email e senha são obrigatórios.");
    }

    // 1. Autentica no Cognito e obtém os tokens JWT
    const tokens = await authenticateUser(body.email, body.password);

    // 2. Decodifica o idToken para pegar o userId (sub)
    // O idToken é um JWT — o payload é a segunda parte em base64
    const payload = JSON.parse(
      Buffer.from(tokens.idToken.split(".")[1], "base64").toString("utf-8")
    );
    const userId: string = payload.sub;

    // 3. Busca o perfil do usuário no DynamoDB
    const result = await dynamo.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: Keys.user(userId),
      })
    );

    if (!result.Item) {
      return unauthorized("Usuário não encontrado.");
    }

    const user = result.Item as UserRecord;

    return ok({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastStudyDate: user.lastStudyDate,
      },
      tokens,
    });
  } catch (err: any) {
    // Cognito lança NotAuthorizedException para credenciais inválidas
    if (
      err?.name === "NotAuthorizedException" ||
      err?.name === "UserNotFoundException"
    ) {
      return unauthorized("Email ou senha incorretos.");
    }
    console.error("login error:", err);
    return serverError("Erro ao fazer login.");
  }
};
