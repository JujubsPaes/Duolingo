import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import * as progressService from "../../services/progressService";
import { useUserStore } from "../../store/userStore";
import { useAchievementStore } from "../../store/achievementStore";

// Usuários mock para testes — remover quando o backend estiver integrado
const MOCK_USER = {
  email: "teste@dualingo.com",
  password: "123456",
};

// Usuário admin para testar o painel administrativo
const MOCK_ADMIN = {
  email: "admin@dualingo.com",
  password: "admin123",
};

const BASE_WIDTH = 393;

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const scale = width / BASE_WIDTH;
  const rs = (size: number) => Math.round(size * scale);
  const isSmall = height < 700;

  const [pageReady, setPageReady] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setLoginError("");

    if (!email.trim()) {
      setEmailError("Informe seu email.");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Email inválido.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Informe sua senha.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter ao menos 6 caracteres.");
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Chama o backend real para autenticar o usuário
      const user = await authService.login({ email: trimmedEmail, password });

      // Hidrata o store global com os dados do usuário retornados pelo backend
      useUserStore.getState().hydrateFromUser(user);

      // Busca dados de gamificação (conquistas, XP atualizado) do backend
      try {
        const gamification = await progressService.getGamification();
        useUserStore.getState().hydrateFromGamification(gamification);
        useAchievementStore.getState().hydrateFromApi(gamification.achievements);
      } catch {
        // Se falhar, usa os dados do login (já hidratados acima)
      }

      // Navega para a tela principal
      router.replace("/(app)/home");
    } catch (err: any) {
      // Exibe a mensagem de erro retornada pelo backend
      setLoginError(err?.message ?? "Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setForgotEmailError("");
    if (!forgotEmail.trim()) {
      setForgotEmailError("Informe seu email.");
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setForgotEmailError("Email inválido.");
      return;
    }
    setForgotLoading(true);
    try {
      // Chama o backend para enviar email de recuperação
      await authService.forgotPassword(forgotEmail.trim().toLowerCase());
      setForgotSuccess(true);
    } catch {
      setForgotEmailError("Erro ao enviar. Tente novamente.");
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgotModal() {
    setForgotModalVisible(false);
    setForgotEmail("");
    setForgotEmailError("");
    setForgotSuccess(false);
  }

  return (
    <View style={styles.flex}>
      {/* Page content — shown after loader fades out */}
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
                paddingTop: isSmall ? rs(100) : rs(160),
                paddingBottom: rs(40),
              },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <FadeSlideIn delay={0} style={[styles.header, { marginBottom: isSmall ? rs(48) : rs(96) }]}>
              <Text style={styles.welcomeText}>Bem vindo de volta ao</Text>
              <Text style={[styles.brandText, { fontSize: rs(64) }]}>Dualingo</Text>
            </FadeSlideIn>

            {/* Form */}
            <View style={[styles.form, { gap: rs(16) }]}>
              <FadeSlideIn delay={80}>
                <Input
                  mode="text"
                  placeholder="Insira seu email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  error={emailError}
                />
              </FadeSlideIn>

              <FadeSlideIn delay={160}>
                <Input
                  mode="password"
                  placeholder="Insira sua senha"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                />
              </FadeSlideIn>

              <FadeSlideIn delay={220}>
                <TouchableOpacity
                  onPress={() => setForgotModalVisible(true)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.forgotText, { fontSize: rs(14) }]}>
                    Esqueci a senha
                  </Text>
                </TouchableOpacity>
              </FadeSlideIn>

              {loginError ? (
                <Text style={[styles.loginError, { fontSize: rs(14) }]}>{loginError}</Text>
              ) : null}
            </View>

            {/* Actions */}
            <View style={[styles.actions, { gap: rs(20), marginTop: rs(40) }]}>
              <FadeSlideIn delay={300} style={{ width: "100%" }}>
                <Button
                  label="Login"
                  onPress={handleLogin}
                  loading={loading}
                  variant={loading ? "disabled" : "primary"}
                />
              </FadeSlideIn>

              <FadeSlideIn delay={380}>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/register")}
                  accessibilityRole="link"
                >
                  <Text style={[styles.registerText, { fontSize: rs(14) }]}>
                    Não possui conta? Cadastre-se aqui agora!
                  </Text>
                </TouchableOpacity>
              </FadeSlideIn>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Screen loader — fades out and reveals content */}
      <ScreenLoader visible={!pageReady} onHidden={() => setPageReady(true)} />

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForgotModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeForgotModal}>
          <Pressable
            style={[styles.modalBox, { padding: rs(28), gap: rs(16) }]}
            onPress={() => {}}
          >
            {forgotSuccess ? (
              <>
                <Text style={[styles.modalTitle, { fontSize: rs(20) }]}>Email enviado!</Text>
                <Text style={[styles.modalSubtitle, { fontSize: rs(14) }]}>
                  Verifique sua caixa de entrada para redefinir sua senha.
                </Text>
                <View style={styles.modalButton}>
                  <Button label="Fechar" onPress={closeForgotModal} />
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.modalTitle, { fontSize: rs(20) }]}>Esqueci a senha</Text>
                <Text style={[styles.modalSubtitle, { fontSize: rs(14) }]}>
                  Informe seu email para receber as instruções de recuperação.
                </Text>
                <Input
                  mode="text"
                  placeholder="Insira seu email"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  error={forgotEmailError}
                />
                <View style={styles.modalButton}>
                  <Button
                    label="Enviar"
                    onPress={handleForgotPassword}
                    loading={forgotLoading}
                    variant={forgotLoading ? "disabled" : "primary"}
                  />
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Theme.screenBackground },
  container: { flexGrow: 1, justifyContent: "space-between" },
  header: { alignItems: "center" },
  welcomeText: { color: Theme.text, fontSize: 30, fontWeight: "700", textAlign: "center" },
  brandText: { color: Theme.brand, fontWeight: "700", textAlign: "center" },
  form: { flex: 1 },
  forgotText: { color: Theme.text, fontWeight: "600", textDecorationLine: "underline", marginTop: 4 },
  loginError: { color: Theme.inputError, textAlign: "center", marginTop: 4 },
  actions: { alignItems: "center" },
  registerText: { color: Theme.text, fontWeight: "600", textDecorationLine: "underline", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: Theme.overlay, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modalBox: { backgroundColor: Theme.modalBackground, borderRadius: 20, width: "100%" },
  modalTitle: { color: Theme.text, fontWeight: "700" },
  modalSubtitle: { color: Theme.textMuted, lineHeight: 20 },
  modalButton: { marginTop: 8 },
});
