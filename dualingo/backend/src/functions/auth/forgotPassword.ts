import { APIGatewayProxyHandler } from "aws-lambda";
import { forgotPassword } from "../../lib/cognito";
import { parseBody } from "../../lib/auth";
import { ok, badRequest, serverError } from "../../lib/response";

interface ForgotPasswordBody {
  email: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = parseBody<ForgotPasswordBody>(event);

    if (!body?.email) {
      return badRequest("Email é obrigatório.");
    }

    // Dispara o fluxo de recuperação de senha no Cognito
    // O Cognito envia um código de verificação para o email
    await forgotPassword(body.email);

    // Sempre retorna sucesso para não revelar se o email existe
    return ok({ message: "Se o email estiver cadastrado, você receberá as instruções." });
  } catch (err: any) {
    console.error("forgotPassword error:", err);
    return serverError("Erro ao processar solicitação.");
  }
};
