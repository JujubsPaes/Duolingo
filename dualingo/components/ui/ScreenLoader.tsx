import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Theme } from "../../constants/colors";
import Spinner from "./Spinner";

interface ScreenLoaderProps {
  /** When false, hides the loader and reveals content */
  visible: boolean;
  onHidden?: () => void;
  /** How long to show the loader before auto-hiding (ms). Default: 600 */
  duration?: number;
}

/**
 * Full-screen loading overlay.
 * Shows a spinning arc on the project background color.
 * Auto-hides after `duration` ms, then fades out and calls `onHidden`.
 */
export default function ScreenLoader({ visible, onHidden, duration = 600 }: ScreenLoaderProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Auto-hide after duration when first mounted
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished && onHidden) runOnJS(onHidden)();
      });
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished && onHidden) runOnJS(onHidden)();
      });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, animStyle]} pointerEvents="none">
      <Spinner size={52} color={Theme.brand} strokeWidth={5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.screenBackground,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
