import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Abas disponíveis na navbar
type Tab = "home" | "progress" | "settings";

interface BottomNavBarProps {
  activeTab: Tab;
  onTabPress: (tab: Tab) => void;
}

// Navbar inferior com três botões: Home, Progresso e Configurações
export default function BottomNavBar({ activeTab, onTabPress }: BottomNavBarProps) {
  return (
    <View style={styles.container}>
      {/* Botão Home */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("home")}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={26}
          color={activeTab === "home" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>

      {/* Divisor vertical */}
      <View style={styles.divider} />

      {/* Botão Progresso / Conquistas */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("progress")}
        accessibilityRole="button"
        accessibilityLabel="Progresso"
      >
        <Ionicons
          name={activeTab === "progress" ? "trophy" : "trophy-outline"}
          size={26}
          color={activeTab === "progress" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>

      {/* Divisor vertical */}
      <View style={styles.divider} />

      {/* Botão Configurações */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabPress("settings")}
        accessibilityRole="button"
        accessibilityLabel="Configurações"
      >
        <Ionicons
          name={activeTab === "settings" ? "settings" : "settings-outline"}
          size={26}
          color={activeTab === "settings" ? "#093AFF" : "#64748B"}
        />
      </TouchableOpacity>
    </View>
  );
}

/*4Componente reutilizável: `Button`

### Arquivo: `components/ui/Button.tsx`

### Responsabilidade

O `Button` é o componente de botão padrão do projeto. Ele encapsula toda a lógica visual de estados (normal, pressionado, desabilitado, carregando) e estilos responsivos, evitando que cada tela precise reimplementar isso.

### Props recebidas

```tsx
interface ButtonProps {
  label: string;          // Texto exibido no botão
  onPress?: () => void;   // Função chamada ao tocar
  variant?: "primary" | "secondary" | "disabled";  // Estilo visual
  loading?: boolean;      // Substitui o texto por um spinner
  icon?: React.ReactNode; // Ícone opcional à esquerda do texto
  fullWidth?: boolean;    // Se ocupa 100% da largura (padrão: true)
}
```

### Como é utilizado em diferentes partes da aplicação

**Em `question.tsx` — três variantes diferentes na mesma tela:**
```tsx
// Botão de confirmar: fica desabilitado até selecionar uma resposta
<Button
  label="Confirmar"
  onPress={handleConfirm}
  variant={selectedAnswerId ? "primary" : "disabled"}
/>

// Botão de avançar: aparece após confirmar a resposta
<Button label={btnLabel} onPress={handleNext} variant="primary" />

// Botão de voltar: secundário, sempre disponível
<Button label="Voltar" onPress={goToCourse} variant="secondary" />
```

**Em telas de autenticação (`login.tsx`, `register.tsx`):**
```tsx
<Button label="Entrar" onPress={handleLogin} loading={isLoading} />
```

### Benefícios da reutilização

1. **Consistência visual:** Todos os botões do app têm o mesmo estilo, tamanho e comportamento de feedback tátil.
2. **Responsividade centralizada:** O cálculo de escala (`rs()`) fica em um único lugar; mudar o tamanho base afeta todos os botões automaticamente.
3. **Estado de loading unificado:** Qualquer botão pode exibir um spinner apenas passando `loading={true}`, sem precisar de lógica extra em cada tela.
4. **Acessibilidade:** Os atributos `accessibilityRole="button"` e `accessibilityState` são definidos uma vez e herdados por toda a aplicação.
 */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
});
