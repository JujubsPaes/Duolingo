import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GamificationProvider } from "../store/gamificationStore";

/**
 * Layout raiz do app.
 * O GamificationProvider envolve toda a navegação para que qualquer
 * tela possa acessar o estado de XP, nível e streak via useGamification().
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GamificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </GamificationProvider>
    </SafeAreaProvider>
  );
}
