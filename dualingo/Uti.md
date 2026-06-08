Dualingo

## Questão 1 — Estrutura geral do projeto Expo

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

### Como funciona a organização

**Telas:** Cada arquivo `.tsx` dentro de `app/` se torna automaticamente uma rota. Os parênteses em `(auth)` e `(app)` criam grupos de rota que não aparecem na URL, mas permitem layouts compartilhados e guards de autenticação.

**Componentes:** Separados por responsabilidade. Componentes de UI genéricos ficam em `ui/`, os específicos de exercício em `exercise/`, e os administrativos em `admin/`.

**Estado global:** Usamos duas abordagens: `gamificationStore` usa Context API com `useReducer` por ser um estado que envolve lógica de negócio complexa; os demais stores usam Zustand por ser mais simples e direto.

**Serviços:** Toda chamada HTTP passa pelo `api.ts`, que injeta automaticamente o token JWT em cada requisição via interceptor do Axios.

---

## Questão 2 — Descrição detalhada de uma tela

### Tela escolhida: `app/(app)/question.tsx` — Tela de Exercícios

Esta é a tela mais completa e representativa do projeto, por isso a escolhemos para apresentar.

### Objetivo da tela

A tela `QuestionScreen` apresenta os exercícios de uma lição ao usuário. Ele responde cada questão uma por uma e, ao finalizar, recebe o resultado (XP ganho, nível atual, conquistas desbloqueadas). Para passar de fase, o aluno precisa acertar pelo menos 70% das questões.

### Arquivos envolvidos

- `app/(app)/question.tsx` — Tela principal
- `components/ExerciseCard.tsx` — Renderiza cada exercício
- `components/ui/Button.tsx` — Botões de ação
- `components/Header.tsx` — Barra superior com dados do usuário
- `components/XPResultScreen.tsx` — Tela de resultado após finalizar
- `components/AchievementUnlockedModal.tsx` — Modal de conquista desbloqueada
- `store/gamificationStore.tsx` — Calcula e atualiza XP e streak
- `store/progressStore.ts` — Marca lição como concluída e desbloqueia a próxima
- `store/achievementStore.ts` — Verifica e desbloqueia conquistas
- `store/userStore.ts` — Acessa dados do usuário (username, streak, avatar)
- `services/lessonService.ts` — Envia respostas ao backend
- `data/mockExercises.ts` — Fonte de exercícios em desenvolvimento

### Componentes utilizados

| Componente | Função na tela |
|---|---|
| `Header` | Exibe username, nível, streak e avatar |
| `ExerciseCard` | Renderiza a pergunta, imagem e opções de resposta |
| `Button` | Botões "Confirmar", "Próximo" e "Voltar" |
| `BottomNavBar` | Navegação entre as abas principais |
| `XPResultScreen` | Exibida após finalizar todos os exercícios |
| `AchievementUnlockedModal` | Modal quando uma conquista é desbloqueada |

### Fluxo de navegação para acessar essa tela

1. Usuário abre o app → `app/index.tsx`
2. Tem token salvo → `app/(app)/_layout.tsx` (auth guard valida)
3. Entra em `app/(app)/home.tsx`
4. Clica em um curso → `app/(app)/course.tsx` (recebe `courseId` como parâmetro)
5. Clica em uma lição disponível → `app/(app)/question.tsx` (recebe `courseId` e `lessonId`)

A navegação para `question.tsx` é feita em `course.tsx` com:
```tsx
router.push({
  pathname: "/(app)/question",
  params: { courseId, lessonId }
} as any);
```

---

## Questão 3 — Navegação implementada no projeto

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

---

## Questão 4 — Componente reutilizável: `Button`

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

---

## Questão 5 — Gerenciamento de estado com React Hooks e Zustand

O projeto usa **duas abordagens** de gerenciamento de estado global, cada uma para um propósito específico.

### 5.1 — Context API + useReducer: `gamificationStore.tsx`

**Hook/Store utilizado:** `useReducer` dentro de um `GamificationProvider` (Context API)

**Informação armazenada:**
```tsx
const initialState: GamificationState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  studiedDays: [],
};
```

**Como ocorre a atualização do estado:**

O estado só é modificado através de `actions` disparadas pelo `dispatch`. Por exemplo, ao concluir uma lição:

```tsx
// store/gamificationStore.tsx — linha 185-212
const completeLesson = useCallback(
  (result: LessonResult): XPBreakdown => {
    const today = toLocalDateString();
    const newStreak = updateStreak(state.streak, state.lastStudyDate);
    const breakdown = calculateXPGain({ ...result, streakDays: newStreak });

    dispatch({
      type: "COMPLETE_LESSON",
      payload: { ...result, streakDays: newStreak },
    });

    syncUserStore({ ... }); // sincroniza com o Zustand
    return breakdown;
  },
  [state.xp, state.streak, state.lastStudyDate, state.studiedDays]
);
```

