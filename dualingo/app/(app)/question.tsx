/**
 * QuestionScreen — Tela de exercícios de uma lição.
 * Aprovado com >= 70% de acerto; caso contrário não avança na trilha.
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import ExerciseCard from "../../components/ExerciseCard";
import Button from "../../components/ui/Button";
import Header from "../../components/Header";
import BottomNavBar from "../../components/BottomNavBar";
import XPResultScreen from "../../components/XPResultScreen";
import AchievementUnlockedModal from "../../components/AchievementUnlockedModal";
import { Theme, Colors } from "../../constants/colors";
import { getExercisesByLesson, DEMO_EXERCISES } from "../../data/mockExercises";
import { useGamification } from "../../store/gamificationStore";
import { useProgressStore } from "../../store/progressStore";
import { useAchievementStore } from "../../store/achievementStore";
import { useUserStore } from "../../store/userStore";
import { useResponsiveScale } from "../../hooks/useResponsiveScale";
import * as lessonService from "../../services/lessonService";
import type { ExerciseFeedback } from "../../types/exercise";
import type { XPBreakdown } from "../../types/gamification";

function normalizeRouteParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function QuestionScreen() {
  const { rs } = useResponsiveScale();
  const { state, completeLesson } = useGamification();
  const progressComplete = useProgressStore((s) => s.completeLesson);
  const { username, avatarUri, streak } = useUserStore();
  const level = state.level > 0 ? state.level : 1;

  const { courseId: courseIdParam, lessonId: lessonIdParam } = useLocalSearchParams<{
    courseId?: string | string[];
    lessonId?: string | string[];
  }>();
  const courseId = normalizeRouteParam(courseIdParam);
  const lessonId = normalizeRouteParam(lessonIdParam);

  const exercises = lessonId
    ? getExercisesByLesson(lessonId)
    : DEMO_EXERCISES;

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  // Guarda a resposta de cada exercício para enviar ao backend no final
  const answersRef = React.useRef<Record<string, string>>({});
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [lessonResult, setLessonResult] = useState<XPBreakdown | null>(null);
  const [finalXP, setFinalXP] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [previousLevel, setPreviousLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<"home" | "progress" | "settings">("home");

  const [results, setResults] = useState<(boolean | null)[]>(
    () => exercises.map(() => null)
  );

  const exercise = exercises[exerciseIndex];
  const total = exercises.length;
  const isLastExercise = exerciseIndex >= total - 1;
  const hasSubmitted = Boolean(feedback?.submitted);

  function handleConfirm() {
    if (!selectedAnswerId || !exercise) return;
    const isCorrect = selectedAnswerId === exercise.correctAnswerId;

    // Salva a resposta no ref para enviar ao backend no final da lição
    answersRef.current[exercise.id] = selectedAnswerId;

    setResults((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = isCorrect;
      return updated;
    });

    setFeedback({
      submitted: true,
      isCorrect,
      explanation: exercise.explanation,
    });
  }

  function handleNext() {
    if (!isLastExercise) {
      setExerciseIndex((i) => i + 1);
      setSelectedAnswerId(null);
      setFeedback(null);
      return;
    }

    // Monta o mapa de respostas do usuário para enviar ao backend
    const finalResults = [...results];
    if (hasSubmitted && feedback) {
      finalResults[exerciseIndex] = feedback.isCorrect;
    }
    const finalCorrect = finalResults.filter((r) => r === true).length;
    const accuracyPercent =
      total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
    const passed =
      total > 0 && finalCorrect >= Math.ceil(total * 0.7);

    setPreviousLevel(state.level > 0 ? state.level : 1);

    // Monta o objeto de respostas { exerciseId: answerId } para o backend
    // Usa o ref que foi preenchido a cada handleConfirm
    const answersMap = { ...answersRef.current };

    // Envia as respostas ao backend para persistir XP, streak e progresso
    if (lessonId) {
      lessonService.completeLesson(lessonId, { answers: answersMap })
        .then((response) => {
          // Atualiza o store local com os dados retornados pelo backend
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

    // Atualiza a UI local imediatamente (não espera o backend)
    let breakdown: XPBreakdown;

    if (passed) {
      breakdown = completeLesson({
        correctAnswers: finalCorrect,
        totalQuestions: total,
        streakDays: state.streak,
      });

      if (courseId && lessonId) {
        const { moduleCompleted, courseCompleted } = progressComplete(
          courseId,
          lessonId
        );

        const achievementUnlock = useAchievementStore.getState().unlock;
        const currentStreak = useUserStore.getState().streak;

        achievementUnlock("first-lesson");

        if (accuracyPercent === 100) {
          achievementUnlock("perfect-score");
        }

        useAchievementStore.getState().checkStreakAchievements(currentStreak);

        if (moduleCompleted) {
          achievementUnlock("module-complete");
        }

        if (courseCompleted) {
          achievementUnlock("course-complete");
        }
      }

      setFinalXP(useUserStore.getState().currentXP);
      setFinalLevel(useUserStore.getState().level);
    } else {
      breakdown = {
        base: 0,
        streakBonus: 0,
        total: 0,
        accuracyPercent,
      };
      setFinalXP(state.xp);
      setFinalLevel(state.level > 0 ? state.level : 1);
    }

    setLessonResult(breakdown);
  }

  function goToCourse() {
    if (courseId) {
      router.replace({ pathname: "/(app)/course", params: { courseId } } as any);
    } else {
      router.replace("/(app)/home");
    }
  }

  function handleTabPress(tab: "home" | "progress" | "settings") {
    setActiveTab(tab);
    if (tab === "home") router.replace("/(app)/home");
    if (tab === "progress") router.push("/(app)/progress");
    if (tab === "settings") router.push("/(app)/settings");
  }

  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  React.useEffect(() => {
    if (newlyUnlocked && lessonResult) {
      const timer = setTimeout(() => setShowUnlockModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked, lessonResult]);

  if (lessonResult) {
    return (
      <View style={styles.root}>
        <XPResultScreen
          breakdown={lessonResult}
          currentXP={finalXP}
          currentLevel={finalLevel}
          previousLevel={previousLevel}
          onContinue={goToCourse}
        />
        <AchievementUnlockedModal
          visible={showUnlockModal}
          achievement={newlyUnlocked}
          onClose={() => {
            setShowUnlockModal(false);
            clearNewlyUnlocked();
          }}
        />
      </View>
    );
  }

  const btnLabel = hasSubmitted
    ? isLastExercise
      ? "Finalizar lição"
      : "Próximo"
    : "Confirmar";

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          username={username}
          level={level}
          streak={streak}
          avatarUri={avatarUri}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dotsRow}>
            {exercises.map((_, i) => {
              let dotColor: string;
              if (results[i] === true) {
                dotColor = Theme.lessonNodeCompleted;
              } else if (results[i] === false) {
                dotColor = Colors.error;
              } else if (i === exerciseIndex) {
                dotColor = Theme.lessonNodeAvailable;
              } else {
                dotColor = Theme.lessonNodeLocked;
              }
              return (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: dotColor }]}
                />
              );
            })}
          </View>

          <ExerciseCard
            exercise={exercise}
            selectedAnswerId={selectedAnswerId}
            onSelectAnswer={setSelectedAnswerId}
            feedback={feedback}
            disabled={hasSubmitted}
            courseId={courseId}
            embedInScreen
          />

          <View
            style={[
              styles.footer,
              {
                marginTop: rs(12),
                paddingHorizontal: rs(28),
                paddingBottom: rs(8),
                paddingTop: rs(8),
              },
            ]}
          >
            {!hasSubmitted && (
              <Button
                label="Confirmar"
                onPress={handleConfirm}
                variant={selectedAnswerId ? "primary" : "disabled"}
              />
            )}

            {hasSubmitted && (
              <Button label={btnLabel} onPress={handleNext} variant="primary" />
            )}

            {!hasSubmitted && (
              <Button label="Voltar" onPress={goToCourse} variant="secondary" />
            )}
          </View>
        </ScrollView>

        <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.screenBackground,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Theme.screenBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  footer: {
    gap: 10,
    backgroundColor: Theme.screenBackground,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
    paddingBottom: 0,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});
