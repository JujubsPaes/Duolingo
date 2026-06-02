# Perguntas e Respostas — Projeto Dualingo

---

## 1. Estrutura geral do projeto

O projeto usa Expo Router com navegação baseada em arquivos. A pasta `app/` contém as telas organizadas em grupos: `(auth)/` para login e cadastro, `(app)/` para as telas pós-login. `components/` tem componentes reutilizáveis, `services/` faz chamadas HTTP ao backend via Axios, `store/` gerencia estado global com Zustand e Context API. O `_layout.tsx` raiz envolve tudo com `SafeAreaProvider` e `GamificationProvider`.

---

## 2. Tela de Login

**Objetivo:** autenticar o usuário e redirecionar para a Home.

**Arquivos envolvidos:** `login.tsx`, `authService.ts`, `api.ts`, `userStore.ts`

**Componentes usados:** Input, Button, FadeSlideIn, Modal

**Fluxo:** app abre → `index.tsx` redireciona para login → usuário preenche email/senha → `handleLogin()` chama `authService.login()` → backend valida → tokens salvos no SecureStore → `router.replace("/(app)/home")`

---

## 3. Navegação

**Origem:** `login.tsx`  
**Destino:** `home.tsx`  
**Código:** `router.replace("/(app)/home")`

O `replace` substitui a tela atual na pilha, impedindo o usuário de voltar ao login com o botão "back". Diferente do `router.push()` que adiciona na pilha e permite voltar, e do `<Redirect>` que é declarativo (usado no `index.tsx`).

---

## 4. Componente reutilizável: Button

**Responsabilidade:** renderizar botões padronizados em todo o app.

**Props:** `label` (texto), `onPress` (ação), `variant` (primary/secondary/disabled), `loading` (spinner), `icon`, `fullWidth`

**Onde é usado:** login, cadastro, exercícios, modais

**Benefícios:** visual consistente, responsividade automática com `useWindowDimensions`, acessibilidade embutida, lógica de loading centralizada.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useState`  
**Arquivo:** `login.tsx`  
**Estados:** `email`, `password`, `loading`, `loginError`

**Atualização:** `onChangeText={setEmail}` atualiza a cada caractere digitado.

**Reação da UI:** `loading=true` mostra spinner no botão; `loginError` não vazio renderiza texto vermelho; campo vazio mostra mensagem de validação.

---

## 6. Chamada ao backend

**Arquivo:** `authService.ts`  
**Endpoint:** `POST /auth/login`  
**Dados enviados:** `{ email, password }`  
**Resposta:** `{ success: true, data: { user: {...}, tokens: {...} } }`

**Tratamento de erros:** sem resposta → "Não foi possível conectar"; 401 → limpa tokens; qualquer erro → extrai `message` e exibe via `setLoginError()`.

---

## 7. Fluxo completo de uma lição

Usuário responde exercícios → clica "Finalizar lição" → `handleNext()` monta mapa de respostas → `lessonService.completeLesson(lessonId, { answers })` → `POST /lessons/{id}/complete` → backend valida, calcula XP, atualiza streak → resposta com `passed`, `xpEarned`, `newLevel` → `hydrateFromGamification()` atualiza stores → UI mostra `XPResultScreen` com XP ganho.

---

## 8. Função assíncrona

**Função:** `login()` em `authService.ts`

- `async` marca como assíncrona
- `await api.post(...)` espera a resposta HTTP
- `await setStorageItem(...)` espera a gravação no SecureStore
- Se `api.post` falhar, o interceptor formata o erro e a Promise é rejeitada
- O `catch` no `login.tsx` captura e exibe a mensagem
- Se sucesso, tokens ficam salvos e o usuário é redirecionado

---

## 9. Trecho explicado linha por linha

```javascript
api.interceptors.request.use(
  async (config) => {                              // 1. Roda antes de cada requisição HTTP
    const token = await getStorageItem(...);        // 2. Busca o token salvo no SecureStore
    if (token && config.headers) {                  // 3. Se existe token e headers disponível
      config.headers.Authorization = `Bearer ${token}`; // 4. Injeta o token no header
    }
    return config;                                  // 5. Retorna config para o Axios prosseguir
  },
  (error) => Promise.reject(error)                  // 6. Se erro, rejeita a Promise
);
```

Centraliza a autenticação — sem ele, teríamos que adicionar o token manualmente em cada chamada.

---

## 10. Análise crítica

**Melhoria técnica:** implementar refresh token automático — quando o token expira (401), usar o `refreshToken` para obter novo `accessToken` sem forçar novo login.

**Melhoria UX:** adicionar feedback háptico (vibração) ao acertar/errar exercícios usando `expo-haptics` que já está instalado.

**Funcionalidade futura:** ranking/leaderboard entre usuários — `GET /leaderboard` no backend ordenando por XP, nova tela no frontend com top 10 da semana para incentivar competição.


---
---

# Perguntas e Respostas — Exemplo 2 (Tela de Curso e Progresso)

---

## 1. Estrutura geral do projeto

O backend local fica em `backend/src/local/` e usa Express + banco JSON em memória. O arquivo `database.ts` simula o DynamoDB com Single Table Design (PK + SK). O `seed-local.ts` popula cursos e lições ao iniciar. As rotas em `routes/` espelham o `serverless.yml` que será usado em produção na AWS. O banco persiste em `backend/data/db.json`.

---

## 2. Tela de Curso (Trilha)

**Objetivo:** exibir a trilha de lições de um curso com status de desbloqueio.

**Arquivos envolvidos:** `course.tsx`, `courseService.ts`, `progressStore.ts`, `mockCourses.ts`

**Componentes usados:** LessonNode, XPBar, Header, BottomNavBar

**Fluxo:** Home → clica no curso → `course.tsx` monta → busca `GET /courses/:id/modules/:moduleId` para cada módulo → backend calcula status baseado no histórico → frontend exibe nós coloridos (verde=completa, azul=disponível, cinza=bloqueada)

---

## 3. Navegação

**Origem:** `course.tsx`  
**Destino:** `question.tsx`  
**Código:** `router.push({ pathname: "/(app)/question", params: { lessonId, courseId } })`

O `push` adiciona na pilha de navegação, permitindo voltar ao curso após a lição. Os parâmetros `lessonId` e `courseId` são passados via query params e recuperados com `useLocalSearchParams()` na tela de destino.

---

## 4. Componente reutilizável: LessonNode

**Responsabilidade:** renderizar a trilha visual de lições com elipses conectadas por linhas.

**Props:** `lessons` (array com id, title, status), `onStart` (callback ao clicar), `hideHeader`, `onAvailableLessonY`

**Onde é usado:** `course.tsx` dentro de cada módulo expandido

**Benefícios:** visual gamificado tipo Duolingo, posicionamento alternado (esquerda/direita), cores semânticas por status, animação de scroll automático até a próxima lição disponível.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useEffect`  
**Arquivo:** `course.tsx`  
**O que faz:** ao montar a tela, busca o status das lições no backend e atualiza o `progressStore`

