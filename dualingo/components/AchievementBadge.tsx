import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface Achievement {
  id: string;
  name: string;           // Nome da conquista
  description: string;    // Descrição do que é necessário para desbloquear
  icon: string;           // Emoji ou símbolo representando a conquista
  unlocked: boolean;      // Se o usuário já desbloqueou
  rewardClaimed: boolean; // Se o usuário já resgatou a recompensa
  unlockedAt?: string;    // Data de desbloqueio (ISO string, opcional)
  reward: string;         // Descrição da recompensa (ex: "+50 XP")
}

interface AchievementBadgeProps {
  achievement: Achievement;
  onClaimReward?: (id: string) => void;
}

export default function AchievementBadge({
  achievement,
  onClaimReward,
}: AchievementBadgeProps) {
  const { unlocked, rewardClaimed } = achievement;

  // Formata a data de desbloqueio para exibição
  function formatDate(iso?: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      {/* Ícone da conquista — escurecido quando bloqueado */}
      <View style={[styles.iconWrapper, !unlocked && styles.iconLocked]}>
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>

      {/* Informações da conquista */}
      <View style={styles.info}>
        <Text style={[styles.name, !unlocked && styles.textLocked]}>
          {achievement.name}
        </Text>
        <Text style={[styles.description, !unlocked && styles.textLocked]}>
          {achievement.description}
        </Text>

        {/* Data de desbloqueio — só aparece se desbloqueado */}
        {unlocked && achievement.unlockedAt ? (
          <Text style={styles.date}>
            Desbloqueado em {formatDate(achievement.unlockedAt)}
          </Text>
        ) : null}
      </View>

      {/* Botão de recompensa — só aparece se desbloqueado e não resgatado */}
      {unlocked && !rewardClaimed && (
        <TouchableOpacity
          style={styles.rewardBtn}
          onPress={() => onClaimReward?.(achievement.id)}
          accessibilityRole="button"
          accessibilityLabel={`Resgatar recompensa: ${achievement.reward}`}
        >
          <Text style={styles.rewardBtnText}>{achievement.reward}</Text>
        </TouchableOpacity>
      )}

      {/* Badge de resgatado */}
      {unlocked && rewardClaimed && (
        <View style={styles.claimedBadge}>
          <Text style={styles.claimedText}>✓ Resgatado</Text>
        </View>
      )}

      {/* Cadeado para conquistas bloqueadas */}
      {!unlocked && (
        <Text style={styles.lockIcon}>🔒</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1B3E",
    borderRadius: 15,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  // Card bloqueado fica mais escuro e com opacidade reduzida
  cardLocked: {
    backgroundColor: "#0A0F1E",
    opacity: 0.55,
    borderColor: "#1a1a2e",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E3A5F",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLocked: {
    backgroundColor: "#1a1a2e",
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 16,
  },
  textLocked: {
    color: "rgba(255,255,255,0.3)",
  },
  date: {
    color: "#00DF21",
    fontSize: 11,
    marginTop: 2,
  },
  // Botão de resgatar recompensa
  rewardBtn: {
    backgroundColor: "#093AFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#0026BD",
  },
  rewardBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  // Badge de recompensa já resgatada
  claimedBadge: {
    backgroundColor: "#0D2E1A",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#00DF21",
  },
  claimedText: {
    color: "#00DF21",
    fontSize: 11,
    fontWeight: "700",
  },
  lockIcon: {
    fontSize: 18,
  },
});
