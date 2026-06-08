import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Theme } from "../constants/colors";
import { DEFAULT_EXERCISE_IMAGE, getExerciseImage } from "../constants/exerciseAssets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveScale } from "../hooks/useResponsiveScale";
import type {
  Exercise,
  ExerciseCardProps,
  ExerciseFeedback,
  ExerciseOption,
} from "../types/exercise";
import OptionRow, { type OptionVisualState } from "./exercise/OptionRow";

const DEFAULT_PROMPT = "Qual das alternativas está correta:";

const TRUE_FALSE_OPTIONS: ExerciseOption[] = [
  { id: "true", label: "Verdadeiro" },
  { id: "false", label: "Falso" },
];

function getOptions(exercise: Exercise): ExerciseOption[] {
  if (exercise.type === "true_false") {
    return TRUE_FALSE_OPTIONS;
  }
  return exercise.options;
}

function resolveOptionState(
  optionId: string,
  selectedAnswerId: string | null,
  correctAnswerId: string,
  feedback: ExerciseFeedback | null | undefined
): OptionVisualState {
  if (!feedback?.submitted) {
    return selectedAnswerId === optionId ? "selected" : "default";
  }

  if (optionId === correctAnswerId) {
    return "correct";
  }

  if (optionId === selectedAnswerId && !feedback.isCorrect) {
    return "incorrect";
  }

  return "default";
}

