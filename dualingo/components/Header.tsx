import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Avatar from "./Avatar";
import StreakBadge from "./StreakBadge";

const GREEN = "#00DF21";

interface HeaderProps {
  username: string;
  level: number;
  streak: number;
  avatarUri?: string; // URL da foto de perfil (opcional — usa iniciais como fallback)
}

// Header principal do app: avatar + nome/nível à esquerda, streak à direita
export default function Header({ username, level, streak, avatarUri }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Lado esquerdo: avatar + info do usuário */}
      <View style={styles.userInfo}>
        {/* Avatar com suporte a foto real e fallback de iniciais */}
        <Avatar
          uri={avatarUri}
          name={username}
          size="md"
        />

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
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#32374A",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textBlock: {
    justifyContent: "center",
    gap: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  level: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: GREEN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
