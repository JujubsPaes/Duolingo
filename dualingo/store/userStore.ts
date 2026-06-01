/**
 * userStore — Estado global do usuário logado.
 *
 * Usa Zustand pra manter os dados do perfil acessível em qualquer tela.
 * Quando o usuario faz login, o store é "hidratado" com os dados da API.
 * Quando faz logout, reseta tudo pro estado inicial.
 */

import { create } from "zustand";
import { User, UserRole, GamificationData } from "../types";

interface UserState {
  // Dados básicos do perfil
  userId: string | undefined;
  username: string;
  email: string;
  avatarUri: string | undefined;
  role: UserRole; // "admin" mostra o painel de gestão, "user" mostra a trilha normal

  // Dados de gamificação (espelhados aqui pra acesso rápido nas telas)
  level: number;
  streak: number;
  currentXP: number;
  nextLevelXP: number;

  // Ações pra atualizar campos individuais (usadas na tela de configurações)
  setUsername: (name: string) => void;
  setAvatarUri: (uri: string | undefined) => void;

  // Preenche o store inteiro com os dados que vem da API
  hydrateFromUser: (user: User) => void;
  hydrateFromGamification: (data: GamificationData) => void;

  // Limpa tudo quando o usuário desloga
  reset: () => void;
}

/**
 * Retorna quanto XP falta pro proximo nível.
 * A tabela de níveis segue a regra de negócio do PRD.
 */
function getNextLevelXP(level: number): number {
  const thresholds: Record<number, number> = {
    1: 1000,   // Nível 1: precisa de 1000 XP pra subir
    2: 2500,   // Nível 2: precisa de 2500 XP
    3: 5000,   // Nível 3: precisa de 5000 XP
    4: 10000,  // Nível 4: precisa de 10000 XP
  };
  return thresholds[level] ?? Infinity; // Nível 5 é o máximo
}

// Estado inicial — usado antes do login e após o logout
const INITIAL_STATE = {
  userId: undefined,
  username: "Username",
  email: "",
  avatarUri: undefined,
  role: "user" as UserRole,
  level: 1,
  streak: 0,
  currentXP: 0,
  nextLevelXP: 100,
};

export const useUserStore = create<UserState>((set) => ({
  ...INITIAL_STATE,

  // Atualiza só o nome (chamado pela tela de configurações)
  setUsername: (name) => set({ username: name }),

  // Atualiza só o avatar (chamado após selecionar foto na galeria)
  setAvatarUri: (uri) => set({ avatarUri: uri }),

  // Preenche o store com os dados do usuario que voltam do POST /auth/login
  hydrateFromUser: (user: User) =>
    set({
      userId: user.userId,
      username: user.name,
      email: user.email,
      avatarUri: user.avatarUrl,
      role: user.role ?? "user",
      level: user.level,
      streak: user.streak,
      currentXP: user.xp,
      nextLevelXP: getNextLevelXP(user.level),
    }),

  // Atualiza XP e streak com dados frescos do GET /gamification
  hydrateFromGamification: (data: GamificationData) =>
    set({
      level: data.level,
      streak: data.streak,
      currentXP: data.xp,
      nextLevelXP: getNextLevelXP(data.level),
    }),

  // Reseta tudo — chamado no logout
  reset: () => set(INITIAL_STATE),
}));