function FeedbackBanner({
  feedback,
  fontSize,
}: {
  feedback: ExerciseFeedback;
  fontSize: number;
}) {
  const isCorrect = feedback.isCorrect;

/*6Chamada ao backend

### Endpoint: `POST /lessons/{id}/complete`

Esta chamada é feita em `services/lessonService.ts` e disparada pela tela `question.tsx` ao finalizar todos os exercícios.

### Arquivo: `services/lessonService.ts`

```typescript
// services/lessonService.ts — linha 41-50
export async function completeLesson(
  lessonId: string,
  data: CompleteLessonRequest
): Promise<CompleteLessonResponse> {
  const response = await api.post<ApiResponse<CompleteLessonResponse>>(
    `/lessons/${lessonId}/complete`,
    data
  );
  return response.data.data;
}
```

### Método HTTP utilizado
`POST`

### Dados enviados

```typescript
// services/lessonService.ts — linha 5-7
interface CompleteLessonRequest {
  answers: Record<string, string>; // { exerciseId: answerId }
}
```

Exemplo de payload real:
```json
{
  "answers": {
    "exercise-1": "option-b",
    "exercise-2": "true",
    "exercise-3": "option-a"
  }
}
```

### Resposta esperada

```typescript
// services/lessonService.ts — linha 9-18
interface CompleteLessonResponse {
  passed: boolean;       // true se acertou >= 70%
  correctCount: number;
  wrongCount: number;
  xpEarned: number;
  newXP?: number;        // XP total atualizado
  newLevel?: number;     // nível atualizado
  newStreak?: number;    // streak atualizado
  nextLessonId?: string; // próxima lição desbloqueada
}
```

### Como a aplicação trata possíveis erros

```tsx
// app/(app)/question.tsx — linha 117-133
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
```

A aplicação usa uma estratégia de **otimistic update**: a UI é atualizada imediatamente com os cálculos locais (`completeLesson` do `gamificationStore`) sem esperar o backend. Se a chamada falhar (backend offline, token expirado), apenas loga um aviso — o usuário não perde o progresso local da sessão.

O tratamento global de erros HTTP fica no interceptor de `api.ts`:

```typescript
// services/api.ts — linha 96-118
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (!error.response) {
      return Promise.reject({ statusCode: 0, message: "Não foi possível conectar ao servidor." });
    }
    const status = error.response.status;
    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      await deleteStorageItem(TOKEN_KEYS.ACCESS);
      await deleteStorageItem(TOKEN_KEYS.REFRESH);
      await deleteStorageItem(TOKEN_KEYS.ID);
      setTimeout(() => { isHandling401 = false; }, 2000);
    }
    return Promise.reject({ statusCode: status, message });
  }
);
``` */

  return (
    <View
      style={[
        styles.feedbackBanner,
        isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={
        isCorrect
          ? `Correto. ${feedback.explanation ?? ""}`
          : `Incorreto. ${feedback.explanation ?? ""}`
      }
    >
      <Text style={[styles.feedbackTitle, { fontSize }]}>
        {isCorrect ? "Correto!" : "Incorreto!"}
      </Text>
      {feedback.explanation ? (
        <Text style={[styles.feedbackExplanation, { fontSize: fontSize - 2 }]}>
          {feedback.explanation}
        </Text>
      ) : null}
    </View>
  );
}

export default function ExerciseCard({
  exercise,
  selectedAnswerId,
  onSelectAnswer,
  feedback = null,
  disabled = false,
  embedInScreen = false,
  courseId,
}: ExerciseCardProps) {
  const { rs } = useResponsiveScale();
  const insets = useSafeAreaInsets();
  const options = useMemo(() => getOptions(exercise), [exercise]);
  const prompt = exercise.prompt ?? DEFAULT_PROMPT;
  const imageSource = exercise.image ?? getExerciseImage(courseId);
  const imageAlt = exercise.imageAlt ?? "Ilustração do exercício";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const isInteractionLocked = disabled || Boolean(feedback?.submitted);

  return (
    <View
      style={[
        styles.container,
        embedInScreen ? styles.containerEmbedded : styles.containerFullScreen,
        {
          paddingTop: rs(12),
          paddingBottom: embedInScreen ? 0 : insets.bottom + rs(12),
          paddingHorizontal: rs(48),
        },
      ]}
      accessibilityLabel={`Exercício: ${exercise.question}`}
    >
      <Text
        style={[styles.question, { fontSize: rs(18), marginBottom: rs(10) }]}
        accessibilityRole="header"
      >
        {exercise.question}
      </Text>

      <View style={styles.mediaArea}>
        <Image
          source={imageSource}
          style={[
            styles.mediaImage,
            { height: rs(120), marginBottom: rs(12), borderRadius: rs(10) },
          ]}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel={imageAlt}
        />
      </View>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={prompt}
        style={[styles.answersSection, { marginTop: rs(2) }]}
      >
        <Text style={[styles.prompt, { fontSize: rs(17), marginBottom: rs(8) }]}>
          {prompt}
        </Text>

        {options.map((option, index) => {
          const letter = letters[index] ?? String(index + 1);
          const visualState = resolveOptionState(
            option.id,
            selectedAnswerId,
            exercise.correctAnswerId,
            feedback
          );

          return (
            <OptionRow
              key={option.id}
              letter={letter}
              label={option.label}
              visualState={visualState}
              disabled={isInteractionLocked}
              onPress={() => onSelectAnswer(option.id)}
            />
          );
        })}
      </View>

      {feedback?.submitted ? (
        <FeedbackBanner feedback={feedback} fontSize={rs(16)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.screenBackground,
  },
  containerFullScreen: {
    flex: 1,
  },
  containerEmbedded: {
    width: "100%",
  },
  question: {
    color: Theme.text,
    fontWeight: "700",
    textAlign: "left",
  },
  mediaArea: {
    width: "100%",
    alignItems: "center",
  },
  mediaImage: {
    width: "100%",
  },
  answersSection: {
    width: "100%",
  },
  prompt: {
    color: Theme.text,
    fontWeight: "700",
    textAlign: "left",
  },
  feedbackBanner: {
    marginTop: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  feedbackCorrect: {
    backgroundColor: Theme.feedbackCorrectBg,
    borderColor: Theme.feedbackCorrectBorder,
  },
  feedbackIncorrect: {
    backgroundColor: Theme.feedbackIncorrectBg,
    borderColor: Theme.feedbackIncorrectBorder,
  },
  feedbackTitle: {
    color: Theme.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  feedbackExplanation: {
    color: Theme.textSubtle,
    lineHeight: 22,
  },
});
