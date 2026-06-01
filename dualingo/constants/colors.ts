// ─────────────────────────────────────────────
// Design System — Cores e Tema do Dualingo
// ─────────────────────────────────────────────

export const Colors = {
  // Primárias
  primary: "#093AFF",
  primaryBorder: "#0026BD",
  primaryPressed: "#32374A",
  primaryPressedBorder: "#1B1B1B",

  // Verde (XP, nível, streak)
  green: "#00DF21",

  // Neutros
  white: "#FFFFFF",
  black: "#000000",

  // Fundos
  screenBackground: "#000721",
  headerBackground: "#32374A",
  cardBackground: "#0D1B3E",
  inputBackground: "#FFFFFF",
  modalBackground: "#0D1B3E",
  surfaceDark: "#1E293B",

  // Bordas
  inputBorder: "#E6E6E6",
  cardBorder: "#1E3A5F",

  // Texto
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.6)",
  textSubtle: "rgba(255,255,255,0.75)",
  textPlaceholder: "rgba(0,0,0,0.5)",
  textDark: "#1E293B",

  // Estados
  error: "#FF3B30",
  success: "#22C55E",
  warning: "#F97316",

  // Overlay (modais)
  overlay: "rgba(0,0,0,0.7)",

  // Opções de exercício
  optionDefault: "#334155",
  optionSelected: "#093AFF",
  optionCorrect: "#22C55E",
  optionIncorrect: "#FF3B30",

  // Feedback de exercício
  feedbackCorrectBg: "rgba(34,197,94,0.15)",
  feedbackCorrectBorder: "#22C55E",
  feedbackIncorrectBg: "rgba(255,59,48,0.15)",
  feedbackIncorrectBorder: "#FF3B30",
} as const;

// Atalhos semânticos para uso nos componentes
export const Theme = {
  screenBackground: Colors.screenBackground,
  headerBackground: Colors.headerBackground,
  cardBackground: Colors.white,
  modalBackground: Colors.modalBackground,

  brand: Colors.primary,
  brandGreen: Colors.green,

  text: Colors.text,
  textMuted: Colors.textMuted,
  textSubtle: Colors.textSubtle,

  inputBackground: Colors.inputBackground,
  inputBorder: Colors.inputBorder,
  inputError: Colors.error,

  courseCardTitle: Colors.textDark,

  overlay: Colors.overlay,

  // Opções de exercício
  optionDefault: Colors.optionDefault,
  optionSelected: Colors.optionSelected,
  optionCorrect: Colors.optionCorrect,
  optionIncorrect: Colors.optionIncorrect,

  // Feedback de exercício
  feedbackCorrectBg: Colors.feedbackCorrectBg,
  feedbackCorrectBorder: Colors.feedbackCorrectBorder,
  feedbackIncorrectBg: Colors.feedbackIncorrectBg,
  feedbackIncorrectBorder: Colors.feedbackIncorrectBorder,

  // ── Trilha de lições (LessonNode) ──────────────────────────────────────────
  // Cores dos nós da trilha conforme o status da lição
  lessonNodeCompleted: "#00DF21",   // verde — lição concluída
  lessonNodeAvailable: "#093AFF",   // azul  — lição disponível (atual)
  lessonNodeLocked: "#32374A",      // cinza — lição bloqueada

  // Texto do número da lição quando bloqueada
  lessonNodeLockedText: "rgba(255,255,255,0.3)",

  // Linhas de conexão entre os nós
  lessonPathCompleted: "#00DF21",   // verde — trecho já percorrido
  lessonPathIdle: "#32374A",        // cinza — trecho ainda bloqueado

  // Fundo do card de detalhes que aparece ao clicar no nó
  lessonCardBg: "#0D1B3E",

  // Botão "Revisar" (lição já concluída)
  lessonReviewBtn: "#32374A",
} as const;
