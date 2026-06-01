import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/colors";
import { useResponsiveScale } from "../../hooks/useResponsiveScale";

export type OptionVisualState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect";

interface OptionRowProps {
  letter: string;
  label: string;
  visualState: OptionVisualState;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const CIRCLE_COLORS: Record<OptionVisualState, string> = {
  default: Theme.optionDefault,
  selected: Theme.optionSelected,
  correct: Theme.optionCorrect,
  incorrect: Theme.optionIncorrect,
};

export default function OptionRow({
  letter,
  label,
  visualState,
  onPress,
  disabled = false,
  accessibilityLabel,
}: OptionRowProps) {
  const { rs } = useResponsiveScale();
  const circleColor = CIRCLE_COLORS[visualState];
  const circleSize = rs(16);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: rs(8), gap: rs(12) },
        pressed && !disabled && styles.rowPressed,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected: visualState === "selected", disabled }}
      accessibilityLabel={accessibilityLabel ?? `${letter}: ${label}`}
    >
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: circleColor,
          },
        ]}
        importantForAccessibility="no-hide-descendants"
      />
      <Text style={[styles.label, { fontSize: rs(18) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowPressed: {
    opacity: 0.85,
  },
  circle: {
    flexShrink: 0,
  },
  label: {
    flex: 1,
    color: Theme.text,
    fontWeight: "700",
  },
});