**Atualização:** `useProgressStore.setState()` aplica os overrides vindos do backend sobre os dados do mock.

**Reação da UI:** lições mudam de cor conforme o status retornado — se o backend diz que a lição 2 está "completed", o nó fica verde imediatamente.

---

## 6. Chamada ao backend

**Arquivo:** `courseService.ts`  
**Endpoint:** `GET /courses/:id/modules/:moduleId`  
**Dados enviados:** nenhum (apenas token no header)  
**Resposta:** `{ success: true, data: { moduleId, name, lessons: [{ lessonId, status }] } }`

**Lógica do backend:** busca o histórico do usuário (`HISTORY#`), verifica quais lições já foram completadas, e calcula o status de cada uma (completed se está no histórico, available se a anterior foi completada, locked caso contrário).

---

## 7. Fluxo completo de desbloqueio progressivo

Usuário completa lição 2 → backend salva no histórico (`HISTORY#timestamp`) → retorna `nextLessonId: "lesson-3"` → frontend atualiza `progressStore` localmente (lição 2 = completed, lição 3 = available) → ao reabrir o curso → `GET /courses/:id/modules/:moduleId` → backend recalcula baseado no histórico → lição 3 aparece como "available" (azul).

---

## 8. Função assíncrona

**Função:** `getModule()` em `courseService.ts`

```typescript
export async function getModule(courseId: string, moduleId: string) {
  const response = await api.get(`/courses/${courseId}/modules/${moduleId}`);
  return response.data.data;
}
```

- `async` permite usar `await` dentro da função
- `await api.get(...)` pausa até a resposta HTTP chegar
- Se o backend retornar erro, o interceptor do Axios formata e rejeita
- O `.catch()` no `course.tsx` ignora silenciosamente (usa dados locais como fallback)

---

## 9. Trecho explicado linha por linha

```javascript
const lessonsWithStatus = lessons.map((lesson, index) => {
  let status = "locked";                                    // 1. Começa como bloqueada
  if (completedLessonIds.has(lesson.lessonId)) {            // 2. Se está no histórico do usuário
    status = "completed";                                   // 3. Marca como concluída
  } else if (index === 0) {                                 // 4. Se é a primeira do módulo
    status = "available";                                   // 5. Sempre disponível
  } else {                                                  // 6. Para as demais
    const prevLesson = lessons[index - 1];                  // 7. Pega a lição anterior
    if (completedLessonIds.has(prevLesson.lessonId)) {      // 8. Se a anterior foi completada
      status = "available";                                 // 9. Esta fica disponível
    }
  }
  return { ...lesson, status };                             // 10. Retorna com status calculado
});
```

Essa lógica implementa o desbloqueio progressivo — cada lição só libera após a anterior ser concluída.

---

## 10. Análise crítica

**Melhoria técnica:** usar React Query (`useQuery`) para cache das chamadas ao backend — evitaria refetch desnecessário ao navegar entre telas e daria loading/error states automáticos.

**Melhoria UX:** adicionar animação de "confetti" ao completar um módulo inteiro, usando `react-native-reanimated` que já está instalado no projeto.

**Funcionalidade futura:** modo offline — salvar exercícios no AsyncStorage para o usuário poder estudar sem internet, sincronizando o progresso quando reconectar.


---
---

# Perguntas e Respostas — Exemplo 3 (Tela de Exercícios)

---

