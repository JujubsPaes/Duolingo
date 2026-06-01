import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

// Tamanhos disponíveis para o avatar
type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  uri?: string;           // URL da foto de perfil (opcional)
  name: string;           // Nome do usuário — usado para gerar as iniciais no fallback
  size?: AvatarSize;
  showBorder?: boolean;   // Exibe borda colorida ao redor do avatar
  style?: ViewStyle;
}

// Dimensões por tamanho
const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 80,
};

// Extrai as iniciais do nome (ex: "João Silva" → "JS")
function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  uri,
  name,
  size = "md",
  showBorder = false,
  style,
}: AvatarProps) {
  // Controla se a imagem falhou ao carregar
  const [imageError, setImageError] = useState(false);

  const dimension = SIZE_MAP[size];
  const fontSize = dimension * 0.35;
  const showFallback = !uri || imageError;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: dimension,
          height: dimension,
          borderRadius: 15,
          // Borda opcional em azul primário
          borderWidth: showBorder ? 2 : 0,
          borderColor: showBorder ? "#093AFF" : "transparent",
        },
        style,
      ]}
    >
      {showFallback ? (
        // Fallback: círculo com as iniciais do nome
        <View style={[styles.fallback, { borderRadius: 15 }]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      ) : (
        // Imagem real do usuário
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: 13 }]}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  fallback: {
    flex: 1,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
