import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ForgotPasswordCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

/**
 * Autentica o usuário com email e senha via Cognito.
 * Usa o fluxo USER_PASSWORD_AUTH.
 */
export async function authenticateUser(email: string, password: string) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const result = await client.send(command);
  const auth = result.AuthenticationResult;

  if (!auth?.AccessToken || !auth?.RefreshToken || !auth?.IdToken) {
    throw new Error("Falha na autenticação.");
  }

  return {
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    idToken: auth.IdToken,
  };
}

/**
 * Cadastra um novo usuário no Cognito User Pool.
 */
export async function signUpUser(name: string, email: string, password: string) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  });

  return client.send(command);
}

/**
 * Inicia o fluxo de recuperação de senha via Cognito.
 * O Cognito envia um código de verificação para o email do usuário.
 */
export async function forgotPassword(email: string) {
  const command = new ForgotPasswordCommand({
    ClientId: CLIENT_ID,
    Username: email,
  });

  return client.send(command);
}

/**
 * Atualiza atributos do usuário no Cognito (nome, avatar, etc.).
 */
export async function updateUserAttributes(
  userId: string,
  attributes: { name: string; value: string }[]
) {
  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: USER_POOL_ID,
    Username: userId,
    UserAttributes: attributes.map((a) => ({ Name: a.name, Value: a.value })),
  });

  return client.send(command);
}
