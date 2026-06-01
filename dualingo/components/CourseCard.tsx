import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CourseCardProps {
  title: string;
  image: ImageSourcePropType;
  onPress?: () => void;
}

export default function CourseCard({ title, image, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
    >
      {/* Área da imagem com fundo próprio para preencher corretamente */}
      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Nome do curso */}
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#E6E6E6",
    width: "46%",
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  // Container da imagem com altura fixa e borderRadius
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    borderRadius: 15,
    overflow: "hidden",
  },
  // Imagem preenche o container com borderRadius
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 8,

  },
});
