import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Theme } from "../../constants/colors";

const BASE_WIDTH = 393;

interface InputProps extends Omit<TextInputProps, "secureTextEntry"> {
  mode?: "text" | "password";
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export default function Input({
  mode = "text",
  placeholder,
  value,
  onChangeText,
  error,
  ...rest
}: InputProps) {
  const { width } = useWindowDimensions();
  const scale = width / BASE_WIDTH;
  const rs = (size: number) => Math.round(size * scale);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = mode === "password";

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            height: rs(56),
            borderRadius: 15,
            paddingHorizontal: rs(20),
          },
          error ? styles.containerError : null,
        ]}
      >
        <TextInput
          style={[styles.input, { fontSize: rs(16) }]}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.5)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          {...(Platform.OS === "web"
            ? { outlineStyle: "none" as const }
            : {})}
          autoComplete="off"
          textContentType="none"
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            style={styles.eyeButton}
            accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={rs(22)}
              color="rgba(0,0,0,0.5)"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={[styles.errorText, { fontSize: rs(12) }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    gap: 4,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.inputBackground,
    borderWidth: 1,
    borderColor: Theme.inputBorder,
  },
  containerError: {
    borderColor: Theme.inputError,
  },
  input: {
    flex: 1,
    color: Theme.inputText,
    height: "100%",
    outlineWidth: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: Theme.inputError,
    marginLeft: 12,
  },
});
