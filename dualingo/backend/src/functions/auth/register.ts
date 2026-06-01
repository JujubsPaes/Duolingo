import { APIGatewayProxyHandler } from "aws-lambda";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { signUpUser } from "../../lib/cognito";
import { dynamo, TABLE_NAME, Keys } from "../../lib/dynamo";
import { parseBody } from "../../lib/auth";
import { ok, badRequest, serverError } from "../../lib/response";
import { seedUserAchievements } from "../gamification/seedAchievements";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = parseBody<RegisterBody>(event);

    // Validação básica dos campos obrigatórios
    if (!body?.name || !body?.email || !body?.password) {
      return badRequest("Nome, email e senha são obrigatórios.");
    }

    if (body.password.length < 6) {
      return badRequest("A senha deve ter ao menos 6 caracteres.");
    }

    const userId = uuid();

    // 1. Cadastra no Cognito (autenticação)
    await signUpUser(body.name, body.email, body.password);

    // 2. Cria o perfil do usuário no DynamoDB
    const now = new Date().toISOString();
    const userRecord = {
      ...Keys.user(userId),
      userId,
      name: body.name,
      email: body.email,
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: now,
    };

    await dynamo.send(
      new PutCommand({ TableName: TABLE_NAME, Item: userRecord })
    );

    // 3. Inicializa as conquistas padrão para o novo usuário
    try {
      await seedUserAchievements(userId);
    } catch (seedErr) {
      // Não bloqueia o cadastro se o seed falhar — conquistas podem ser criadas depois
      console.warn("seedAchievements warning:", seedErr);
    }

    return ok({ message: "Cadastro realizado. Verifique seu email para confirmar a conta." }, 201);
  } catch (err: any) {
    // Cognito lança UsernameExistsException se o email já está cadastrado
    if (err?.name === "UsernameExistsException") {
      return badRequest("Este email já está cadastrado.");
    }
    console.error("register error:", err);
    return serverError("Erro ao criar conta.");
  }
};
