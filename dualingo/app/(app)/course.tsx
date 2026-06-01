/**
 * CourseScreen — Tela de trilha de aprendizado do curso.
 *
 * Comportamentos:
 *  - Exibe módulos como "Módulo 1", "Módulo 2", etc. com o nome completo como subtítulo
 *  - Ao voltar de uma lição concluída, faz scroll automático até a próxima lição disponível
 *  - Se o módulo atual for concluído, abre automaticamente o próximo módulo
 *
 * Fluxo:
 *   Home → CourseScreen → QuestionScreen → CourseScreen (scroll na próxima lição)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import BottomNavBar from "../../components/BottomNavBar";
import Header from "../../components/Header";
import LessonNode from "../../components/LessonNode";
import XPBar from "../../components/XPBar";
import { Theme } from "../../constants/colors";
import { MOCK_COURSES } from "../../data/mockCourses";
import { useGamification } from "../../store/gamificationStore";
import { useProgressStore } from "../../store/progressStore";
import { useUserStore } from "../../store/userStore";
import * as courseService from "../../services/courseService";
import type { Lesson as LessonNodeLesson } from "../../components/LessonNode";
import type { Lesson } from "../../types";

// ── Helper ────────────────────────────────────────────────────────────────────

/** Expo Router na web pode devolver params como string ou string[] */
function normalizeRouteParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Converte Lesson para o formato do LessonNode usando o mapa do store */
function toLessonNodeFormat(
  lesson: Lesson,
  statusMap: Record<string, Lesson["status"]>
): LessonNodeLesson {
  return {
    id: lesson.lessonId,
    title: lesson.name,
    status: statusMap[lesson.lessonId] ?? lesson.status,
    description: `Ganhe até 1000 XP`,
  };
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function CourseScreen() {
  const { courseId: courseIdParam } = useLocalSearchParams<{
    courseId?: string | string[];
  }>();
  const resolvedCourseId = normalizeRouteParam(courseIdParam) || "expo";

  // Dados de perfil e gamificação
  const { username, avatarUri, streak } = useUserStore();
  const { state } = useGamification();
  const level = state.level > 0 ? state.level : 1;
  const xp    = state.xp ?? 0;

  // Store de progresso — fonte de verdade para status das lições
  const initCourse = useProgressStore((s) => s.initCourse);
  const overrides = useProgressStore((s) => s.overrides);

  // Calcula o mapa de status a partir dos overrides + mock
  // Usa useMemo para evitar criar novo objeto a cada render (previne loop infinito)
  const lessonStatuses = React.useMemo(() => {
    const course = MOCK_COURSES[resolvedCourseId];
    if (!course) return {} as Record<string, Lesson["status"]>;
    const courseOverrides = overrides[resolvedCourseId] ?? {};
    const map: Record<string, Lesson["status"]> = {};
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        map[lesson.lessonId] = courseOverrides[lesson.lessonId] ?? lesson.status;
      }
    }
    return map;
  }, [resolvedCourseId, overrides]);

  // Inicializa o progresso do curso ao montar (idempotente)
  useEffect(() => {
    initCourse(resolvedCourseId);

    // Busca o status real das lições no backend para cada módulo
    const course = MOCK_COURSES[resolvedCourseId];
    if (!course) return;

    // Inicia o curso no backend se ainda não foi iniciado
    // Retorna 400 se já foi iniciado — isso é esperado e ignorado
    courseService.startCourse(resolvedCourseId).catch(() => { /* já iniciado */ });

    // Para cada módulo, busca o status das lições no backend
    for (const mod of course.modules) {
      courseService.getModule(resolvedCourseId, mod.moduleId)
        .then((moduleData) => {
          // Atualiza os overrides com o status vindo do backend
          const newOverrides: Record<string, Lesson["status"]> = {};
          for (const lesson of moduleData.lessons) {
            newOverrides[lesson.lessonId] = lesson.status;
          }
          // Aplica os overrides no progressStore
          useProgressStore.setState((state) => ({
            overrides: {
              ...state.overrides,
              [resolvedCourseId]: {
                ...(state.overrides[resolvedCourseId] ?? {}),
                ...newOverrides,
              },
            },
          }));
        })
        .catch(() => {
          // Se falhar, usa os dados locais (mock)
        });
    }
  }, [resolvedCourseId, initCourse]);

  const [activeTab, setActiveTab] = useState<"home" | "progress" | "settings">("home");

  const courseData = MOCK_COURSES[resolvedCourseId];
  const defaultExpandedModuleId = courseData?.modules[0]?.moduleId ?? null;

  // ── Lógica de módulo expandido ──────────────────────────────────────────────

  /**
   * Encontra o módulo que contém a próxima lição disponível.
   * Usado para abrir automaticamente o módulo certo ao voltar de uma lição.
   */
  const findActiveModuleId = useCallback(
    (statuses: Record<string, Lesson["status"]>): string | null => {
      if (!courseData) return null;

      // Procura o módulo que tem pelo menos uma lição "available"
      for (const mod of courseData.modules) {
        const hasAvailable = mod.lessons.some(
          (l) => statuses[l.lessonId] === "available"
        );
        if (hasAvailable) return mod.moduleId;
      }

      // Se não há nenhuma disponível, abre o primeiro módulo
      return courseData.modules[0]?.moduleId ?? null;
    },
    [courseData]
  );

  // Módulo expandido: abre o primeiro módulo por padrão (evita lista vazia na web)
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    defaultExpandedModuleId
  );

  // Atualiza o módulo expandido apenas quando os overrides mudam
  // (ex: ao voltar de uma lição concluída e a próxima estar em outro módulo)
  useEffect(() => {
    const activeId = findActiveModuleId(lessonStatuses);
    if (activeId) {
      setExpandedModuleId(activeId);
    }
  }, [lessonStatuses, findActiveModuleId]);

  // ── Scroll automático até a próxima lição ──────────────────────────────────

  const scrollRef = useRef<any>(null);

  // Rastreia o offset atual do ScrollView para calcular o scroll alvo
  const scrollOffset = useRef(0);

  /**
   * Recebe a posição Y ABSOLUTA NA TELA da lição available (via measureInWindow
   * no LessonNode) e faz scroll para centralizá-la verticalmente.
   *
   * Como o ScrollView já está scrollado em alguma posição (scrollOffset),
   * o cálculo é:
   *   novoScroll = scrollAtual + (posicaoNaTela - metadaTela)
   */
  const handleAvailableLessonY = useCallback(
    (absolutePageY: number) => {
      const screenHalf = Dimensions.get('window').height / 2;
      // absolutePageY = posição da elipse na tela agora
      // scrollOffset.current = quanto o ScrollView já scrollou
      // targetScroll = scroll necessário para centralizar a elipse
      const targetScroll = Math.max(
        0,
        scrollOffset.current + (absolutePageY - screenHalf)
      );

      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: targetScroll, animated: true });
      }, 50);
    },
    []
  );

  if (!courseData) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Curso não encontrado.</Text>
        </SafeAreaView>
      </View>
    );
  }

  // Progresso geral do curso
  const allLessonIds = courseData.modules.flatMap((m) =>
    m.lessons.map((l) => l.lessonId)
  );
  const completedCount = allLessonIds.filter(
    (id) => lessonStatuses[id] === "completed"
  ).length;
  const progressPercent =
    allLessonIds.length > 0
      ? Math.round((completedCount / allLessonIds.length) * 100)
      : 0;

  function handleStartLesson(lesson: LessonNodeLesson) {
    router.push({
      pathname: "/(app)/question",
      params: { lessonId: lesson.id, courseId: resolvedCourseId },
    } as any);
  }

  function handleTabPress(tab: "home" | "progress" | "settings") {
    setActiveTab(tab);
    if (tab === "home") router.replace("/(app)/home");
    if (tab === "progress") router.push("/(app)/progress");
    if (tab === "settings") router.push("/(app)/settings");
  }

  function toggleModule(moduleId: string) {
    setExpandedModuleId((prev) => (prev === moduleId ? null : moduleId));
  }

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={scrollRef as any}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            // Mantém o offset atual para o cálculo do scroll automático
            scrollOffset.current = e.nativeEvent.contentOffset.y;
          }}
        >
          {/* XPBar de nível */}
          <View style={styles.xpBarWrapper}>
            <XPBar xp={xp} level={level} />
          </View>

          {/* Barra de progresso do curso */}
          <View style={styles.xpBarWrapper}>
            <Text style={styles.progressLabel}>Progress</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: progressPercent > 0 ? `${progressPercent}%` : 4 },
                ]}
              />
            </View>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>

          {/* Lista de módulos */}
          {courseData.modules.map((module, moduleIndex) => {
            const isExpanded = expandedModuleId === module.moduleId;

            // Módulo bloqueado = todas as lições ainda bloqueadas
            const isModuleLocked = module.lessons.every(
              (l) => lessonStatuses[l.lessonId] === "locked"
            );

            return (
              <View
                key={module.moduleId}
                style={styles.moduleSection}
              >
                {/* Cabeçalho do módulo: "Módulo N" + nome completo como subtítulo */}
                <TouchableOpacity
                  style={styles.moduleHeader}
                  onPress={() => toggleModule(module.moduleId)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Módulo ${moduleIndex + 1}: ${module.name} — ${isExpanded ? "colapsar" : "expandir"}`}
                >
                  <View style={styles.moduleTitleBlock}>
                    {/* Número do módulo — sempre visível */}
                    <Text
                      style={[
                        styles.moduleTitle,
                        isModuleLocked && styles.moduleTitleLocked,
                      ]}
                    >
                      Módulo {moduleIndex + 1}
                    </Text>

                    {/* Nome completo do módulo — subtítulo menor */}
                    <Text
                      style={[
                        styles.moduleSubtitle,
                        isModuleLocked && styles.moduleSubtitleLocked,
                      ]}
                    >
                      {module.name}
                    </Text>
                  </View>

                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={isModuleLocked ? "rgba(255,255,255,0.3)" : "#FFFFFF"}
                  />
                </TouchableOpacity>

                {/* Trilha de lições — só renderiza quando expandido */}
                {isExpanded && (
                  <LessonNode
                    title={module.name}
                    lessons={module.lessons.map((l) =>
                      toLessonNodeFormat(l, lessonStatuses)
                    )}
                    onStart={handleStartLesson}
                    hideHeader
                    onAvailableLessonY={handleAvailableLessonY}
                  />
                )}
              </View>
            );
          })}

          <View style={{ height: 20 }} />
        </ScrollView>

        <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.screenBackground,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Theme.screenBackground,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  xpBarWrapper: {
    alignSelf: "center",
    width: "60%",
    marginTop: 12,
    marginBottom: 12,
  },

  progressLabel: {
    color: "#CC44FF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
    textShadowColor: "#CC44FF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  progressTrack: {
    height: 10,
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#CC44FF",
    borderRadius: 5,
    minWidth: 4,
  },
  progressPercent: {
    color: "#CC44FF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  moduleSection: {
    marginTop: 4,
  },

  // Cabeçalho do módulo: linha com bloco de texto + chevron
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  // Bloco de texto: número em cima, nome completo embaixo
  moduleTitleBlock: {
    alignItems: "center",
    gap: 2,
  },

  // "Módulo 1" — título principal, grande
  moduleTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  moduleTitleLocked: {
    color: "rgba(255,255,255,0.3)",
  },

  // Nome completo do módulo — subtítulo menor
  moduleSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "400",
  },
  moduleSubtitleLocked: {
    color: "rgba(255,255,255,0.2)",
  },

  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
