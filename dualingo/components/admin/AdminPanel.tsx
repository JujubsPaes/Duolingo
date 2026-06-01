/**
 * AdminPanel — Painel administrativo com CRUD de conteúdo.
 *
 * Exibido no lugar da trilha de cursos quando o usuário logado
 * possui role "admin". Permite gerenciar cursos, módulos, lições
 * e exercícios, além de visualizar relatórios de uso.
 */

import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors, Theme } from "../../constants/colors";
import * as authService from "../../services/authService";
import { useUserStore } from "../../store/userStore";
import AdminCourses from "./AdminCourses";
import AdminModules from "./AdminModules";
import AdminLessons from "./AdminLessons";
import AdminExercises from "./AdminExercises";
import AdminReports from "./AdminReports";

// Abas disponíveis no painel
type AdminTab = "courses" | "modules" | "lessons" | "exercises" | "reports";

interface TabConfig {
  key: AdminTab;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "courses", label: "Cursos" },
  { key: "modules", label: "Módulos" },
  { key: "lessons", label: "Lições" },
  { key: "exercises", label: "Exercícios" },
  { key: "reports", label: "Relatórios" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("courses");

  // Desloga e volta pro login
  async function handleLogout() {
    await authService.logout();
    useUserStore.getState().reset();
    router.replace("/(auth)/login");
  }

  // Renderiza o conteúdo da aba ativa
  function renderContent() {
    switch (activeTab) {
      case "courses":
        return <AdminCourses />;
      case "modules":
        return <AdminModules />;
      case "lessons":
        return <AdminLessons />;
      case "exercises":
        return <AdminExercises />;
      case "reports":
        return <AdminReports />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Título do painel */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel Administrativo</Text>
          <Text style={styles.subtitle}>Gerencie o conteúdo da plataforma</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Abas de navegação */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conteúdo da aba selecionada */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBackground,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  tabBar: {
    maxHeight: 48,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  logoutBtn: {
    backgroundColor: Colors.error,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