## 1. Estrutura geral do projeto

Os exercícios ficam em `data/mockExercises.ts` com 150 perguntas reais (3 por lição). Os tipos são definidos em `types/exercise.ts`: múltipla escolha e verdadeiro/falso. O componente `ExerciseCard.tsx` renderiza a pergunta e opções. A tela `question.tsx` controla o fluxo (índice atual, feedback, resultado final). O backend valida e persiste o resultado.

---

## 2. Tela de Exercícios (Question)

**Objetivo:** apresentar exercícios ao usuário e calcular se passou (≥70% de acerto).

**Arquivos envolvidos:** `question.tsx`, `mockExercises.ts`, `lessonService.ts`, `gamificationStore.tsx`

**Componentes usados:** ExerciseCard, Button, XPResultScreen, AchievementUnlockedModal, Header

**Fluxo:** CourseScreen → clica na lição → `question.tsx` carrega exercícios pelo `lessonId` → exibe um por vez → usuário seleciona resposta → confirma → feedback (verde/vermelho) → próximo → ao finalizar → calcula acerto → envia ao backend → mostra resultado

---

## 3. Navegação

**Origem:** `question.tsx`
**Destino:** `course.tsx`
**Código:** `router.replace({ pathname: "/(app)/course", params: { courseId } })`

Após finalizar a lição, o `replace` volta para a trilha do curso sem empilhar. O `courseId` é passado como parâmetro para a trilha saber qual curso exibir. O `useLocalSearchParams()` recupera os params na tela de destino.

---

## 4. Componente reutilizável: ExerciseCard

**Responsabilidade:** renderizar a pergunta e as opções de resposta com feedback visual.

**Props:** `exercise` (dados da pergunta), `selectedAnswerId`, `onSelectAnswer`, `feedback`, `disabled`

**Onde é usado:** `question.tsx` para cada exercício da lição

**Benefícios:** suporta dois tipos (múltipla escolha e V/F) com a mesma interface, feedback colorido (verde=certo, vermelho=errado), explicação após responder, bloqueia seleção após confirmar.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useRef`
**Arquivo:** `question.tsx`
**Estado:** `answersRef` — guarda as respostas de cada exercício

**Por que useRef:** diferente do `useState`, o ref não causa re-render ao ser atualizado. Como as respostas são acumuladas durante a lição e só usadas no final, o ref é mais eficiente. O `useState` é usado para `exerciseIndex`, `feedback` e `results` que precisam atualizar a UI.

---

## 6. Chamada ao backend

**Arquivo:** `lessonService.ts`
**Endpoint:** `POST /lessons/:id/complete`
**Dados enviados:** `{ answers: { exerciseId: answerId }, correctCount, totalCount }`
**Resposta:** `{ passed, correctCount, wrongCount, xpEarned, newXP, newLevel, newStreak, nextLessonId }`

O frontend envia `correctCount` e `totalCount` porque a validação real acontece localmente (os exercícios do mock têm as respostas corretas). O backend confia nesses valores para calcular XP.

---

## 7. Fluxo completo de feedback

Usuário seleciona opção → `setSelectedAnswerId("b")` → clica "Confirmar" → `handleConfirm()` compara com `exercise.correctAnswerId` → `setFeedback({ submitted: true, isCorrect })` → ExerciseCard muda cor da opção (verde/vermelho) → mostra explicação → botão muda para "Próximo" → clica → avança `exerciseIndex` → limpa feedback → repete até o último exercício.

---

## 8. Função assíncrona

**Função:** `completeLesson()` em `lessonService.ts`

```typescript
export async function completeLesson(lessonId: string, data: CompleteLessonRequest) {
  const response = await api.post(`/lessons/${lessonId}/complete`, data);
  return response.data.data;
}
```

- Chamada de forma "fire and forget" no `question.tsx` (`.then().catch()`)
- Não bloqueia a UI — o resultado local é mostrado imediatamente
- Se falhar, o progresso local ainda funciona (o backend sincroniza depois)

---

## 9. Trecho explicado linha por linha

```javascript
const finalCorrect = finalResults.filter((r) => r === true).length;  // 1. Conta acertos
const accuracyPercent = Math.round((finalCorrect / total) * 100);    // 2. Calcula percentual
const passed = finalCorrect >= Math.ceil(total * 0.7);               // 3. Verifica se atingiu 70%

if (passed) {                                                         // 4. Se passou
  breakdown = completeLesson({                                        // 5. Calcula XP ganho
    correctAnswers: finalCorrect,
    totalQuestions: total,
    streakDays: state.streak,
  });
  progressComplete(courseId, lessonId);                                // 6. Desbloqueia próxima lição
}
```

Essa lógica decide se o usuário avança na trilha. Com 70% mínimo, em 3 exercícios precisa acertar pelo menos 3 (ceil de 2.1 = 3).

---

## 10. Análise crítica

**Melhoria técnica:** buscar exercícios do backend (`GET /lessons/:id`) em vez do mock local — permitiria atualizar conteúdo sem rebuild do app.

**Melhoria UX:** adicionar timer por exercício com barra de progresso visual, incentivando respostas rápidas e adicionando XP bônus por velocidade.

**Funcionalidade futura:** exercícios de "completar código" — tipo drag-and-drop onde o usuário monta trechos de código na ordem correta.


---
---

# Perguntas e Respostas — Exemplo 4 (Tela de Progresso e Conquistas)

---

## 1. Estrutura geral do projeto

As conquistas são gerenciadas pelo `achievementStore.ts` (Zustand) no frontend e persistidas no backend em registros `ACHIEVEMENT#<id>`. São 5 conquistas: primeira lição, semana perfeita, nota máxima, módulo completo, curso completo. O desbloqueio é automático ao cumprir a condição. O resgate de recompensa adiciona XP ao perfil.

