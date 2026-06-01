/**
 * HomeScreen — Tela principal do app.
 *
 * Se o usuário logado for admin, exibe o painel administrativo.
 * Se for um aluno comum, exibe a trilha de cursos normalmente.
 */

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AdminPanel from "../../components/admin/AdminPanel";
import BottomNavBar from "../../components/BottomNavBar";
import CourseCard from "../../components/CourseCard";
import FadeSlideIn from "../../components/ui/FadeSlideIn";
import Header from "../../components/Header";
import ScreenLoader from "../../components/ui/ScreenLoader";
import StreakDebugPanel from "../../components/StreakDebugPanel";
import XPBar from "../../components/XPBar";
import { useUserStore } from "../../store/userStore";
import { useGamification } from "../../store/gamificationStore";
import { useAchievementStore } from "../../store/achievementStore";
import * as progressService from "../../services/progressService";

const COURSES = [
  {
    id: "expo",
    title: "Expo",
    image: require("../../assets/images/expo-logo.png"),
  },
  {
    id: "aws",
    title: "Amazon AWS",
    image: require("../../assets/images/aws-logo.png"),
  },
];

export default function HomeScreen() {
  const { username, avatarUri, streak, role } = useUserStore();
  const { state, hydrate } = useGamification();
  const level = state.level > 0 ? state.level : 1;
  const xp = state.xp ?? 0;

  const [pageReady, setPageReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "progress" | "settings">("home");

  // Se o usuário for admin, renderiza o painel administrativo
  const isAdmin = role === "admin";

  // Ao montar a Home, busca os dados atualizados do backend e hidrata os stores
  useEffect(() => {
    // Admin não precisa buscar gamificação
    if (isAdmin) return;

    progressService.getGamification()
      .then((data) => {
        // Hidrata o gamificationStore (XP, nível, streak exibidos na tela)
        hydrate({
          xp: data.xp,
          level: data.level,
          streak: data.streak,
          lastStudyDate: data.lastStudyDate ?? null,
        });
        // Hidrata o userStore (header, settings)
        useUserStore.getState().hydrateFromGamification(data);
        // Hidrata as conquistas
        useAchievementStore.getState().hydrateFromApi(data.achievements);
      })
      .catch(() => {
        // Se falhar (ex: sem token), usa os dados locais
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabPress(tab: "home" | "progress" | "settings") {
    setActiveTab(tab);
    if (tab === "settings") router.push("/(app)/settings");
    if (tab === "progress") router.push("/(app)/progress");
  }

  function handleCoursePress(courseId: string, title: string) {
    router.push({ pathname: "/(app)/course", params: { courseId, title } } as any);
  }

  return (
    <View style={styles.root}>
      {pageReady && (
        <>
          {/* Admin vê o painel administrativo no lugar da trilha */}
          {isAdmin ? (
            <AdminPanel />
          ) : (
            <SafeAreaView style={styles.safeArea}>
              <FadeSlideIn delay={0}>
                <Header
                  username={username}
                  level={level}
                  streak={streak}
                  avatarUri={avatarUri}
                />
              </FadeSlideIn>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <FadeSlideIn delay={80} style={styles.xpBarWrapper}>
                  <XPBar xp={xp} level={level} />
                </FadeSlideIn>

                <FadeSlideIn delay={160} style={{ width: "100%" }}>
                  <Text style={styles.sectionTitle}>Escolha um dos cursos!</Text>
                </FadeSlideIn>

                <FadeSlideIn delay={240} style={styles.coursesGrid}>
                  {COURSES.map((course) => (
                    <CourseCard
                      key={course.id}
                      title={course.title}
                      image={course.image}
                      onPress={() => handleCoursePress(course.id, course.title)}
                    />
                  ))}
                </FadeSlideIn>

                <FadeSlideIn delay={320} style={{ width: "100%" }}>
                  <StreakDebugPanel />
                </FadeSlideIn>
              </ScrollView>

              <FadeSlideIn delay={400}>
                <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
              </FadeSlideIn>
            </SafeAreaView>
          )}
        </>
      )}

      <ScreenLoader visible={!pageReady} onHidden={() => setPageReady(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000721",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#000721",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  xpBarWrapper: {
    alignSelf: "center",
    width: "60%",
    marginVertical: 8,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 32,
    textAlign: "center",
  },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
});
