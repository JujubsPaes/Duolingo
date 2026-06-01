/**
 * ProgressScreen — Tela de progresso e conquistas do usuário.
 *
 * Exibe:
 * - Resumo de XP, nível e streak no topo
 * - Lista de todas as conquistas (desbloqueadas e bloqueadas)
 * - Conquistas desbloqueadas aparecem coloridas com data e botão de resgate
 * - Conquistas bloqueadas aparecem em cinza com descrição do que falta
 * - Conquistas repetíveis mostram quantas vezes foram obtidas
 * - Animação de desbloqueio quando uma nova conquista é obtida
 * - XP é adicionado à barra ao resgatar recompensa
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AchievementBadge from "../../components/AchievementBadge";
import AchievementUnlockedModal from "../../components/AchievementUnlockedModal";
import BottomNavBar from "../../components/BottomNavBar";
import FadeSlideIn from "../../components/ui/FadeSlideIn";
import ScreenLoader from "../../components/ui/ScreenLoader";
import XPBar from "../../components/XPBar";
import { useUserStore } from "../../store/userStore";
import { useGamification } from "../../store/gamificationStore";
import { useAchievementStore } from "../../store/achievementStore";
import * as progressService from "../../services/progressService";

export default function ProgressScreen() {
  const [pageReady, setPageReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "progress" | "settings">("progress");

  // Dados de gamificação do contexto local
  const { state, addXP } = useGamification();
  const { streak } = useUserStore();

  const level = state.level > 0 ? state.level : 1;
  const xp = state.xp ?? 0;

  // Conquistas vêm do achievementStore
  const achievements = useAchievementStore((s) => s.achievements);
  const claimReward = useAchievementStore((s) => s.claimReward);
  const newlyUnlocked = useAchievementStore((s) => s.newlyUnlocked);
  const clearNewlyUnlocked = useAchievementStore((s) => s.clearNewlyUnlocked);

  // Estado do modal de conquista desbloqueada
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Garante desbloqueio se o streak já está em 7+ (ex.: via debug antes de abrir esta tela)
  useEffect(() => {
    useAchievementStore.getState().checkStreakAchievements(streak);
  }, [streak]);

  // Quando uma nova conquista é desbloqueada, exibe o modal
  useEffect(() => {
    if (newlyUnlocked) {
      setShowUnlockModal(true);
    }
  }, [newlyUnlocked]);

  // Fecha o modal e limpa a conquista recém-desbloqueada
  function handleCloseUnlockModal() {
    setShowUnlockModal(false);
    clearNewlyUnlocked();
  }

  // Contadores para o resumo
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  // Busca dados atualizados do backend ao fazer pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await progressService.getGamification();
      // Atualiza as conquistas com os dados do backend
      useAchievementStore.getState().hydrateFromApi(data.achievements);
      // Atualiza XP/nível/streak
      useUserStore.getState().hydrateFromGamification(data);
    } catch (err) {
      console.warn("[Progress] Erro ao buscar gamificação:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Resgata a recompensa e adiciona XP à barra
  function handleClaimReward(id: string) {
    const xpGained = claimReward(id);

    // Adiciona o XP da recompensa ao gamificationStore (atualiza a barra em tempo real)
    if (xpGained > 0) {
      addXP(xpGained);
    }

    // Persiste no backend (marca como resgatada e adiciona XP)
    progressService.claimAchievementReward(id).catch((err) => {
      console.warn("[Progress] Erro ao resgatar conquista no backend:", err?.message);
    });
  }

  function handleTabPress(tab: "home" | "progress" | "settings") {
    setActiveTab(tab);
    if (tab === "home") router.replace("/(app)/home");
    if (tab === "settings") router.replace("/(app)/settings");
  }

  return (
    <View style={styles.root}>
      {pageReady && (
        <SafeAreaView style={styles.safeArea}>
          {/* Cabeçalho */}
          <FadeSlideIn delay={0} style={styles.screenHeader}>
            <TouchableOpacity
              onPress={() => router.replace("/(app)/home")}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Progresso</Text>
            <View style={{ width: 24 }} />
          </FadeSlideIn>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#093AFF"
              />
            }
          >
            {/* ── Resumo de XP e Nível ── */}
            <FadeSlideIn delay={80}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Seu Progresso</Text>

                {/* Barra de XP */}
                <View style={styles.xpBarWrapper}>
                  <XPBar xp={xp} level={level} />
                </View>

                {/* Estatísticas rápidas */}
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>🔥</Text>
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>⚡</Text>
                    <Text style={styles.statValue}>{xp}</Text>
                    <Text style={styles.statLabel}>XP Total</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statEmoji}>🏅</Text>
                    <Text style={styles.statValue}>
                      {unlockedCount}/{totalCount}
                    </Text>
                    <Text style={styles.statLabel}>Conquistas</Text>
                  </View>
                </View>
              </View>
            </FadeSlideIn>

            {/* ── Conquistas Desbloqueadas ── */}
            <FadeSlideIn delay={160}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Conquistas Desbloqueadas ({unlockedCount})
                </Text>

                {unlockedCount === 0 ? (
                  <Text style={styles.emptyText}>
                    Nenhuma conquista desbloqueada ainda. Continue estudando!
                  </Text>
                ) : (
                  <View style={styles.achievementsList}>
                    {achievements
                      .filter((a) => a.unlocked)
                      .map((achievement) => (
                        <View key={achievement.achievementId}>
                          <AchievementBadge
                            achievement={{
                              id: achievement.achievementId,
                              name: achievement.name,
                              description: achievement.description,
                              icon: achievement.icon,
                              unlocked: achievement.unlocked,
                              rewardClaimed: achievement.rewardClaimed,
                              unlockedAt: achievement.unlockedAt,
                              reward: achievement.reward,
                            }}
                            onClaimReward={handleClaimReward}
                          />
                          {/* Mostra quantas vezes foi obtida se for repetível */}
                          {achievement.repeatable && achievement.timesEarned > 1 && (
                            <Text style={styles.timesEarnedText}>
                              Obtida {achievement.timesEarned}x
                            </Text>
                          )}
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </FadeSlideIn>

            {/* ── Conquistas Bloqueadas ── */}
            <FadeSlideIn delay={240}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Próximas Conquistas ({totalCount - unlockedCount})
                </Text>

                {totalCount - unlockedCount === 0 ? (
                  <Text style={styles.emptyText}>
                    Parabéns! Você desbloqueou todas as conquistas! 🎉
                  </Text>
                ) : (
                  <View style={styles.achievementsList}>
                    {achievements
                      .filter((a) => !a.unlocked)
                      .map((achievement) => (
                        <AchievementBadge
                          key={achievement.achievementId}
                          achievement={{
                            id: achievement.achievementId,
                            name: achievement.name,
                            description: achievement.description,
                            icon: achievement.icon,
                            unlocked: false,
                            rewardClaimed: false,
                            reward: achievement.reward,
                          }}
                        />
                      ))}
                  </View>
                )}
              </View>
            </FadeSlideIn>
          </ScrollView>

          {/* Navbar */}
          <FadeSlideIn delay={320}>
            <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
          </FadeSlideIn>
        </SafeAreaView>
      )}

      <ScreenLoader visible={!pageReady} onHidden={() => setPageReady(true)} />

      {/* Modal de conquista desbloqueada — aparece com animação */}
      <AchievementUnlockedModal
        visible={showUnlockModal}
        achievement={newlyUnlocked}
        onClose={handleCloseUnlockModal}
      />
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
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#32374A",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 32,
  },
  // Seção genérica com card escuro
  section: {
    backgroundColor: "#0D1B3E",
    borderRadius: 15,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Barra de XP centralizada
  xpBarWrapper: {
    alignSelf: "center",
    width: "80%",
  },
  // Linha de estatísticas rápidas
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statCard: {
    alignItems: "center",
    gap: 4,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "500",
  },
  // Lista de conquistas
  achievementsList: {
    gap: 10,
  },
  // Texto para quando não há conquistas
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  // Texto de "obtida Nx" para conquistas repetíveis
  timesEarnedText: {
    color: "#093AFF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
    marginRight: 8,
  },
});