O `reducer` processa a action `COMPLETE_LESSON` e retorna o novo estado:

```tsx
// store/gamificationStore.tsx — linha 110-126
case "COMPLETE_LESSON": {
  const breakdown = calculateXPGain(action.payload);
  const newXP = state.xp + breakdown.total;
  const today = toLocalDateString();
  const newStreak = action.payload.streakDays;

  return {
    xp: newXP,
    level: calculateLevel(newXP),
    streak: newStreak,
    lastStudyDate: today,
    studiedDays: [...state.studiedDays, today],
  };
}
```

**Como a interface reage:** Qualquer componente que use `useGamification()` é re-renderizado automaticamente quando o estado muda. O `Header`, por exemplo, atualiza o streak e o nível exibidos imediatamente após a lição ser concluída.

---

### 5.2 — Zustand: `userStore.ts`

**Store utilizado:** `useUserStore` (Zustand)

**Informação armazenada:** Dados do perfil do usuário logado (userId, username, email, avatarUri, role, level, streak, currentXP, nextLevelXP).

**Como ocorre a atualização do estado:**

```tsx
// store/userStore.ts — linha 75-86
hydrateFromUser: (user: User) =>
  set({
    userId: user.userId,
    username: user.name,
    email: user.email,
    avatarUri: user.avatarUrl,
    role: user.role ?? "user",
    level: user.level,
    streak: user.streak,
    currentXP: user.xp,
    nextLevelXP: getNextLevelXP(user.level),
  }),
```

**Como a interface reage:** O `Header` acessa `useUserStore()` e atualiza streak e nível em tempo real. A `XPBar` na `HomeScreen` usa `state.xp` e `state.level` do `gamificationStore`, que por sua vez chama `syncUserStore()` para manter ambos sincronizados.

---

## Questão 6 — Chamada ao backend

### Endpoint: `POST /lessons/{id}/complete`

Esta chamada é feita em `services/lessonService.ts` e disparada pela tela `question.tsx` ao finalizar todos os exercícios.

### Arquivo: `services/lessonService.ts`

```typescript
// services/lessonService.ts — linha 41-50
export async function completeLesson(
  lessonId: string,
  data: CompleteLessonRequest
): Promise<CompleteLessonResponse> {
  const response = await api.post<ApiResponse<CompleteLessonResponse>>(
    `/lessons/${lessonId}/complete`,
    data
  );
  return response.data.data;
}
```

### Método HTTP utilizado
`POST`

### Dados enviados

```typescript
// services/lessonService.ts — linha 5-7
interface CompleteLessonRequest {
  answers: Record<string, string>; // { exerciseId: answerId }
}
```

Exemplo de payload real:
```json
{
  "answers": {
    "exercise-1": "option-b",
    "exercise-2": "true",
    "exercise-3": "option-a"
  }
}
```

### Resposta esperada

```typescript
// services/lessonService.ts — linha 9-18
interface CompleteLessonResponse {
  passed: boolean;       // true se acertou >= 70%
  correctCount: number;
  wrongCount: number;
  xpEarned: number;
  newXP?: number;        // XP total atualizado
  newLevel?: number;     // nível atualizado
  newStreak?: number;    // streak atualizado
  nextLessonId?: string; // próxima lição desbloqueada
}
```

### Como a aplicação trata possíveis erros

```tsx
// app/(app)/question.tsx — linha 117-133
if (lessonId) {
  lessonService.completeLesson(lessonId, { answers: answersMap })
    .then((response) => {
      if (response.passed) {
        useUserStore.getState().hydrateFromGamification({
          xp: response.newXP ?? state.xp,
          level: response.newLevel ?? state.level,
          streak: response.newStreak ?? state.streak,
          achievements: [],
        });
      }
    })
    .catch((err) => {
      console.warn("[QuestionScreen] Erro ao salvar no backend:", err?.message);
    });
}
```

A aplicação usa uma estratégia de **otimistic update**: a UI é atualizada imediatamente com os cálculos locais (`completeLesson` do `gamificationStore`) sem esperar o backend. Se a chamada falhar (backend offline, token expirado), apenas loga um aviso — o usuário não perde o progresso local da sessão.

O tratamento global de erros HTTP fica no interceptor de `api.ts`:

