import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StreakBadge from "./StreakBadge";

// Cor verde principal do projeto
const GREEN = "#00DF21";

interface HomeHeaderProps {
  username: string;
  level: number;
  streak: number;
}

// Header da home: avatar + nome/nível à esquerda, streak à direita
export default function HomeHeader({ username, level, streak }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Lado esquerdo: avatar + info do usuário */}
      <View style={styles.userInfo}>
        {/* Avatar placeholder com ícone de pessoa */}
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={26} color="#FFFFFF" />
        </View>

        {/* Nome e nível centralizados verticalmente */}
        <View style={styles.textBlock}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.level}>Lvl {level}</Text>
        </View>
      </View>

      {/* Lado direito: streak */}
      <StreakBadge streak={streak} />
    </View>
  );
}

/*8Função assíncrona com async/await

### Arquivo: `app/(app)/_layout.tsx` — função `guard()`

```tsx
// app/(app)/_layout.tsx — linha 21-58
export default function AppLayout() {
  const [ready, setReady] = useState(false);
  const userId = useUserStore((s) => s.userId);

  useEffect(() => {
    async function guard() {
      if (userId) {
        setReady(true);
        return;
      }

      const token = await getStorageItem(TOKEN_KEYS.ACCESS);

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      try {
        const data = await progressService.getGamification() as any;

        useUserStore.getState().hydrateFromGamification(data);

        if (data.role) useUserStore.setState({ role: data.role });
        if (data.name) useUserStore.setState({ username: data.name });
        if (data.userId) useUserStore.setState({ userId: data.userId });

        useAchievementStore.getState().hydrateFromApi(data.achievements);

        setReady(true);
      } catch {
        router.replace("/(auth)/login");
      }
    }

    guard();
  }, [userId]);
```

### Objetivo da função

A função `guard()` é o portão de segurança do app. Ela roda toda vez que o layout das telas autenticadas (`(app)`) é montado — por exemplo, quando o usuário abre o app direto na home (após fechar e reabrir), sem passar pelo login novamente.

### Uso de async/await

- `await getStorageItem(TOKEN_KEYS.ACCESS)` — lê o token salvo no SecureStore (operação de I/O, precisa aguardar).
- `await progressService.getGamification()` — faz uma requisição HTTP ao backend para restaurar os dados do usuário (XP, nível, streak).

O `async/await` permite escrever esse fluxo assíncrono de forma sequencial e legível, como se fosse código síncrono.

### Tratamento de erros

O bloco `try/catch` captura dois tipos de falha:
1. **Token expirado** — o interceptor de `api.ts` limpa os tokens e a requisição retorna erro 401.
2. **Backend offline** — o Axios lança um erro de rede.

Em qualquer caso, o `catch` redireciona o usuário para a tela de login com `router.replace("/(auth)/login")`, garantindo que ele não fique preso em uma tela sem dados.

### Impacto na aplicação

- **Positivo:** O usuário que fecha e reabre o app não precisa fazer login novamente. A sessão é restaurada automaticamente em background.
- **Fallback seguro:** Se algo der errado, o app não trava. Ele simplesmente redireciona para o login e o usuário autentica novamente.
- **UX:** Enquanto a verificação acontece, a tela exibe um `ActivityIndicator` (spinner) em vez de conteúdo parcial, evitando flashes de conteúdo incorreto.

--- */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",       // centraliza verticalmente todos os filhos
    justifyContent: "space-between",
    backgroundColor: "#32374A", // cor de fundo conforme solicitado
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",       // avatar e texto alinhados verticalmente
    gap: 10,
  },
  // Avatar com border radius 15
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  // Bloco de texto centralizado verticalmente pelo alignItems do pai
  textBlock: {
    justifyContent: "center",
    gap: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Nível em verde com glow
  level: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: GREEN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
