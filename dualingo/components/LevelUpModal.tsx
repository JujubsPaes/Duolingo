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
