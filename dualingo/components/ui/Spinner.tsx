import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Theme } from "../../constants/colors";

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Arc spinner — a partial circle (270°) that rotates continuously.
 * Achieved by drawing a full circle border and hiding one side with
 * a transparent border color, then rotating the whole view.
 */
export default function Spinner({
  size = 48,
  color = Theme.brand,
  strokeWidth = 4,
}: SpinnerProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1, // infinite
      false
    );
    return () => cancelAnimation(rotation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            // Three sides colored, one transparent → creates the arc gap
            borderTopColor: color,
            borderRightColor: color,
            borderBottomColor: color,
            borderLeftColor: "transparent",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
