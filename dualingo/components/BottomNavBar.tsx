import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Abas disponíveis na navbar
type Tab = "home" | "progress" | "settings";

interface BottomNavBarProps {
  activeTab: Tab;
  onTabPress: (tab: Tab) => void;
}

// Navbar inferior com três botões: Home, Progresso e Configurações
export default function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {/* Botão Home */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("home")}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={26}
          color={activeTab === "home" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>

      {/* Divisor vertical */}
      <View style={styles.divider} />

      {/* Botão Progresso / Conquistas */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("progress")}
        accessibilityRole="button"
        accessibilityLabel="Progresso"
      >
        <Ionicons
          name={activeTab === "progress" ? "trophy" : "trophy-outline"}
          size={26}
          color={activeTab === "progress" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>

      {/* Divisor vertical */}
      <View style={styles.divider} />

      {/* Botão Configurações */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("settings")}
        accessibilityRole="button"
        accessibilityLabel="Configurações"
      >
        <Ionicons
          name={activeTab === "settings" ? "settings" : "settings-outline"}
          size={26}
          color={activeTab === "settings" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
});
