import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Avatar from "../../components/Avatar";
import BottomNavBar from "../../components/BottomNavBar";
import FadeSlideIn from "../../components/ui/FadeSlideIn";
import ScreenLoader from "../../components/ui/ScreenLoader";
import StreakCalendar from "../../components/StreakCalendar";
import { useGamification } from "../../store/gamificationStore";
import { useUserStore } from "../../store/userStore";
import * as authService from "../../services/authService";

export default function SettingsScreen() {
  const [pageReady, setPageReady] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "progress" | "settings">("settings");

  // Lê e atualiza o estado global do usuário
  const { username, avatarUri, level, currentXP, nextLevelXP, streak, setUsername, setAvatarUri } = useUserStore();
  const { state: gamificationState } = useGamification();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);

  // Abre o seletor de imagem para trocar a foto de perfil
  async function handlePickImage() {
    // Na web, não precisa pedir permissão de galeria
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à sua galeria para trocar a foto."
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], // recorte quadrado
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri); // atualiza o store local imediatamente

      // Salva a URL da foto no backend (persiste entre sessões)
      authService.updateProfile({ avatarUrl: uri }).catch((err) => {
        console.warn("[Settings] Erro ao salvar avatar no backend:", err?.message);
      });
    }
  }

  // Salva o novo nickname no backend e no store local
  async function handleSaveName() {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert("Nome inválido", "O nome não pode estar vazio.");
      return;
    }
    try {
      // Persiste no backend
      await authService.updateProfile({ name: trimmed });
      // Atualiza o store local
      setUsername(trimmed);
      setEditingName(false);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o nome. Tente novamente.");
    }
  }

  function handleTabPress(tab: "home" | "progress" | "settings") {
    setActiveTab(tab);
    if (tab === "home") router.replace("/(app)/home");
    if (tab === "progress") router.replace("/(app)/progress");
  }

  // Realiza o logout: limpa tokens, reseta o store e redireciona para login
  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // Ignora erro se tokens não existiam
    }
    // Reseta os stores locais
    useUserStore.getState().reset();
    // Redireciona para a tela de login
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.root}>
      {pageReady && (
        <SafeAreaView style={styles.safeArea}>
          {/* Cabeçalho da tela */}
          <FadeSlideIn delay={0} style={styles.screenHeader}>
            <TouchableOpacity
              onPress={() => router.replace("/(app)/home")}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Configurações</Text>
            <View style={{ width: 24 }} />
          </FadeSlideIn>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Seção: Foto de perfil ── */}
            <FadeSlideIn delay={80}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foto de perfil</Text>

                <View style={styles.avatarRow}>
                  {/* Avatar grande com foto atual ou iniciais */}
                  <Avatar
                    uri={avatarUri}
                    name={username}
                    size="lg"
                    showBorder
                  />

                  {/* Botão para trocar a foto */}
                  <TouchableOpacity
                    style={styles.changePhotoBtn}
                    onPress={handlePickImage}
                    accessibilityRole="button"
                  >
                    <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.changePhotoBtnText}>Trocar foto</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeSlideIn>

            {/* ── Seção: Nickname ── */}
            <FadeSlideIn delay={160}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nickname</Text>

                {editingName ? (
                  // Modo edição
                  <View style={styles.nameEditRow}>
                    <TextInput
                      style={styles.nameInput}
                      value={nameInput}
                      onChangeText={setNameInput}
                      autoFocus
                      maxLength={30}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      selectionColor="#093AFF"
                    />
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveName}
                      accessibilityRole="button"
                    >
                      <Text style={styles.saveBtnText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setNameInput(username);
                        setEditingName(false);
                      }}
                      accessibilityRole="button"
                    >
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Modo visualização
                  <View style={styles.nameViewRow}>
                    <Text style={styles.nameText}>{username}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setNameInput(username);
                        setEditingName(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Editar nickname"
                    >
                      <Ionicons name="pencil-outline" size={20} color="#093AFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </FadeSlideIn>

            {/* ── Seção: Nível e XP ── */}
            <FadeSlideIn delay={200}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Nível e Experiência</Text>

                {/* Linha de nível atual */}
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Nível atual</Text>
                    <Text style={styles.statValueGreen}>Lvl {level}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Próximo nível</Text>
                    <Text style={styles.statValue}>
                      {level >= 5 ? "MAX" : `Lvl ${level + 1}`}
                    </Text>
                  </View>
                </View>

                {/* Barra de XP inline */}
                <View style={styles.xpBarBg}>
                  <View
                    style={[
                      styles.xpBarFill,
                      { width: `${Math.round((currentXP / nextLevelXP) * 100)}%` as any },
                    ]}
                  />
                  <Text style={styles.xpBarText}>
                    {currentXP} / {nextLevelXP} XP
                  </Text>
                </View>
              </View>
            </FadeSlideIn>

            {/* ── Seção: Streak semanal ── */}
            <FadeSlideIn delay={220}>
              <View style={styles.section}>
                <StreakCalendar
                  studiedDays={gamificationState.studiedDays}
                  streak={streak}
                />
              </View>
            </FadeSlideIn>

            {/* ── Seção: Logout ── */}
            <FadeSlideIn delay={280}>
              <Pressable
                style={({ pressed }) => [
                  styles.logoutBtn,
                  pressed && { opacity: 0.6 },
                ]}
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
              >
                <Ionicons name="log-out-outline" size={20} color="#FF4D4D" />
                <Text style={styles.logoutBtnText}>Sair da conta</Text>
              </Pressable>
            </FadeSlideIn>

          </ScrollView>

          {/* Navbar */}
          <FadeSlideIn delay={320}>
            <BottomNavBar activeTab={activeTab} onTabPress={handleTabPress} />
          </FadeSlideIn>
        </SafeAreaView>
      )}

      <ScreenLoader visible={!pageReady} onHidden={() => setPageReady(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000721",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#000721",
  },
  // Cabeçalho da tela com botão de voltar e título
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#32374A",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 32,
  },
  // Seção genérica com título e conteúdo
  section: {
    backgroundColor: "#0D1B3E",
    borderRadius: 15,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  // Linha do avatar com botão de troca
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#093AFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#0026BD",
  },
  changePhotoBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Visualização do nome
  nameViewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  // Edição do nome
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#093AFF",
  },
  saveBtn: {
    backgroundColor: "#093AFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#0026BD",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#32374A",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
  // Linha de estatísticas (nível)
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#334155",
  },
  statLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  statValueGreen: {
    color: "#00DF21",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "#00DF21",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  // Barra de XP compacta
  xpBarBg: {
    height: 28,
    backgroundColor: "#1a1a2e",
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  xpBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#00DF21",
    borderRadius: 15,
    shadowColor: "#00DF21",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  xpBarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    zIndex: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  // Botão de logout com destaque vermelho para indicar ação destrutiva
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderRadius: 15,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  logoutBtnText: {
    color: "#FF4D4D",
    fontSize: 16,
    fontWeight: "700",
  },
});
