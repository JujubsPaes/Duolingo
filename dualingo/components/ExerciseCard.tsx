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