```typescript
// services/api.ts — linha 96-118
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (!error.response) {
      return Promise.reject({ statusCode: 0, message: "Não foi possível conectar ao servidor." });
    }
    const status = error.response.status;
    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      await deleteStorageItem(TOKEN_KEYS.ACCESS);
      await deleteStorageItem(TOKEN_KEYS.REFRESH);
      await deleteStorageItem(TOKEN_KEYS.ID);
      setTimeout(() => { isHandling401 = false; }, 2000);
    }
    return Promise.reject({ statusCode: status, message });
  }
);
```

---

## Questão 7 — Fluxo completo de uma funcionalidade com backend

### Funcionalidade: Conclusão de uma lição

```
Usuário
  ↓ Responde todos os exercícios e toca em "Finalizar lição"
Interface (question.tsx)
  ↓ handleNext() → calcula acertos, monta answersMap
Evento
  ↓ Chama completeLesson() do gamificationStore (UI atualiza imediatamente)
  ↓ Chama progressComplete() do progressStore (desbloqueia próxima lição)
  ↓ Chama achievementUnlock() do achievementStore (verifica conquistas)
Serviço (lessonService.ts)
  ↓ lessonService.completeLesson(lessonId, { answers: answersMap })
API (api.ts + backend)
  ↓ POST /lessons/{id}/complete com payload JSON
  ↓ Backend valida respostas, calcula XP, atualiza banco de dados
Resposta
  ↓ { passed, newXP, newLevel, newStreak, nextLessonId }
Atualização da Interface
  ↓ useUserStore.hydrateFromGamification() atualiza XP/nível/streak
  ↓ setLessonResult(breakdown) → renderiza XPResultScreen
  ↓ AchievementUnlockedModal aparece se houve conquista nova
```

**Trecho completo do fluxo em `question.tsx`:**

```tsx
// Passo 1: Usuário toca em "Finalizar lição" → handleNext() é chamado
// Passo 2: Calcula resultado local
const finalCorrect = finalResults.filter((r) => r === true).length;
const passed = total > 0 && finalCorrect >= Math.ceil(total * 0.7);

// Passo 3: Monta o mapa de respostas para o backend
const answersMap = { ...answersRef.current };

// Passo 4: Envia ao backend (não bloqueia a UI)
if (lessonId) {
  lessonService.completeLesson(lessonId, { answers: answersMap })
    .then((response) => {
      if (response.passed) {
        useUserStore.getState().hydrateFromGamification({
          xp: response.newXP ?? state.xp,
          level: response.newLevel ?? state.level,
          streak: response.newStreak ?? state.streak,
          achievements: [],
        });
      }
    })
    .catch((err) => {
      console.warn("[QuestionScreen] Erro ao salvar no backend:", err?.message);
    });
}

// Passo 5: Atualiza a UI imediatamente (optimistic update)
if (passed) {
  breakdown = completeLesson({
    correctAnswers: finalCorrect,
    totalQuestions: total,
    streakDays: state.streak,
  });

  // Passo 6: Verifica conquistas
  achievementUnlock("first-lesson");
  if (accuracyPercent === 100) achievementUnlock("perfect-score");

  // Passo 7: Exibe tela de resultado
  setFinalXP(useUserStore.getState().currentXP);
  setFinalLevel(useUserStore.getState().level);
}

setLessonResult(breakdown); // Dispara renderização do XPResultScreen
```

**O `gamificationStore` processa o cálculo de XP:**

```tsx
// store/gamificationStore.tsx — linha 30-48
export function calculateXPGain(result: LessonResult): XPBreakdown {
  const base = Math.round(
    (result.correctAnswers / Math.max(result.totalQuestions, 1)) * 1000
  );
  const streakBonus =
    result.streakDays > 0 && result.streakDays % 7 === 0 ? 500 : 0;

  return {
    base,
    streakBonus,
    total: base + streakBonus,
    accuracyPercent,
  };
}
```

**O `progressService` fornece os dados de gamificação na Home:**

```typescript
// services/progressService.ts — linha 37-40
export async function getGamification(): Promise<GamificationData> {
  const response = await api.get<ApiResponse<GamificationData>>("/gamification");
  return response.data.data;
}
```

---

## Questão 8 — Função assíncrona com async/await

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

---

## Questão 9 — Análise linha por linha

### Trecho escolhido: `calculateXPGain` — `store/gamificationStore.tsx` (linhas 30–48)

Esta função é o coração do sistema de gamificação. Ela calcula quanto XP o usuário ganha ao concluir uma lição.

---

**Linha: 30**
```typescript
export function calculateXPGain(result: LessonResult): XPBreakdown {
```
**Explicação:** Declara a função como `export` para que outras partes do app possam importá-la diretamente. Recebe um objeto `LessonResult` com `correctAnswers`, `totalQuestions` e `streakDays`, e retorna um `XPBreakdown` detalhando como o XP foi calculado.

