import { useWindowDimensions } from "react-native";

const BASE_WIDTH = 393;

export function useResponsiveScale(baseWidth = BASE_WIDTH) {
  const { width } = useWindowDimensions();
  const scale = width / baseWidth;
  const rs = (size: number) => Math.round(size * scale);

  return { width, scale, rs };
}
