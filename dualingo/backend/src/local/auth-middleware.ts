/**
 * Middleware de autenticação — protege as rotas que precisam de login.
 *
 * Funciona assim: o frontend manda o token JWT no header "Authorization: Bearer xxx".
 * Esse middleware pega o token, verifica se é válido, e injeta o userId no request.
 * Se o token for inválido ou expirado, retorna 401 e o frontend desloga o usuario.
 *
 * Em produção, quem faz isso é o Cognito Authorizer do API Gateway.
 * Aqui a gente simula com JWT simples pra funcionar local.
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Chave secreta para assinar tokens localmente (NÃO usar em produção)
export const JWT_SECRET = process.env.JWT_SECRET ?? "dualingo-local-dev-secret-2024";

// Tempo de expiração do token (7 dias para facilitar o desenvolvimento)
export const TOKEN_EXPIRY = "7d";

/**
 * Gera um token JWT com os dados do usuário.
 * Simula o que o Cognito faz após autenticação bem-sucedida.
 */
export function generateTokens(userId: string, email: string, name: string) {
  const payload = { sub: userId, email, name };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const idToken = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });

  return { accessToken, idToken, refreshToken };
}

/**
 * Middleware que verifica o token JWT no header Authorization.
 * Adiciona req.userId e req.userEmail ao request se válido.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Token de autenticação não fornecido.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Injeta os dados do usuário no request (simula o Cognito Authorizer)
    (req as any).userId = decoded.sub;
    (req as any).userEmail = decoded.email;
    (req as any).userName = decoded.name;

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Token inválido ou expirado.",
    });
  }
}