---

**Linha: 31–34**
```typescript
const accuracyPercent =
  result.totalQuestions > 0
    ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
    : 0;
```
**Explicação:** Calcula a porcentagem de acerto do usuário. Divide os acertos pelo total de questões e multiplica por 100 para obter um número inteiro entre 0 e 100. A guarda `> 0` evita divisão por zero caso a lição não tenha exercícios.

---

**Linha: 36–39**
```typescript
const base = Math.round(
  (result.correctAnswers / Math.max(result.totalQuestions, 1)) * 1000
);
```
**Explicação:** Calcula o XP base da lição. Se o aluno acertar tudo, ganha 1000 XP. Se acertar metade, ganha 500. O `Math.max(..., 1)` é uma segunda proteção contra divisão por zero. O `Math.round` garante que o XP seja sempre um número inteiro.

---

**Linha: 40–41**
```typescript
const streakBonus =
  result.streakDays > 0 && result.streakDays % 7 === 0 ? 500 : 0;
```
**Explicação:** Verifica se o streak atual é múltiplo de 7 (7, 14, 21...). Se sim, o usuário ganha um bônus de 500 XP por manter a sequência de estudos por uma semana. A condição `> 0` evita que o streak 0 (sem estudar nunca) acione o bônus, já que `0 % 7 === 0` seria matematicamente verdadeiro.

---

**Linha: 43–48**
```typescript
return {
  base,
  streakBonus,
  total: base + streakBonus,
  accuracyPercent,
};
```
**Explicação:** Retorna o objeto `XPBreakdown` com o detalhamento completo. Esse objeto é usado tanto para atualizar os stores (somando `total` ao XP atual) quanto para exibir na tela `XPResultScreen`, mostrando ao usuário de forma transparente como seu XP foi calculado.

---

## Questão 10 — Análise crítica do projeto

### Melhoria técnica: Persistência local com AsyncStorage ou MMKV

Atualmente, ao fechar o app completamente, o estado dos stores Zustand (`progressStore`, `achievementStore`) é perdido. Na próxima abertura, a função `guard()` busca apenas os dados de gamificação no backend (`/gamification`), mas o progresso de quais lições estão desbloqueadas vem de mocks locais.

**Sugestão:** Adicionar persistência com o middleware `persist` do Zustand usando `expo-secure-store` ou `react-native-mmkv` como storage:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useProgressStore = create(
  persist(
    (set) => ({ ... }),
    {
      name: 'dualingo-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

Isso garantiria que o progresso das lições seja preservado entre sessões sem depender do backend, melhorando a experiência offline e reduzindo chamadas à API.

---

### Melhoria de UX: Feedback háptico ao confirmar resposta

O app já tem `expo-haptics` como dependência no `package.json`, mas ele não está sendo utilizado na tela de exercícios. Adicionar vibração ao confirmar uma resposta certa ou errada tornaria a experiência muito mais similar ao Duolingo original:

```tsx
// Em question.tsx, dentro de handleConfirm():
import * as Haptics from 'expo-haptics';

function handleConfirm() {
  if (!selectedAnswerId || !exercise) return;
  const isCorrect = selectedAnswerId === exercise.correctAnswerId;

  if (isCorrect) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  // ... resto da lógica
}
```

Essa melhoria custaria literalmente 3 linhas de código e elevaria significativamente a percepção de qualidade do produto para usuários de dispositivos físicos.

---

### Funcionalidade para próxima versão: Modo offline com fila de sincronização

Hoje, se o usuário estiver sem internet e concluir uma lição, a chamada `POST /lessons/{id}/complete` falha silenciosamente (apenas um `console.warn`). O XP é calculado localmente, mas o progresso não é salvo no backend.

**Proposta:** Implementar uma fila de sincronização offline com `react-native-netinfo` para detectar conectividade e persistir as ações pendentes localmente:

```typescript
// services/syncQueue.ts
interface PendingAction {
  type: 'complete_lesson';
  lessonId: string;
  answers: Record<string, string>;
  timestamp: number;
}

async function flushQueue(): Promise<void> {
  const queue = await loadQueueFromStorage();
  for (const action of queue) {
    await lessonService.completeLesson(action.lessonId, { answers: action.answers });
  }
  await clearQueue();
}
```

Isso permitiria que o usuário estudasse no metrô ou em locais sem sinal e tivesse seu progresso sincronizado automaticamente na próxima vez que abrisse o app com conexão. É uma feature especialmente relevante para o público-alvo de apps educacionais.
