import { ImageSourcePropType } from "react-native";

// Imagens por curso — usadas como fallback quando o exercício não define imagem própria
const COURSE_IMAGES: Record<string, ImageSourcePropType> = {
  expo: require("../assets/images/expo-logo.png"),
  aws: require("../assets/images/aws-logo.png"),
};

/** Imagem padrão (fallback geral caso não tenha courseId) */
export const DEFAULT_EXERCISE_IMAGE: ImageSourcePropType = require("../assets/images/expo-logo.png");

/** Retorna a imagem correta baseada no curso */
export function getExerciseImage(courseId?: string): ImageSourcePropType {
  if (courseId && COURSE_IMAGES[courseId]) {
    return COURSE_IMAGES[courseId];
  }
  return DEFAULT_EXERCISE_IMAGE;
}
