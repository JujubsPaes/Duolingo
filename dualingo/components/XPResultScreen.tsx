/**
 * XPResultScreen — Resultado ao finalizar uma lição.
 */

import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import LevelUpModal from "./LevelUpModal";
import XPBar from "./XPBar";
import { useResponsiveScale } from "../hooks/useResponsiveScale";
import type { XPBreakdown } from "../types/gamification";

const RAIO_VERDE = require("../assets/images/raio verde.png");
const RAIO_VERMELHO = require("../assets/images/raio vermelho.png");

interface XPResultScreenProps {
  breakdown: XPBreakdown;
  currentXP: number;
  currentLevel: number;
  previousLevel: number;
  onContinue: () => void;
}

export default function XPResultScreen({
  breakdown,
  currentXP,
  currentLevel,
  previousLevel,
  onContinue,
}: XPResultScreenProps) {
  const { rs } = useResponsiveScale();
  const passed = breakdown.accuracyPercent >= 70;
  const didLevelUp = passed && currentLevel > previousLevel;
  const [levelUpDismissed, setLevelUpDismissed] = useState(!didLevelUp);

  const accentColor = passed ? Colors.success : Colors.error;
  const headline = passed ? "Parabéns!" : "Vamos tentar novamente!";
  const subline = passed
    ? `Você atingiu ${breakdown.accuracyPercent}%`
    : `Acertou ${breakdown.accuracyPercent}%`;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <LevelUpModal
        visible={didLevelUp && !levelUpDismissed}
        newLevel={currentLevel}
        onClose={() => setLevelUpDismissed(true)}
      />

      <View style={styles.xpBarWrapper}>
        <XPBar xp={currentXP} level={currentLevel} />
      </View>

      <View style={styles.center}>
        <Image
          source={passed ? RAIO_VERDE : RAIO_VERMELHO}
          style={{ width: rs(220), height: rs(300) }}
          resizeMode="contain"
          accessibilityLabel={passed ? "Raio verde" : "Raio vermelho"}
        />

        <View style={styles.textBlock}>
          <Text style={[styles.headline, { color: accentColor, fontSize: rs(28) }]}>
            {headline}
          </Text>
          <Text style={[styles.subline, { color: accentColor, fontSize: rs(20) }]}>
            {subline}
          </Text>

          {passed ? (
            <Text style={[styles.xpText, { fontSize: rs(38) }]}>
              +{breakdown.total} XP
            </Text>
          ) : (
            <Text style={[styles.failHint, { fontSize: rs(14) }]}>
              Precisa de pelo menos 70% para avançar
            </Text>
          )}

          {breakdown.streakBonus > 0 && (
            <Text style={[styles.bonusText, { fontSize: rs(13) }]}>
              🔥 Bônus streak: +{breakdown.streakBonus} XP
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { borderRadius: rs(14), paddingVertical: rs(16) }]}
        onPress={onContinue}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Continuar"
      >
        <Text style={[styles.buttonText, { fontSize: rs(17) }]}>Continuar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000721",
    paddingHorizontal: 28,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  xpBarWrapper: {
    alignSelf: "center",
    width: "60%",
    marginTop: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  textBlock: {
    alignItems: "center",
    gap: 6,
  },
  headline: {
    fontWeight: "800",
    textAlign: "center",
  },
  subline: {
    fontWeight: "800",
    textAlign: "center",
  },
  xpText: {
    color: "#00DF21",
    fontWeight: "900",
    marginTop: 8,
  },
  failHint: {
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  bonusText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#00DF21",
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#000721",
    fontWeight: "800",
  },
});