---

## 2. Tela de Progresso

**Objetivo:** exibir XP, nível, streak e conquistas do usuário.

**Arquivos envolvidos:** `progress.tsx`, `progressService.ts`, `achievementStore.ts`, `gamificationStore.tsx`

**Componentes usados:** XPBar, AchievementBadge, AchievementUnlockedModal, BottomNavBar

**Fluxo:** usuário navega para Progresso → tela busca `GET /gamification` → exibe XP/streak/nível → lista conquistas desbloqueadas (com botão resgatar) e bloqueadas (em cinza) → pull-to-refresh atualiza dados

---

## 3. Navegação

**Origem:** `home.tsx` (BottomNavBar)
**Destino:** `progress.tsx`
**Código:** `router.push("/(app)/progress")`

O `push` é usado aqui (não `replace`) porque o usuário pode querer voltar para a Home. A BottomNavBar usa `router.replace` entre as abas para não empilhar múltiplas instâncias da mesma tela.

---

## 4. Componente reutilizável: AchievementBadge

**Responsabilidade:** exibir uma conquista com ícone, nome, descrição e estado.

**Props:** `achievement` (dados), `onClaimReward` (callback)

**Onde é usado:** `progress.tsx` na lista de conquistas

**Benefícios:** visual diferente para desbloqueada vs bloqueada, botão de resgatar só aparece se desbloqueada e não resgatada, mostra data de desbloqueio, ícone emoji grande para destaque.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useCallback`
**Arquivo:** `progress.tsx`
**O que faz:** memoriza a função `handleRefresh` para evitar recriação a cada render

**Por que useCallback:** o `RefreshControl` recebe `onRefresh` como prop. Sem `useCallback`, uma nova referência de função seria criada a cada render, causando re-render desnecessário do `ScrollView`. Com `useCallback`, a referência é estável.

---

## 6. Chamada ao backend

**Arquivo:** `progressService.ts`
**Endpoint:** `POST /gamification/achievements/:id/claim`
**Dados enviados:** nenhum (apenas token no header)
**Resposta:** `{ message: "Recompensa resgatada: +250 XP", xpEarned: 250 }`

**Lógica do backend:** verifica se a conquista existe, se está desbloqueada e se ainda não foi resgatada. Marca como `rewardClaimed: true` e adiciona o XP ao perfil do usuário.

---

## 7. Fluxo completo de conquista

Usuário completa lição com 100% → `question.tsx` chama `achievementStore.unlock("perfect-score")` → store marca como desbloqueada + chama `POST /achievements/perfect-score/unlock` no backend → modal `AchievementUnlockedModal` aparece → usuário vai para Progresso → vê conquista desbloqueada → clica "Resgatar" → `handleClaimReward()` → `claimReward()` no store + `POST /achievements/perfect-score/claim` no backend → XP adicionado.

---

## 8. Função assíncrona

**Função:** `handleRefresh()` em `progress.tsx`

```typescript
const handleRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    const data = await progressService.getGamification();
    useAchievementStore.getState().hydrateFromApi(data.achievements);
    useUserStore.getState().hydrateFromGamification(data);
  } catch (err) { /* fallback local */ }
  finally { setRefreshing(false); }
}, []);
```

- `setRefreshing(true)` mostra o spinner de pull-to-refresh
- `await getGamification()` busca dados atualizados do backend
- `hydrateFromApi()` substitui as conquistas locais pelas do backend
- `finally` garante que o spinner para mesmo se der erro

---

## 9. Trecho explicado linha por linha

```javascript
function handleClaimReward(id: string) {
  const xpGained = claimReward(id);              // 1. Marca como resgatada no store local e retorna XP

  if (xpGained > 0) {                            // 2. Se tinha XP para resgatar
    addXP(xpGained);                             // 3. Adiciona ao gamificationStore (atualiza barra)
  }

  progressService.claimAchievementReward(id)     // 4. Persiste no backend
    .catch((err) => {                            // 5. Se falhar, log silencioso
      console.warn("Erro:", err?.message);
    });
}
```

A UI atualiza imediatamente (otimistic update) e o backend é notificado em paralelo. Se o backend falhar, o usuário não percebe — na próxima sincronização os dados são corrigidos.

---

## 10. Análise crítica

**Melhoria técnica:** implementar "optimistic rollback" — se o `POST /claim` falhar, reverter o `claimReward()` local e mostrar toast de erro.

**Melhoria UX:** adicionar animação de partículas/confetti ao resgatar uma recompensa, usando Lottie ou Reanimated.

**Funcionalidade futura:** conquistas com níveis (bronze/prata/ouro) — ex: "Nota Máxima" bronze (1x), prata (5x), ouro (20x), com recompensas crescentes.


---
---

# Perguntas e Respostas — Exemplo 5 (Tela de Configurações)

---

## 1. Estrutura geral do projeto

O perfil do usuário é gerenciado pelo `userStore.ts` (Zustand) e persistido no backend em `USER#<id> | PROFILE`. Alterações de nome e avatar são salvas via `PUT /auth/profile`. O `expo-image-picker` permite trocar a foto. Na web, usa `localStorage` para tokens; no mobile, `expo-secure-store`.

