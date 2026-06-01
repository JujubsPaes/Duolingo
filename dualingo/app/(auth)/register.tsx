import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import Button from "../../components/ui/Button";
import FadeSlideIn from "../../components/ui/FadeSlideIn";
import Input from "../../components/ui/Input";
import ScreenLoader from "../../components/ui/ScreenLoader";
import { Theme } from "../../constants/colors";
import * as authService from "../../services/authService";

const BASE_WIDTH = 393;

export default function RegisterScreen() {
  const { width, height } = useWindowDimensions();
  const scale = width / BASE_WIDTH;
  const rs = (size: number) => Math.round(size * scale);
  const isSmall = height < 700;

  const [pageReady, setPageReady] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    let valid = true;
    setNameError(""); setEmailError(""); setPasswordError(""); setConfirmPasswordError(""); setRegisterError("");

    if (!name.trim()) { setNameError("Informe seu nome."); valid = false; }
    if (!email.trim()) { setEmailError("Informe seu email."); valid = false; }
    else if (!validateEmail(email)) { setEmailError("Email inválido."); valid = false; }
    if (!password) { setPasswordError("Informe uma senha."); valid = false; }
    else if (password.length < 6) { setPasswordError("A senha deve ter ao menos 6 caracteres."); valid = false; }
    if (!confirmPassword) { setConfirmPasswordError("Confirme sua senha."); valid = false; }
    else if (password !== confirmPassword) { setConfirmPasswordError("As senhas não coincidem."); valid = false; }

    return valid;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Chama o backend para criar a conta do usuário
      await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Redireciona para o login após cadastro bem-sucedido
      router.replace("/(auth)/login");
    } catch (err: any) {
      setRegisterError(err?.message ?? "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.flex}>
      {pageReady && (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={[
              styles.container,
              {
                paddingHorizontal: rs(28),
                paddingTop: isSmall ? rs(40) : rs(80),
                paddingBottom: rs(40),
              },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <FadeSlideIn delay={0} style={[styles.header, { marginBottom: isSmall ? rs(24) : rs(48) }]}>
              <Text style={styles.titleText}>Crie sua conta no</Text>
              <Text style={[styles.brandText, { fontSize: rs(64) }]}>Dualingo</Text>
            </FadeSlideIn>

            {/* Form */}
            <View style={[styles.form, { gap: rs(16) }]}>
              <FadeSlideIn delay={80}>
                <Input mode="text" placeholder="Insira seu nome" value={name} onChangeText={setName} autoCapitalize="words" error={nameError} />
              </FadeSlideIn>
              <FadeSlideIn delay={140}>
                <Input mode="text" placeholder="Insira seu email" value={email} onChangeText={setEmail} keyboardType="email-address" error={emailError} />
              </FadeSlideIn>
              <FadeSlideIn delay={200}>
                <Input mode="password" placeholder="Insira sua senha" value={password} onChangeText={setPassword} error={passwordError} />
              </FadeSlideIn>
              <FadeSlideIn delay={260}>
                <Input mode="password" placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} error={confirmPasswordError} />
              </FadeSlideIn>
              {registerError ? (
                <Text style={[styles.registerError, { fontSize: rs(14) }]}>{registerError}</Text>
              ) : null}
            </View>

            {/* Actions */}
            <View style={[styles.actions, { gap: rs(20), marginTop: rs(40) }]}>
              <FadeSlideIn delay={320} style={{ width: "100%" }}>
                <Button label="Cadastrar" onPress={handleRegister} loading={loading} variant={loading ? "disabled" : "primary"} />
              </FadeSlideIn>
              <FadeSlideIn delay={400}>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} accessibilityRole="link">
                  <Text style={[styles.loginText, { fontSize: rs(14) }]}>
                    Já possui conta? Faça login aqui!
                  </Text>
                </TouchableOpacity>
              </FadeSlideIn>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <ScreenLoader visible={!pageReady} onHidden={() => setPageReady(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.screenBackground },
  container: { flexGrow: 1, justifyContent: "space-between" },
  header: { alignItems: "center" },
  titleText: { color: Theme.text, fontSize: 30, fontWeight: "700", textAlign: "center" },
  brandText: { color: Theme.brand, fontWeight: "700", textAlign: "center" },
  form: { flex: 1 },
  registerError: { color: Theme.inputError, textAlign: "center", marginTop: 4 },
  actions: { alignItems: "center" },
  loginText: { color: Theme.text, fontWeight: "600", textDecorationLine: "underline", textAlign: "center" },
});
