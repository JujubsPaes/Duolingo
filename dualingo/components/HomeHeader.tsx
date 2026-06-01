import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StreakBadge from "./StreakBadge";

// Cor verde principal do projeto
const GREEN = "#00DF21";

interface HomeHeaderProps {
  username: string;
  level: number;
  streak: number;
}

// Header da home: avatar + nome/nível à esquerda, streak à direita
export default function HomeHeader({ username, level, streak }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Lado esquerdo: avatar + info do usuário */}
      <View style={styles.userInfo}>
        {/* Avatar placeholder com ícone de pessoa */}
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={26} color="#FFFFFF" />
        </View>

        {/* Nome e nível centralizados verticalmente */}
        <View style={styles.textBlock}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.level}>Lvl {level}</Text>
        </View>
      </View>

      {/* Lado direito: streak */}
      <StreakBadge streak={streak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",       // centraliza verticalmente todos os filhos
    justifyContent: "space-between",
    backgroundColor: "#32374A", // cor de fundo conforme solicitado
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",       // avatar e texto alinhados verticalmente
    gap: 10,
  },
  // Avatar com border radius 15
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  // Bloco de texto centralizado verticalmente pelo alignItems do pai
  textBlock: {
    justifyContent: "center",
    gap: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Nível em verde com glow
  level: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: GREEN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
