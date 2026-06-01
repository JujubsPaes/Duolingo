import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface FadeSlideInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wraps children in a fade + slide-up entrance animation.
 * Use `delay` to stagger multiple elements.
 *
 * @example
 * <FadeSlideIn delay={0}>   <Title /> </FadeSlideIn>
 * <FadeSlideIn delay={100}> <Input /> </FadeSlideIn>
 * <FadeSlideIn delay={200}> <Button /> </FadeSlideIn>
 */
export default function FadeSlideIn({
  children,
  delay = 0,
  duration = 500,
  offsetY = 24,
  style,
}: FadeSlideInProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(offsetY);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    opacity.value = withDelay(delay, withTiming(1, { duration, easing }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      {children}
    </Animated.View>
  );
}
