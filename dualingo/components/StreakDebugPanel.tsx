/**
 * Painel de debug para testar streak — REMOVER antes de entregar.
 * Agora persiste as alterações no backend também.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUserStore } from "../store/userStore";
import { useGamification } from "../store/gamificationStore";
import api from "../services/api";

export default function StreakDebugPanel() {
  const { streak, currentXP } = useUserStore();
  const { advanceStreakDay, setStreak, reset: resetGamification } =
    useGamification();

  // Sincroniza o estado atual com o backend
  function syncToBackend() {
    const { currentXP, level, streak } = useUserStore.getState();
    const today = new Date().toISOString().split("T")[0];

    // Chama uma rota de debug no backend para forçar a atualização
    api.post("/dev/sync-user", { xp: currentXP, level, streak, lastStudyDate: today })
      .catch((err) => console.warn("[Debug] Erro ao sincronizar:", err?.message));
  }

  function simulateNextDay() {
    advanceStreakDay(1);
    // Aguarda o state atualizar e sincroniza
    setTimeout(syncToBackend, 100);
  }

  function simulateSkippedDay() {
    setStreak(0);
    setTimeout(syncToBackend, 100);
  }

  function addStreakFive() {
    advanceStreakDay(5);
    setTimeout(syncToBackend, 100);
  }

  function resetStreak() {
    resetGamification();
    setTimeout(syncToBackend, 100);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Debug Streak</Text>
      <Text style={styles.info}>
        Streak atual: {streak} | XP: {currentXP}
      </Text>
      <Text style={styles.hint}>
        Dia seguinte: +10 XP (e +500 a cada 7 dias de streak)
      </Text>

      <View style={styles.buttonsRow}>
        <DebugButton label="Dia seguinte" color="#10B981" onPress={simulateNextDay} />
        <DebugButton label="Pulou dia" color="#EF4444" onPress={simulateSkippedDay} />
      </View>

      <View style={styles.buttonsRow}>
        <DebugButton label="+5 dias" color="#F97316" onPress={addStreakFive} />
        <DebugButton label="Reset" color="#64748B" onPress={resetStreak} />
      </View>
    </View>
  );
}

function DebugButton({
  label,
  color,
  onPress,
}: {
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: color }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F97316",
    marginHorizontal: 16,
    marginTop: 12,
  },
  title: {
    color: "#F97316",
    fontSize: 14,
    fontWeight: "700",
  },
  info: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  hint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
