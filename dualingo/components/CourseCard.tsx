import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CourseCardProps {
  title: string;
  image: ImageSourcePropType;
  onPress?: () => void;
}

export default function CourseCard({ title, image, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {/* Área da imagem com fundo próprio para preencher corretamente */}
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Nome do curso */}
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

/*5Gerenciamento de estado com React Hooks e Zustand

O projeto usa **duas abordagens** de gerenciamento de estado global, cada uma para um propósito específico.

### 5.1 — Context API + useReducer: `gamificationStore.tsx`

**Hook/Store utilizado:** `useReducer` dentro de um `GamificationProvider` (Context API)

**Informação armazenada:**
```tsx
const initialState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  studiedDays: [],
};
```

**Como ocorre a atualização do estado:**

O estado só é modificado através de `actions` disparadas pelo `dispatch`. Por exemplo, ao concluir uma lição:

```tsx
// store/gamificationStore.tsx — linha 185-212
const completeLesson = useCallback(
  (result: LessonResult): XPBreakdown => {
    const today = toLocalDateString();
    const newStreak = updateStreak(state.streak, state.lastStudyDate);
    const breakdown = calculateXPGain({ ...result, streakDays: newStreak });

    dispatch({
      type: "COMPLETE_LESSON",
      payload: { ...result, streakDays: newStreak },
    });

    syncUserStore({ ... }); // sincroniza com o Zustand
    return breakdown;
  },
  [state.xp, state.streak, state.lastStudyDate, state.studiedDays]
);
```

O `reducer` processa a action `COMPLETE_LESSON` e retorna o novo estado:

```tsx
// store/gamificationStore.tsx — linha 110-126
case "COMPLETE_LESSON": {
  const breakdown = calculateXPGain(action.payload);
  const newXP = state.xp + breakdown.total;
  const today = toLocalDateString();
  const newStreak = action.payload.streakDays;

  return {
    xp: newXP,
    level: calculateLevel(newXP),
    streak: newStreak,
    lastStudyDate: today,
    studiedDays: [...state.studiedDays, today],
  };
}
```

**Como a interface reage:** Qualquer componente que use `useGamification()` é re-renderizado automaticamente quando o estado muda. O `Header`, por exemplo, atualiza o streak e o nível exibidos imediatamente após a lição ser concluída.

---

### 5.2 — Zustand: `userStore.ts`

**Store utilizado:** `useUserStore` (Zustand)

**Informação armazenada:** Dados do perfil do usuário logado (userId, username, email, avatarUri, role, level, streak, currentXP, nextLevelXP).

**Como ocorre a atualização do estado:**

```tsx
// store/userStore.ts — linha 75-86
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
```

**Como a interface reage:** O `Header` acessa `useUserStore()` e atualiza streak e nível em tempo real. A `XPBar` na `HomeScreen` usa `state.xp` e `state.level` do `gamificationStore`, que por sua vez chama `syncUserStore()` para manter ambos sincronizados.

--- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E6E6E6",
    width: "46%",
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  // Container da imagem com altura fixa e borderRadius
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    overflow: "hidden",
  },
  // Imagem preenche o container com borderRadius
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 8,

  },
});
