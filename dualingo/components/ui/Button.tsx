import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const BASE_WIDTH = 393;

type ButtonVariant = "primary" | "secondary" | "disabled";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const { width } = useWindowDimensions();
  const [isPressed, setIsPressed] = useState(false);

  const scale = width / BASE_WIDTH;
  const rs = (size: number) => Math.round(size * scale);

  const isDisabled = variant === "disabled" || loading;

  const getButtonStyles = () => {
    const base = {
      height: rs(56),
      borderRadius: 15,
      paddingHorizontal: rs(24),
      borderWidth: 2,
    };

    if (isDisabled) {
      return { ...base, backgroundColor: "#32374A", borderColor: "#1B1B1B", opacity: 0.6 };
    }

    if (variant === "secondary") {
      return { ...base, backgroundColor: "#32374A", borderColor: "#1B1B1B" };
    }

    // primary — muda cor ao pressionar
    if (isPressed) {
      return { ...base, backgroundColor: "#32374A", borderColor: "#1B1B1B" };
    }

    return { ...base, backgroundColor: "#093AFF", borderColor: "#0026BD" };
  };

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => !isDisabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.base, getButtonStyles(), fullWidth && styles.fullWidth]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.label, { fontSize: rs(18) }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
