import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface Achievement {
  id: string;
  name: string;           // Nome da conquista
  description: string;    // Descrição do que é necessário para desbloquear
  icon: string;           // Emoji ou símbolo representando a conquista
  unlocked: boolean;      // Se o usuário já desbloqueou
  rewardClaimed: boolean; // Se o usuário já resgatou a recompensa
  unlockedAt?: string;    // Data de desbloqueio (ISO string, opcional)
  reward: string;         // Descrição da recompensa (ex: "+50 XP")
}

interface AchievementBadgeProps {
  achievement: Achievement;
  onClaimReward?: (id: string) => void;
}

export default function AchievementBadge({
  achievement,
  onClaimReward,
}: AchievementBadgeProps) {
  const { unlocked, rewardClaimed } = achievement;

  // Formata a data de desbloqueio para exibição
  function formatDate(iso?: string): string {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      {/* Ícone da conquista — escurecido quando bloqueado */}
      <View style={[styles.iconWrapper, !unlocked && styles.iconLocked]}>
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>

      {/* Informações da conquista */}
      <View style={styles.info}>
        <Text style={[styles.name, !unlocked && styles.textLocked]}>
          {achievement.name}
        </Text>
        <Text style={[styles.description, !unlocked && styles.textLocked]}>
          {achievement.description}
        </Text>

        {/* Data de desbloqueio — só aparece se desbloqueado */}
        {unlocked && achievement.unlockedAt ? (
          <Text style={styles.date}>
            Desbloqueado em {formatDate(achievement.unlockedAt)}
          </Text>
        ) : null}
      </View>

      {/* Botão de recompensa — só aparece se desbloqueado e não resgatado */}
      {unlocked && !rewardClaimed && (
        <TouchableOpacity
          style={styles.rewardBtn}
          onPress={() => onClaimReward?.(achievement.id)}
          accessibilityRole="button"
          accessibilityLabel={`Resgatar recompensa: ${achievement.reward}`}
        >
          <Text style={styles.rewardBtnText}>{achievement.reward}</Text>
        </TouchableOpacity>
      )}

      {/* Badge de resgatado */}
      {unlocked && rewardClaimed && (
        <View style={styles.claimedBadge}>
          <Text style={styles.claimedText}>✓ Resgatado</Text>
        </View>
      )}

      {/* Cadeado para conquistas bloqueadas */}
      {!unlocked && (
        <Text style={styles.lockIcon}>🔒</Text>
      )}
    </View>
  );
}

/* 1Estrutura geral do projeto Expo

O projeto foi gerado com o Expo e utiliza o **Expo Router** como sistema de navegação baseado em arquivos. A organização segue a convenção de pastas do framework, onde a estrutura de diretórios reflete diretamente as rotas da aplicação.

### Pastas principais

```
dualingo/
├── app/                   ← Rotas da aplicação (Expo Router)
│   ├── _layout.tsx        ← Layout raiz: envolve o app com SafeAreaProvider e GamificationProvider
│   ├── index.tsx          ← Ponto de entrada (redireciona para login ou home)
│   ├── (auth)/            ← Grupo de rotas públicas (login, register)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/             ← Grupo de rotas protegidas (autenticadas)
│       ├── _layout.tsx    ← Auth guard: verifica token antes de renderizar
│       ├── home.tsx       ← Tela principal com cursos
│       ├── course.tsx     ← Trilha de lições do curso
│       ├── question.tsx   ← Tela de exercícios da lição
│       ├── progress.tsx   ← Progresso e histórico do usuário
│       └── settings.tsx   ← Perfil e configurações
│
├── components/            ← Componentes reutilizáveis
│   ├── Header.tsx
│   ├── BottomNavBar.tsx
│   ├── ExerciseCard.tsx
│   ├── CourseCard.tsx
│   ├── XPResultScreen.tsx
│   ├── AchievementUnlockedModal.tsx
│   ├── ui/                ← Componentes genéricos de UI
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── ScreenLoader.tsx
│   │   └── FadeSlideIn.tsx
│   ├── exercise/
│   │   └── OptionRow.tsx
│   └── admin/             ← Painel administrativo
│       ├── AdminPanel.tsx
│       └── AdminCourses.tsx
│
├── store/                 ← Gerenciamento de estado global
│   ├── gamificationStore.tsx  ← Context API + useReducer (XP, nível, streak)
│   ├── userStore.ts           ← Zustand (dados do perfil do usuário)
│   ├── achievementStore.ts    ← Zustand (conquistas)
│   └── progressStore.ts       ← Zustand (progresso nas lições)
│
├── services/              ← Camada de comunicação com o backend
│   ├── api.ts             ← Cliente Axios central com interceptors de JWT
│   ├── authService.ts     ← Login, registro, senha
│   ├── lessonService.ts   ← Buscar e concluir lições
│   └── progressService.ts ← Gamificação e histórico
│
├── hooks/                 ← Custom hooks
│   └── useResponsiveScale.ts  ← Escala responsiva baseada na largura da tela
│
├── types/                 ← Interfaces TypeScript
├── constants/             ← Cores, assets de exercícios
├── data/                  ← Mocks de cursos e exercícios para desenvolvimento
└── assets/                ← Imagens e recursos estáticos
```

/* ### Como funciona a organização

**Telas:** Cada arquivo `.tsx` dentro de `app/` se torna automaticamente uma rota. Os parênteses em `(auth)` e `(app)` criam grupos de rota que não aparecem na URL, mas permitem layouts compartilhados e guards de autenticação.

**Componentes:** Separados por responsabilidade. Componentes de UI genéricos ficam em `ui/`, os específicos de exercício em `exercise/`, e os administrativos em `admin/`.

**Estado global:** Usamos duas abordagens: `gamificationStore` usa Context API com `useReducer` por ser um estado que envolve lógica de negócio complexa; os demais stores usam Zustand por ser mais simples e direto.

**Serviços:** Toda chamada HTTP passa pelo `api.ts`, que injeta automaticamente o token JWT em cada requisição via interceptor do Axios.

--- */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1B3E",
    borderRadius: 15,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  // Card bloqueado fica mais escuro e com opacidade reduzida
  cardLocked: {
    backgroundColor: "#0A0F1E",
    opacity: 0.55,
    borderColor: "#1a1a2e",
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E3A5F",
    justifyContent: "center",
    alignItems: "center",
  },
  iconLocked: {
    backgroundColor: "#1a1a2e",
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 16,
  },
  textLocked: {
    color: "rgba(255,255,255,0.3)",
  },
  date: {
    color: "#00DF21",
    fontSize: 11,
    marginTop: 2,
  },
  // Botão de resgatar recompensa
  rewardBtn: {
    backgroundColor: "#093AFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#0026BD",
  },
  rewardBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  // Badge de recompensa já resgatada
  claimedBadge: {
    backgroundColor: "#0D2E1A",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#00DF21",
  },
  claimedText: {
    color: "#00DF21",
    fontSize: 11,
    fontWeight: "700",
  },
  lockIcon: {
    fontSize: 18,
  },
});
