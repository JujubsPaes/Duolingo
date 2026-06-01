/**
 * AdminReports — Relatórios de uso da plataforma.
 *
 * Exibe métricas gerais como total de usuários, lições mais concluídas,
 * taxa de acerto por exercício e ranking de streak.
 * Dados mockados até integração com GET /admin/reports.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";

// Dados mockados de relatório (simulam a resposta de GET /admin/reports)
const MOCK_REPORTS = {
  totalUsers: 47,
  totalCourses: 2,
  totalLessons: 24,
  totalExercises: 96,
  mostCompletedLessons: [
    { lessonName: "O que é React Native?", completionCount: 38 },
    { lessonName: "Configurando o ambiente", completionCount: 35 },
    { lessonName: "O que é Cloud?", completionCount: 32 },
    { lessonName: "View e Text", completionCount: 28 },
    { lessonName: "Conceitos de IAM", completionCount: 22 },
  ],
  topStreakUsers: [
    { userName: "Maria Silva", streak: 15 },
    { userName: "João Santos", streak: 12 },
    { userName: "Ana Costa", streak: 9 },
    { userName: "Pedro Lima", streak: 7 },
    { userName: "Lucas Oliveira", streak: 5 },
  ],
  averageAccuracyByExercise: [
    { question: "Qual empresa criou o React Native?", averageAccuracy: 92 },
    { question: "O que é IaaS?", averageAccuracy: 78 },
    { question: "React Native compila para código nativo", averageAccuracy: 65 },
    { question: "Qual serviço da AWS armazena objetos?", averageAccuracy: 58 },
  ],
};

export default function AdminReports() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cards de métricas gerais */}
      <View style={styles.metricsRow}>
        <MetricCard label="Usuários" value={MOCK_REPORTS.totalUsers} color={Colors.primary} />
        <MetricCard label="Cursos" value={MOCK_REPORTS.totalCourses} color={Colors.green} />
        <MetricCard label="Lições" value={MOCK_REPORTS.totalLessons} color={Colors.warning} />
        <MetricCard label="Exercícios" value={MOCK_REPORTS.totalExercises} color="#9333EA" />
      </View>

      {/* Lições mais concluídas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lições Mais Concluídas</Text>
        {MOCK_REPORTS.mostCompletedLessons.map((lesson, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listRank}>#{index + 1}</Text>
            <Text style={styles.listText} numberOfLines={1}>
              {lesson.lessonName}
            </Text>
            <Text style={styles.listValue}>{lesson.completionCount}x</Text>
          </View>
        ))}
      </View>

      {/* Ranking de streak */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maior Streak</Text>
        {MOCK_REPORTS.topStreakUsers.map((user, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listRank}>#{index + 1}</Text>
            <Text style={styles.listText}>{user.userName}</Text>
            <Text style={[styles.listValue, { color: Colors.warning }]}>
              🔥 {user.streak} dias
            </Text>
          </View>
        ))}
      </View>

      {/* Taxa de acerto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taxa de Acerto por Exercício</Text>
        {MOCK_REPORTS.averageAccuracyByExercise.map((exercise, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listText} numberOfLines={1}>
              {exercise.question}
            </Text>
            <Text
              style={[
                styles.listValue,
                { color: exercise.averageAccuracy >= 70 ? Colors.green : Colors.error },
              ]}
            >
              {exercise.averageAccuracy}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// Componente auxiliar para os cards de métrica
function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  metricValue: { fontSize: 28, fontWeight: "800" },
  metricLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  listRank: { color: Colors.textMuted, fontSize: 13, fontWeight: "700", width: 28 },
  listText: { color: Colors.white, fontSize: 13, flex: 1 },
  listValue: { color: Colors.green, fontSize: 13, fontWeight: "700", marginLeft: 8 },
});