---

## 2. Tela de Configurações

**Objetivo:** permitir edição de perfil, visualizar nível/XP e fazer logout.

**Arquivos envolvidos:** `settings.tsx`, `authService.ts`, `userStore.ts`, `gamificationStore.tsx`

**Componentes usados:** Avatar, StreakCalendar, FadeSlideIn, BottomNavBar, ScreenLoader

**Fluxo:** usuário navega para Settings → vê foto, nome, nível, XP, streak → pode trocar foto (ImagePicker) → pode editar nome (TextInput inline) → pode fazer logout (limpa tokens + redireciona)

---

## 3. Navegação

**Origem:** `settings.tsx`
**Destino:** `login.tsx` (após logout)
**Código:** `router.replace("/(auth)/login")`

O logout usa `replace` para impedir que o usuário volte para telas protegidas com o botão back. Antes de navegar, `authService.logout()` limpa os tokens e `useUserStore.getState().reset()` zera o estado local.

---

## 4. Componente reutilizável: Avatar

**Responsabilidade:** exibir foto do usuário ou iniciais do nome como fallback.

**Props:** `uri` (URL da foto), `name` (para gerar iniciais), `size` (sm/md/lg), `showBorder`

**Onde é usado:** `settings.tsx`, `Header.tsx`

**Benefícios:** fallback automático com iniciais coloridas quando não há foto, borda opcional para destaque, tamanhos padronizados, acessível.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useState` para modo de edição
**Arquivo:** `settings.tsx`
**Estados:** `editingName` (boolean), `nameInput` (string)

**Fluxo:** clica no ícone de lápis → `setEditingName(true)` → TextInput aparece com valor atual → usuário digita → clica "Salvar" → `handleSaveName()` valida → chama backend → atualiza store → `setEditingName(false)` → volta para modo visualização.

---

## 6. Chamada ao backend

**Arquivo:** `authService.ts`
**Endpoint:** `PUT /auth/profile`
**Dados enviados:** `{ name?: string, avatarUrl?: string }`
**Resposta:** `{ userId, name, email, avatarUrl, xp, level, streak }`

**Lógica do backend:** valida que pelo menos um campo foi enviado, atualiza no banco, retorna o perfil completo atualizado. Em produção, também sincroniza o nome no Cognito.

---

## 7. Fluxo completo de troca de foto

Clica "Trocar foto" → `handlePickImage()` → verifica plataforma (web não pede permissão) → `ImagePicker.launchImageLibraryAsync()` abre galeria → usuário seleciona e recorta (1:1) → retorna URI local → `setAvatarUri(uri)` atualiza UI imediatamente → `authService.updateProfile({ avatarUrl: uri })` salva no backend → próximo login carrega a foto do backend.

---

## 8. Função assíncrona

**Função:** `handleLogout()` em `settings.tsx`

```typescript
async function handleLogout() {
  try {
    await authService.logout();    // Remove tokens do storage
  } catch { }                      // Ignora se não existiam
  useUserStore.getState().reset(); // Zera estado local
  router.replace("/(auth)/login"); // Redireciona
}
```

- `await logout()` garante que os tokens são removidos antes de navegar
- `reset()` limpa username, XP, streak do store (evita dados residuais)
- `replace` impede voltar para telas protegidas

---

## 9. Trecho explicado linha por linha

```javascript
async function handlePickImage() {
  if (Platform.OS !== "web") {                              // 1. Só pede permissão no mobile
    const permission = await ImagePicker.request...();      // 2. Solicita acesso à galeria
    if (!permission.granted) { Alert.alert(...); return; }  // 3. Se negou, mostra alerta e para
  }
  const result = await ImagePicker.launchImageLibrary...(); // 4. Abre o seletor de imagem
  if (!result.canceled && result.assets[0]) {               // 5. Se selecionou uma imagem
    const uri = result.assets[0].uri;                       // 6. Pega a URI local do arquivo
    setAvatarUri(uri);                                      // 7. Atualiza UI imediatamente
    authService.updateProfile({ avatarUrl: uri });          // 8. Salva no backend (async)
  }
}
```

A verificação de plataforma é necessária porque `expo-secure-store` e permissões de galeria não existem na web.

---

## 10. Análise crítica

**Melhoria técnica:** fazer upload real da imagem para S3/Cloudinary e salvar a URL pública no backend — atualmente salva a URI local que só funciona no mesmo dispositivo.

**Melhoria UX:** adicionar confirmação antes do logout com um modal customizado ("Tem certeza que deseja sair?") em vez de sair direto.

**Funcionalidade futura:** tela de "Conta" com opções de deletar conta, alterar senha e exportar dados (LGPD compliance).


---
---

# Perguntas e Respostas — Exemplo 6 (Cadastro de Usuário)

---

## 1. Estrutura geral do projeto

O cadastro cria o usuário no backend com senha hash (bcrypt) e inicializa 5 conquistas bloqueadas. O fluxo é: frontend valida campos → `POST /auth/register` → backend cria perfil no banco + conquistas → redireciona para login. Em produção, o Cognito gerencia a senha e envia email de confirmação.

---

## 2. Tela de Cadastro

**Objetivo:** criar uma nova conta de usuário.

**Arquivos envolvidos:** `register.tsx`, `authService.ts`, `routes/auth.ts` (backend)

**Componentes usados:** Input, Button, FadeSlideIn, ScreenLoader

**Fluxo:** login → clica "Cadastre-se" → `register.tsx` → preenche nome/email/senha/confirmação → `handleRegister()` valida → chama `authService.register()` → backend cria conta → redireciona para login

---

## 3. Navegação

**Origem:** `register.tsx`
**Destino:** `login.tsx`
**Código:** `router.replace("/(auth)/login")`

Após cadastro bem-sucedido, usa `replace` para ir ao login. O usuário precisa fazer login para obter os tokens. Não usa `push` porque não faz sentido "voltar" para o cadastro após criar a conta.

---

## 4. Componente reutilizável: Input

**Responsabilidade:** campo de texto padronizado com suporte a senha e erro.

**Props:** `mode` ("text" | "password"), `placeholder`, `value`, `onChangeText`, `error`, `keyboardType`

**Onde é usado:** login, cadastro, modal de esqueci senha, edição de nome

**Benefícios:** toggle de visibilidade da senha (ícone de olho), mensagem de erro vermelha abaixo do campo, estilo consistente, acessibilidade com labels.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useState` para validação
**Arquivo:** `register.tsx`
**Estados:** `name`, `email`, `password`, `confirmPassword`, `nameError`, `emailError`, `passwordError`, `confirmPasswordError`, `registerError`, `loading`

