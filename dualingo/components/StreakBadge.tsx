import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StreakBadgeProps {
  streak: number;
}

// Exibe o contador de streak com ícone de chama
export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.count}>x{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  icon: {
    fontSize: 20,
  },
  count: {
    color: "#F97316",
    fontSize: 20,
    fontWeight: "700",
    // Glow laranja no texto do streak
    textShadowColor: "#F97316",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
