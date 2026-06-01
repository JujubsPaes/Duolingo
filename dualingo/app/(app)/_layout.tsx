/**
 * Layout das telas autenticadas — auth guard.
 *
 * Se o usuário não está logado (sem token), redireciona pro login.
 * Se está logado mas o store está vazio (F5), busca os dados no backend primeiro.
 */

import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { Theme } from "../../constants/colors";
import { getStorageItem, TOKEN_KEYS } from "../../services/api";
import * as progressService from "../../services/progressService";
import { useUserStore } from "../../store/userStore";
import { useAchievementStore } from "../../store/achievementStore";

export default function AppLayout() {
  const [ready, setReady] = useState(false);
  const userId = useUserStore((s) => s.userId);

  useEffect(() => {
    async function guard() {
      // Se o store já tem userId, o usuário logou nessa sessão — tudo certo
      if (userId) {
        setReady(true);
        return;
      }

      // Store vazio (F5 ou acesso direto) — checa se tem token salvo
      const token = await getStorageItem(TOKEN_KEYS.ACCESS);

      if (!token) {
        // Sem token = não logado, manda pro login
        router.replace("/(auth)/login");
        return;
      }

      // Tem token — restaura a sessão buscando dados do backend
      try {
        const data = await progressService.getGamification() as any;

        useUserStore.getState().hydrateFromGamification(data);

        if (data.role) useUserStore.setState({ role: data.role });
        if (data.name) useUserStore.setState({ username: data.name });
        if (data.userId) useUserStore.setState({ userId: data.userId });

        useAchievementStore.getState().hydrateFromApi(data.achievements);

        setReady(true);
      } catch {
        // Token expirado ou backend offline — manda pro login
        router.replace("/(auth)/login");
      }
    }

    guard();
  }, [userId]);

  // Mostra loading enquanto verifica autenticação
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Theme.screenBackground },
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="course" />
      <Stack.Screen name="question" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#000721",
    justifyContent: "center",
    alignItems: "center",
  },
});
