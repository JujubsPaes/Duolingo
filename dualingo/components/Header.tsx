import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Avatar from "./Avatar";
import StreakBadge from "./StreakBadge";

const GREEN = "#00DF21";

interface HeaderProps {
  username: string;
  level: number;
  streak: number;
  avatarUri?: string; // URL da foto de perfil (opcional — usa iniciais como fallback)
}

// Header principal do app: avatar + nome/nível à esquerda, streak à direita
export default function Header({ username, level, streak, avatarUri }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Lado esquerdo: avatar + info do usuário */}
      <View style={styles.userInfo}>
        {/* Avatar com suporte a foto real e fallback de iniciais */}
        <Avatar
          uri={avatarUri}
          name={username}
          size="md"
        />

        <View style={styles.textBlock}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.level}>Lvl {level}</Text>
        </View>
      </View>

      {/* Lado direito: streak */}
      <StreakBadge streak={streak} />
    </View>
  );
}

/*7Fluxo completo de uma funcionalidade com backend

### Funcionalidade: Conclusão de uma lição

```
Usuário
  ↓ Responde todos os exercícios e toca em "Finalizar lição"
Interface (question.tsx)
  ↓ handleNext() → calcula acertos, monta answersMap
Evento
  ↓ Chama completeLesson() do gamificationStore (UI atualiza imediatamente)
  ↓ Chama progressComplete() do progressStore (desbloqueia próxima lição)
  ↓ Chama achievementUnlock() do achievementStore (verifica conquistas)
Serviço (lessonService.ts)
  ↓ lessonService.completeLesson(lessonId, { answers: answersMap })
API (api.ts + backend)
  ↓ POST /lessons/{id}/complete com payload JSON
  ↓ Backend valida respostas, calcula XP, atualiza banco de dados
Resposta
  ↓ { passed, newXP, newLevel, newStreak, nextLessonId }
Atualização da Interface
  ↓ useUserStore.hydrateFromGamification() atualiza XP/nível/streak
  ↓ setLessonResult(breakdown) → renderiza XPResultScreen
  ↓ AchievementUnlockedModal aparece se houve conquista nova
```

**Trecho completo do fluxo em `question.tsx`:**

```tsx
// Passo 1: Usuário toca em "Finalizar lição" → handleNext() é chamado
// Passo 2: Calcula resultado local
const finalCorrect = finalResults.filter((r) => r === true).length;
const passed = total > 0 && finalCorrect >= Math.ceil(total * 0.7);

// Passo 3: Monta o mapa de respostas para o backend
const answersMap = { ...answersRef.current };

// Passo 4: Envia ao backend (não bloqueia a UI)
if (lessonId) {
  lessonService.completeLesson(lessonId, { answers: answersMap })
    .then((response) => {
      if (response.passed) {
        useUserStore.getState().hydrateFromGamification({
          xp: response.newXP ?? state.xp,
          level: response.newLevel ?? state.level,
          streak: response.newStreak ?? state.streak,
          achievements: [],
        });
      }
    })
    .catch((err) => {
      console.warn("[QuestionScreen] Erro ao salvar no backend:", err?.message);
    });
}

// Passo 5: Atualiza a UI imediatamente (optimistic update)
if (passed) {
  breakdown = completeLesson({
    correctAnswers: finalCorrect,
    totalQuestions: total,
    streakDays: state.streak,
  });

  // Passo 6: Verifica conquistas
  achievementUnlock("first-lesson");
  if (accuracyPercent === 100) achievementUnlock("perfect-score");

  // Passo 7: Exibe tela de resultado
  setFinalXP(useUserStore.getState().currentXP);
  setFinalLevel(useUserStore.getState().level);
}

setLessonResult(breakdown); // Dispara renderização do XPResultScreen
```

**O `gamificationStore` processa o cálculo de XP:**

```tsx
// store/gamificationStore.tsx — linha 30-48
export function calculateXPGain(result: LessonResult): XPBreakdown {
  const base = Math.round(
    (result.correctAnswers / Math.max(result.totalQuestions, 1)) * 1000
  );
  const streakBonus =
    result.streakDays > 0 && result.streakDays % 7 === 0 ? 500 : 0;

  return {
    base,
    streakBonus,
    total: base + streakBonus,
    accuracyPercent,
  };
}
```

**O `progressService` fornece os dados de gamificação na Home:**

```typescript
// services/progressService.ts — linha 37-40
export async function getGamification(): Promise<GamificationData> {
  const response = await api.get<ApiResponse<GamificationData>>("/gamification");
  return response.data.data;
}
``` */


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#32374A",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textBlock: {
    justifyContent: "center",
    gap: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  level: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: GREEN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
