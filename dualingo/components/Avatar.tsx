import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

// Tamanhos disponíveis para o avatar
type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  uri?: string;           // URL da foto de perfil (opcional)
  name: string;           // Nome do usuário — usado para gerar as iniciais no fallback
  size?: AvatarSize;
  showBorder?: boolean;   // Exibe borda colorida ao redor do avatar
  style?: ViewStyle;
}

// Dimensões por tamanho
const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 36,
  md: 48,
  lg: 80,
};

// Extrai as iniciais do nome (ex: "João Silva" → "JS")
function getInitials(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  uri,
  name,
  size = "md",
  showBorder = false,
  style,
}: AvatarProps) {
  // Controla se a imagem falhou ao carregar
  const [imageError, setImageError] = useState(false);

  const dimension = SIZE_MAP[size];
  const fontSize = dimension * 0.35;
  const showFallback = !uri || imageError;

/*3Navegação implementada no projeto

### Tela de origem: `app/(app)/home.tsx`
### Tela de destino: `app/(app)/course.tsx`

### Código responsável pela navegação

Em `app/(app)/home.tsx`, a função `handleCoursePress` é chamada quando o usuário toca em um `CourseCard`:

```tsx
// app/(app)/home.tsx — linha 80-82
function handleCoursePress(courseId: string, title: string) {
  router.push({ pathname: "/(app)/course", params: { courseId, title } } as any);
}
```

O componente `CourseCard` recebe a função via prop `onPress`:

```tsx
// app/(app)/home.tsx — linha 117-122
{COURSES.map((course) => (
  <CourseCard
    key={course.id}
    title={course.title}
    image={course.image}
    onPress={() => handleCoursePress(course.id, course.title)}
  />
))}
```

### Diferença entre o método utilizado e outras alternativas

O Expo Router oferece três formas principais de navegar:

| Método | Comportamento | Quando usar |
|---|---|---|
| `router.push()` | Empilha a tela nova (pode voltar) | Navegação normal entre telas |
| `router.replace()` | Substitui a tela atual (não pode voltar) | Login → Home, para não deixar voltar ao login |
| `<Link href="...">` | Componente declarativo (como `<a>` no HTML) | Links em formulários ou textos |

No nosso projeto usamos `router.push()` para ir de Home para Course porque queremos que o usuário consiga voltar para a seleção de cursos. Já ao concluir ou sair de uma lição, usamos `router.replace()`:

```tsx
// app/(app)/question.tsx — linha 189
router.replace({ pathname: "/(app)/course", params: { courseId } } as any);
```

Isso evita que o usuário pressione "voltar" e retorne para dentro da lição já concluída.

--- */

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: dimension,
          height: dimension,
          borderRadius: 15,
          // Borda opcional em azul primário
          borderWidth: showBorder ? 2 : 0,
          borderColor: showBorder ? "#093AFF" : "transparent",
        },
        style,
      ]}
    >
      {showFallback ? (
        // Fallback: círculo com as iniciais do nome
        <View style={[styles.fallback, { borderRadius: 15 }]}>
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      ) : (
        // Imagem real do usuário
        <Image
          source={{ uri }}
          style={[styles.image, { borderRadius: 13 }]}
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  fallback: {
    flex: 1,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
