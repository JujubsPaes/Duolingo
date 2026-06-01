/**
 * Tela inicial — decide pra onde mandar o usuário.
 *
 * Se tem token salvo, busca os dados do usuario no backend e vai pra home.
 * Se não tem token, manda pra tela de login.
 */

import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { getStorageItem, TOKEN_KEYS } from "../services/api";
import * as progressService from "../services/progressService";
import { useUserStore } from "../store/userStore";
import { useAchievementStore } from "../store/achievementStore";

export default function Index() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getStorageItem(TOKEN_KEYS.ACCESS);

        if (!token) {
          // Sem token — manda pro login
          router.replace("/(auth)/login");
          return;
        }

        // Tem token — busca os dados atualizados do backend
        const gamification = await progressService.getGamification();

        // Hidrata o store ANTES de navegar (garante que a home já tem os dados)
        useUserStore.getState().hydrateFromGamification(gamification);

        // Restaura role e nome do usuário
        const data = gamification as any;
        if (data.role) {
          useUserStore.setState({ role: data.role });
        }
        if (data.name) {
          useUserStore.setState({ username: data.name });
        }

        useAchievementStore.getState().hydrateFromApi(gamification.achievements);

        // Agora sim navega pra home (store já preenchido)
        router.replace("/(app)/home");
      } catch {
        // Token inválido ou backend offline — manda pro login
        router.replace("/(auth)/login");
      }
    }

    checkAuth();
  }, []);

  // Mostra loading enquanto verifica
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58CC02" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000721",
    justifyContent: "center",
    alignItems: "center",
  },
});