**Validação:** `validate()` verifica todos os campos antes de enviar. Cada campo tem seu estado de erro independente. A UI mostra mensagens específicas ("Email inválido", "Senhas não coincidem", etc.).

---

## 6. Chamada ao backend

**Arquivo:** `authService.ts`
**Endpoint:** `POST /auth/register`
**Dados enviados:** `{ name, email, password }`
**Resposta sucesso:** `{ success: true, data: { message: "Cadastro realizado com sucesso!" } }`
**Resposta erro:** `{ success: false, message: "Este email já está cadastrado." }`

**Lógica do backend:** valida campos, verifica email duplicado, faz hash da senha com bcrypt (10 rounds), gera UUID, cria perfil + 5 conquistas iniciais.

---

## 7. Fluxo completo de criação de conta

Usuário preenche formulário → `validate()` verifica localmente → `authService.register()` envia ao backend → backend verifica email duplicado → hash da senha → `putItem(USER#uuid, PROFILE)` → cria 5 conquistas (`ACHIEVEMENT#first-lesson`, etc.) → retorna 201 → frontend redireciona para login → usuário faz login com as credenciais criadas.

---

## 8. Função assíncrona

**Função:** `register()` em `authService.ts`

```typescript
export async function register(data: RegisterRequest): Promise<void> {
  await api.post("/auth/register", data);
}
```

- Simples: apenas faz o POST e espera
- Não retorna dados (void) — o cadastro não faz login automático
- Se o email já existe, o interceptor captura o 400 e rejeita com a mensagem
- O `catch` no `register.tsx` exibe via `setRegisterError()`

---

## 9. Trecho explicado linha por linha

```javascript
// Backend: routes/auth.ts
const hashedPassword = await bcrypt.hash(password, 10);  // 1. Hash da senha com salt de 10 rounds
const userId = db.generateId();                          // 2. Gera UUID v4 único

db.putItem({                                             // 3. Salva no banco
  PK: `USER#${userId}`, SK: "PROFILE",                  // 4. Chave primária (Single Table Design)
  userId, name, email, password: hashedPassword,         // 5. Dados do perfil
  xp: 0, level: 1, streak: 0,                           // 6. Valores iniciais de gamificação
  createdAt: now,                                        // 7. Timestamp de criação
});

seedUserAchievements(userId);                            // 8. Cria 5 conquistas bloqueadas
```

O bcrypt garante que mesmo se o banco for exposto, as senhas não podem ser lidas. O salt de 10 rounds é o padrão recomendado.

---

## 10. Análise crítica

**Melhoria técnica:** adicionar validação de força de senha (mínimo 1 maiúscula, 1 número, 1 especial) com indicador visual de força.

**Melhoria UX:** login automático após cadastro — em vez de redirecionar para login, já autenticar e ir direto para a Home.

**Funcionalidade futura:** cadastro com Google/Apple (OAuth) via Cognito Identity Providers — botões "Continuar com Google" na tela de registro.


---
---

# Perguntas e Respostas — Exemplo 7 (Gamificação e XP)

---

## 1. Estrutura geral do projeto

A gamificação usa Context API + useReducer (`gamificationStore.tsx`) para XP/nível/streak. Os thresholds de nível estão em `types/gamification.ts`. O cálculo de XP é: base proporcional ao acerto + bônus de streak a cada 7 dias. O backend persiste tudo em `USER#<id> | PROFILE` e o frontend sincroniza ao abrir a Home.

