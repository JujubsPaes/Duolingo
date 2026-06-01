import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getCurrentWeekDaysLocal, toLocalDateString } from "../utils/date";

interface StreakCalendarProps {
  studiedDays: string[];
  streak: number;
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function StreakCalendar({ studiedDays, streak }: StreakCalendarProps) {
  const weekDays = getCurrentWeekDaysLocal();
  const today = toLocalDateString();
  const studiedSet = new Set(studiedDays);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Sequência semanal</Text>
        <View style={styles.streakCount}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.streakNumber}>{streak} dias</Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((date, index) => {
          const studied = studiedSet.has(date);
          const isToday = date === today;
          const isFuture = date > today;

          return (
            <View key={date} style={styles.dayColumn}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {WEEK_DAYS[index]}
              </Text>

              <View
                style={[
                  styles.fireWrapper,
                  isToday && styles.fireWrapperToday,
                  studied && !isFuture && styles.fireWrapperStudied,
                ]}
              >
                <Text
                  style={[
                    styles.fire,
                    (!studied || isFuture) && styles.fireOff,
                  ]}
                >
                  🔥
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  streakCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fireIcon: {
    fontSize: 14,
  },
  streakNumber: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "700",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayColumn: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dayLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "600",
  },
  dayLabelToday: {
    color: "#FFFFFF",
  },
  fireWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  fireWrapperToday: {
    borderWidth: 1,
    borderColor: "#F97316",
  },
  fireWrapperStudied: {
    backgroundColor: "#2D1A00",
  },
  fire: {
    fontSize: 20,
  },
  fireOff: {
    opacity: 0.2,
  },
});
