/**
 * authService — Funções de autenticação (login, cadastro, logout, etc).
 *
 * Faz as chamadas HTTP pro backend e gerencia os tokens JWT.
 * Em produção, o backend usa Cognito; localmente, usa JWT simples.
 */

import { Platform } from "react-native";
import api, { TOKEN_KEYS, setStorageItem, getStorageItem, deleteStorageItem } from "./api";
import {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  User,
  ApiResponse,
} from "../types";

/**
 * Faz login com email e senha.
 * Se der certo, salva os tokens no armazenamento seguro do dispositivo.
 * Retorna os dados do usuario pra hidratar o store.
 */
export async function login(data: LoginRequest): Promise<User> {
  const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
    "/auth/login",
    data
  );

  const { user, tokens } = response.data.data;

  // Guarda os tokens de forma segura (SecureStore no celular, localStorage na web)
  await setStorageItem(TOKEN_KEYS.ACCESS, tokens.accessToken);
  await setStorageItem(TOKEN_KEYS.REFRESH, tokens.refreshToken);
  await setStorageItem(TOKEN_KEYS.ID, tokens.idToken);

  return user;
}

/**
 * Cria uma conta nova. Não faz login automático — o usuário precisa logar depois.
 */
export async function register(data: RegisterRequest): Promise<void> {
  await api.post("/auth/register", data);
}

/**
 * Dispara o fluxo de recuperação de senha.
 * Localmente só simula; em produção, o Cognito envia o email.
 */
export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

/**
 * Atualiza nome ou foto do perfil. Precisa estar logado (token no header).
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.put<ApiResponse<User>>("/auth/profile", data);
  return response.data.data;
}

/**
 * Desloga o usuário removendo todos os tokens salvos.
 * Não chama o backend — é só limpeza local.
 */
export async function logout(): Promise<void> {
  await deleteStorageItem(TOKEN_KEYS.ACCESS);
  await deleteStorageItem(TOKEN_KEYS.REFRESH);
  await deleteStorageItem(TOKEN_KEYS.ID);
}

/**
 * Checa se tem um token salvo (ou seja, se o usuário já logou antes).
 * Não valida se o token ainda é válido — isso quem faz é o interceptor do Axios.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getStorageItem(TOKEN_KEYS.ACCESS);
  return !!token;
}
