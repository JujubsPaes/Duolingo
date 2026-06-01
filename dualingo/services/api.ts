/**
 * api.ts — Cliente HTTP central do app.
 *
 * Toda chamada à API passa por aqui. O Axios é configurado com:
 * - URL base apontando pro backend (localhost em dev, API Gateway em prod)
 * - Interceptor de request: injeta o token JWT automaticamente em toda requisição
 * - Interceptor de response: trata erros 401 (token expirado) e erros de rede
 *
 * Também exporta funções de storage que funcionam tanto no celular (SecureStore)
 * quanto na web (localStorage).
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import { ApiError } from "../types";

// ── Storage adaptável (SecureStore no mobile, localStorage na web) ─────────────
// O expo-secure-store não funciona na web, então usamos localStorage como fallback

let SecureStore: any = null;

// Carrega o SecureStore apenas em plataformas nativas
if (Platform.OS !== "web") {
  SecureStore = require("expo-secure-store");
}

// Funções auxiliares que abstraem o storage por plataforma
export async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore?.getItemAsync(key) ?? null;
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore?.setItemAsync(key, value);
}

export async function deleteStorageItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore?.deleteItemAsync(key);
}

// URL base da API — definida via variável de ambiente
// Em desenvolvimento local, aponta para o servidor Express
// Em produção, aponta para o API Gateway da AWS
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";
// Nota: Para emulador Android use http://10.0.2.2:3001
// Para iOS Simulator: http://localhost:3001
// Para dispositivo físico: http://SEU_IP_LOCAL:3001

// Log para debug — remover em produção
console.log("[API] Base URL:", BASE_URL);

// Chaves usadas no SecureStore para persistir os tokens
export const TOKEN_KEYS = {
  ACCESS: "dualingo_access_token",
  REFRESH: "dualingo_refresh_token",
  ID: "dualingo_id_token",
} as const;

// Instância principal do Axios com configurações base
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Interceptor de requisição ─────────────────
// Injeta o accessToken em todas as requisições automaticamente
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStorageItem(TOKEN_KEYS.ACCESS);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Interceptor de resposta ───────────────────
// Trata erros globais e formata a mensagem de erro
let isHandling401 = false; // Evita loop infinito de 401

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Erro de rede (backend offline ou URL incorreta)
    if (!error.response) {
      const networkMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando.";
      console.error("[API] Erro de rede:", error.message);
      return Promise.reject({ statusCode: 0, message: networkMessage });
    }

    const status = error.response.status;
    const message = error.response.data?.message ?? "Erro inesperado.";

    // Token expirado — limpa os tokens (apenas uma vez para evitar loop)
    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      await deleteStorageItem(TOKEN_KEYS.ACCESS);
      await deleteStorageItem(TOKEN_KEYS.REFRESH);
      await deleteStorageItem(TOKEN_KEYS.ID);
      // Reseta a flag após 2 segundos
      setTimeout(() => { isHandling401 = false; }, 2000);
    }

    return Promise.reject({ statusCode: status, message });
  }
);

export default api;
