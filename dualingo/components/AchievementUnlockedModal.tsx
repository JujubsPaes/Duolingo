/**
 * AchievementUnlockedModal — Modal exibido quando uma conquista é desbloqueada.
 *
 * Design limpo e consistente com o LevelUpModal:
 * - Fundo escuro com fade
 * - Card central com spring bounce
 * - Ícone grande da conquista
 * - Nome, descrição e recompensa
 * - Botão verde para fechar
 *
 * Fecha automaticamente após 5 segundos ou ao tocar no botão.
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Achievement } from "../types";

interface AchievementUnlockedModalProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementUnlockedModal({
  visible,
  achievement,
  onClose,
}: AchievementUnlockedModalProps) {
  // Animação de entrada — spring + fade (mesmo padrão do LevelUpModal)
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && achievement) {
      // Reset e anima ao abrir
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-fecha após 5 segundos
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, achievement, scaleAnim, opacityAnim, onClose]);

  if (!achievement) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Emoji de celebração */}
          <Text style={styles.emoji}>🏅</Text>

          {/* Título */}
          <Text style={styles.title}>Conquista Desbloqueada!</Text>

          {/* Ícone da conquista */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{achievement.icon}</Text>
          </View>

          {/* Nome da conquista */}
          <Text style={styles.achievementName}>{achievement.name}</Text>

          {/* Descrição */}
          <Text style={styles.description}>{achievement.description}</Text>

          {/* Recompensa */}
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>{achievement.reward}</Text>
          </View>

          {/* Botão de fechar */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Fechar"
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    borderColor: "#093AFF",
    width: "100%",
    maxWidth: 320,
    // Sombra azul sutil
    shadowColor: "#093AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    color: "#093AFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "#093AFF",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(9, 58, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#093AFF",
    marginVertical: 4,
  },
  icon: {
    fontSize: 36,
  },
  achievementName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  rewardBadge: {
    backgroundColor: "rgba(0, 223, 33, 0.12)",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#00DF21",
  },
  rewardText: {
    color: "#00DF21",
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: "#00DF21",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: "#00DF21",
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: "#000721",
    fontSize: 16,
    fontWeight: "800",
  },
});