---

## 2. Sistema de XP e Níveis

**Objetivo:** motivar o usuário com progressão numérica visível.

**Arquivos envolvidos:** `gamificationStore.tsx`, `types/gamification.ts`, `XPBar.tsx`, `userStore.ts`

**Componentes usados:** XPBar (barra de progresso), XPResultScreen (resultado da lição)

**Regras:** N1 (0–1000 XP), N2 (1001–2500), N3 (2501–5000), N4 (5001–10000), N5 (10001+). XP base = 10 por lição. Bônus +5 se acerto > 90%. Bônus +500 a cada 7 dias de streak.

---

## 3. Navegação

**Contexto:** a gamificação não tem tela própria — está presente em todas as telas.

O `GamificationProvider` envolve toda a app no `_layout.tsx` raiz. Qualquer tela acessa via `useGamification()`. O XPBar aparece na Home, Course e Progress. O Header mostra nível e streak em todas as telas do grupo `(app)`.

---

## 4. Componente reutilizável: XPBar

**Responsabilidade:** exibir barra de progresso de XP com nível atual.

**Props:** `xp` (XP total), `level` (nível atual)

**Onde é usado:** `home.tsx`, `course.tsx`, `progress.tsx`, `settings.tsx`

**Benefícios:** calcula automaticamente o progresso dentro do nível atual, cor verde com glow, texto "XP / próximo nível" centralizado, responsivo.

---

## 5. Gerenciamento de estado com Hooks

**Hook:** `useReducer`
**Arquivo:** `gamificationStore.tsx`
**Estado:** `{ xp, level, streak, lastStudyDate, studiedDays }`

**Por que useReducer:** o estado de gamificação tem múltiplas ações complexas (ADD_XP, COMPLETE_LESSON, HYDRATE, RESET) que modificam vários campos simultaneamente. O reducer centraliza a lógica de transição de estado, tornando mais previsível que múltiplos `setState`.

---

## 6. Chamada ao backend

**Arquivo:** `progressService.ts`
**Endpoint:** `GET /gamification`
**Resposta:** `{ xp, level, streak, lastStudyDate, achievements: [...] }`

**Quando é chamado:** ao montar a Home (`useEffect` no `home.tsx`). Hidrata o `gamificationStore` com `dispatch({ type: "HYDRATE", payload: data })` e o `userStore` com `hydrateFromGamification(data)`.

---

## 7. Fluxo completo de ganho de XP

Lição concluída → `completeLesson({ correctAnswers, totalQuestions, streakDays })` → `calculateXPGain()` retorna breakdown (base + streakBonus) → `dispatch(COMPLETE_LESSON)` atualiza state → `syncUserStore()` espelha no userStore → `POST /lessons/:id/complete` persiste no backend → backend calcula `newXP = user.xp + xpEarned` → atualiza nível se ultrapassou threshold.

---

## 8. Função assíncrona

**Função:** `calculateXPGain()` em `gamificationStore.tsx` (síncrona, mas parte do fluxo async)

```typescript
export function calculateXPGain(result: LessonResult): XPBreakdown {
  const base = Math.round((result.correctAnswers / result.totalQuestions) * 1000);
  const streakBonus = result.streakDays % 7 === 0 ? 500 : 0;
  return { base, streakBonus, total: base + streakBonus, accuracyPercent };
}
```

- XP é proporcional ao acerto (3/3 = 1000 XP, 2/3 = 667 XP)
- Bônus de 500 XP a cada 7 dias consecutivos de streak
- Retorna breakdown para exibir na tela de resultado

---

## 9. Trecho explicado linha por linha

```javascript
export function calculateLevel(xp: number): number {
  for (const [lvl, range] of Object.entries(LEVEL_THRESHOLDS)) {  // 1. Itera pelos níveis
    if (xp >= range.min && xp <= range.max) return Number(lvl);   // 2. Se XP está no range, retorna nível
  }
  return 5;                                                        // 3. Se passou de todos, é nível máximo
}

// LEVEL_THRESHOLDS:
// 1: { min: 0, max: 1000 }
// 2: { min: 1001, max: 2500 }
// 3: { min: 2501, max: 5000 }
// 4: { min: 5001, max: 10000 }
// 5: { min: 10001, max: Infinity }
```

Função pura (sem side effects) — dado um XP, sempre retorna o mesmo nível. Usada tanto no frontend quanto no backend.

---

## 10. Análise crítica

**Melhoria técnica:** persistir o `gamificationStore` localmente com `zustand/middleware/persist` para não depender do backend ao abrir o app (cache local + sync em background).

**Melhoria UX:** animação de "level up" com modal especial quando o usuário sobe de nível, mostrando o novo nível com efeitos visuais.

**Funcionalidade futura:** XP decay — se o usuário ficar 3+ dias sem estudar, perde 10% do XP do nível atual (incentiva consistência).


---
---

# Perguntas e Respostas — Exemplo 8 (Backend e Persistência)

---

