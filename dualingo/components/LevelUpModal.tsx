/**
 * Modal de level-up — um único popup de celebração.
 */

import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({
  visible,
  newLevel,
  onClose,
}: LevelUpModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Parabéns!</Text>
          <Text style={styles.subtitle}>Você subiu de nível!</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lvl {newLevel}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Continuar"
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/*10Análise crítica do projeto

### Melhoria técnica: Persistência local com AsyncStorage ou MMKV

Atualmente, ao fechar o app completamente, o estado dos stores Zustand (`progressStore`, `achievementStore`) é perdido. Na próxima abertura, a função `guard()` busca apenas os dados de gamificação no backend (`/gamification`), mas o progresso de quais lições estão desbloqueadas vem de mocks locais.

**Sugestão:** Adicionar persistência com o middleware `persist` do Zustand usando `expo-secure-store` ou `react-native-mmkv` como storage:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProgressStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'dualingo-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

Isso garantiria que o progresso das lições seja preservado entre sessões sem depender do backend, melhorando a experiência offline e reduzindo chamadas à API.

---

### Melhoria de UX: Feedback háptico ao confirmar resposta

O app já tem `expo-haptics` como dependência no `package.json`, mas ele não está sendo utilizado na tela de exercícios. Adicionar vibração ao confirmar uma resposta certa ou errada tornaria a experiência muito mais similar ao Duolingo original:

```tsx
// Em question.tsx, dentro de handleConfirm():
import * as Haptics from 'expo-haptics';

function handleConfirm() {
  if (!selectedAnswerId || !exercise) return;
  const isCorrect = selectedAnswerId === exercise.correctAnswerId;

  if (isCorrect) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  // ... resto da lógica
}
```

Essa melhoria custaria literalmente 3 linhas de código e elevaria significativamente a percepção de qualidade do produto para usuários de dispositivos físicos.

---

### Funcionalidade para próxima versão: Modo offline com fila de sincronização

Hoje, se o usuário estiver sem internet e concluir uma lição, a chamada `POST /lessons/{id}/complete` falha silenciosamente (apenas um `console.warn`). O XP é calculado localmente, mas o progresso não é salvo no backend.

**Proposta:** Implementar uma fila de sincronização offline com `react-native-netinfo` para detectar conectividade e persistir as ações pendentes localmente:

```typescript
// services/syncQueue.ts
interface PendingAction {
  type: 'complete_lesson';
  lessonId: string;
  answers: Record<string, string>;
  timestamp: number;
}

async function flushQueue(): Promise<void> {
  const queue = await loadQueueFromStorage();
  for (const action of queue) {
    await lessonService.completeLesson(action.lessonId, { answers: action.answers });
  }
  await clearQueue();
}
```

Isso permitiria que o usuário estudasse no metrô ou em locais sem sinal e tivesse seu progresso sincronizado automaticamente na próxima vez que abrisse o app com conexão. É uma feature especialmente relevante para o público-alvo de apps educacionais. */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 7, 33, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    backgroundColor: "#0D1B3E",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#00DF21",
    width: "100%",
    maxWidth: 320,
    shadowColor: "#00DF21",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    color: "#00DF21",
    fontSize: 24,
    fontWeight: "800",
    textShadowColor: "#00DF21",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  levelBadge: {
    backgroundColor: "rgba(0, 223, 33, 0.15)",
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#00DF21",
  },
  levelText: {
    color: "#00DF21",
    fontSize: 32,
    fontWeight: "900",
    textShadowColor: "#00DF21",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  button: {
    backgroundColor: "#00DF21",
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
    minWidth: 160,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: "#000721",
    fontSize: 16,
    fontWeight: "800",
  },
});