## 1. Estrutura geral do projeto

O backend local usa Express (`server.ts`) com banco em memória persistido em JSON (`database.ts`). O modelo é Single Table Design: uma única "tabela" com PK+SK diferenciando entidades (USER#, COURSE#, MODULE#, LESSON#, EXERCISE#). O `auth-middleware.ts` valida JWT em rotas protegidas. O `seed-local.ts` popula cursos ao iniciar.

---

## 2. Servidor Express (server.ts)

**Objetivo:** emular o API Gateway + Lambda da AWS localmente.

**Arquivos envolvidos:** `server.ts`, `routes/*.ts`, `database.ts`, `auth-middleware.ts`, `seed-local.ts`

**O que configura:** CORS, JSON parsing, rotas de API, rotas de debug, seed automático

**Fluxo de inicialização:** `dotenv.config()` → `loadFromDisk()` (carrega db.json) → `seedLocalDatabase()` (recria cursos preservando usuários) → `app.listen(3001)`

---

## 3. Navegação (rotas HTTP)

**Rotas públicas:** `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`
**Rotas protegidas:** todas as demais (exigem `Authorization: Bearer <token>`)
**Rotas de debug:** `GET /dev/users`, `GET /dev/db`, `POST /dev/sync-user`

O middleware `authMiddleware` intercepta rotas protegidas, decodifica o JWT e injeta `req.userId` no request.

---

## 4. Componente reutilizável: database.ts (módulo de banco)

**Responsabilidade:** CRUD de dados com persistência em arquivo JSON.

**Funções exportadas:** `putItem`, `getItem`, `queryItems`, `queryBySK`, `queryByField`, `updateItem`, `deleteItem`

**Onde é usado:** todas as rotas do backend

**Benefícios:** simula DynamoDB sem precisar da AWS, persiste entre reinícios, performance com autoSave controlável, API simples e familiar.

---

## 5. Gerenciamento de estado (banco de dados)

**Estrutura:** `Map<string, DBItem>` indexado por `PK#SK`
**Persistência:** `saveToDisk()` serializa o Map inteiro para JSON
**Carregamento:** `loadFromDisk()` ao iniciar o servidor

**Single Table Design:** todas as entidades na mesma "tabela", diferenciadas por prefixo:
- `USER#abc | PROFILE` → perfil
- `USER#abc | ACHIEVEMENT#first-lesson` → conquista
- `COURSE#expo | METADATA` → curso
- `MODULE#mod-1 | LESSON#lesson-1` → lição

---

## 6. Chamada ao backend (rota de login)

**Arquivo:** `routes/auth.ts`
**Endpoint:** `POST /auth/login`
**Validação:** busca usuário por email → compara senha com bcrypt → gera tokens JWT
**Resposta:** `{ user: { userId, name, email, xp, level, streak }, tokens: { accessToken, idToken, refreshToken } }`

O token é assinado com `JWT_SECRET` do `.env` e expira em 7 dias.

---

## 7. Fluxo completo de persistência

Usuário completa lição → `POST /lessons/:id/complete` → backend calcula XP → `updateItem(USER#id, PROFILE, { xp, level, streak })` → `putItem(USER#id, HISTORY#timestamp)` → `saveToDisk()` grava em `db.json` → servidor reinicia → `loadFromDisk()` carrega tudo → usuário faz login → dados intactos.

---

## 8. Função assíncrona

**Função:** `authRouter.post("/login")` em `routes/auth.ts`

```typescript
authRouter.post("/login", async (req, res) => {
  const users = db.queryByField("email", email);     // Busca por email
  const passwordMatch = await bcrypt.compare(password, user.password); // Compara hash
  const tokens = generateTokens(user.userId, user.email, user.name);   // Gera JWT
  return res.json({ success: true, data: { user, tokens } });
});
```

- `async` porque `bcrypt.compare` é assíncrono
- `queryByField` busca no Map por campo (simula GSI2 do DynamoDB)
- `generateTokens` usa `jsonwebtoken` para assinar o payload

---

## 9. Trecho explicado linha por linha

```javascript
function saveToDisk(): void {
  if (!autoSaveEnabled) return;                          // 1. Não salva durante o seed (performance)
  try {
    if (!fs.existsSync(DATA_DIR)) {                      // 2. Cria pasta data/ se não existe
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const items = Array.from(store.values());             // 3. Converte Map para array
    fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2)); // 4. Grava JSON formatado
  } catch (err) {
    console.error("Erro ao salvar:", err);                // 5. Log de erro (não quebra o servidor)
  }
}
```

O `autoSaveEnabled` evita 200+ escritas no disco durante o seed. O `null, 2` formata o JSON com indentação (legível para debug).

---

## 10. Análise crítica

**Melhoria técnica:** trocar o banco JSON por SQLite (`better-sqlite3`) — suporta queries mais complexas, transações ACID e melhor performance com muitos dados.

**Melhoria UX:** adicionar endpoint `GET /dev/reset` que limpa todos os dados (útil para testes rápidos sem deletar arquivo manualmente).

**Funcionalidade futura:** migrar para DynamoDB real usando o Serverless Framework — o `serverless.yml` já está pronto, basta configurar credenciais AWS e rodar `npm run deploy`.