# 📖 Documentação Completa — Projeto Dualingo

Plataforma mobile de aprendizado gamificado que ensina **Expo (React Native)** e **AWS** por meio de trilhas progressivas, exercícios interativos e gamificação.

---

## 🏗️ Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Expo)                        │
│  React Native + TypeScript + Zustand + Axios             │
│  Porta: 8081 (Metro Bundler)                             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (JSON + JWT)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 BACKEND (Express Local)                   │
│  Node.js + TypeScript + JWT + Banco JSON                 │
│  Porta: 3001                                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (db.json)                     │
│  Single Table Design (simula DynamoDB)                   │
│  Arquivo: backend/data/db.json                           │
└─────────────────────────────────────────────────────────┘
```

Em produção, o backend é substituído por:
```
Expo App → API Gateway → Lambda Functions → DynamoDB / Cognito
```

---

## 📁 Estrutura de Pastas Completa

```
dualingo/
├── app/                          ← Telas (Expo Router - navegação por arquivos)
│   ├── _layout.tsx               ← Layout raiz (providers globais)
│   ├── index.tsx                 ← Redirect para login
│   ├── +html.tsx                 ← Template HTML para web
│   ├── (auth)/                   ← Grupo de autenticação
│   │   ├── _layout.tsx           ← Layout do grupo auth
│   │   ├── login.tsx             ← Tela de login
│   │   └── register.tsx          ← Tela de cadastro
│   └── (app)/                    ← Grupo principal (protegido)
│       ├── _layout.tsx           ← Layout do grupo app
│       ├── home.tsx              ← Tela inicial (cursos)
│       ├── course.tsx            ← Trilha de lições do curso
│       ├── question.tsx          ← Tela de exercícios
│       ├── progress.tsx          ← Progresso e conquistas
│       └── settings.tsx          ← Configurações e perfil
├── components/                   ← Componentes reutilizáveis
│   ├── ui/                       ← Design system (Button, Input, etc.)
│   ├── exercise/                 ← Componentes de exercício
│   └── admin/                    ← Painel administrativo
├── store/                        ← Estado global (Zustand + Context)
├── services/                     ← Camada de comunicação com a API
├── types/                        ← Interfaces TypeScript
├── constants/                    ← Cores, assets, configurações
├── data/                         ← Dados mock (exercícios e cursos)
├── hooks/                        ← Hooks customizados
├── utils/                        ← Funções utilitárias
├── assets/                       ← Imagens e ícones
├── backend/                      ← Servidor backend
│   ├── src/local/                ← Servidor Express (desenvolvimento)
│   ├── src/functions/            ← Lambda handlers (produção AWS)
│   ├── src/lib/                  ← Utilitários compartilhados
│   ├── src/types/                ← Tipos do backend
│   ├── src/seed/                 ← Script de seed para DynamoDB real
│   ├── data/                     ← Banco JSON local (persistência)
│   └── serverless.yml            ← Configuração de deploy AWS
├── .env                          ← Variáveis de ambiente do frontend
├── app.json                      ← Configuração do Expo
├── package.json                  ← Dependências do frontend
└── tsconfig.json                 ← Configuração TypeScript
```

---

## 🖥️ FRONTEND — Detalhamento

### app/_layout.tsx
**O que faz:** Layout raiz que envolve toda a aplicação.
- Configura o `SafeAreaProvider` (áreas seguras em dispositivos com notch)
- Configura o `GamificationProvider` (Context API para XP/streak/nível)
- Define a navegação Stack sem headers

### app/index.tsx
**O que faz:** Ponto de entrada — redireciona para `/(auth)/login`.

### app/+html.tsx
**O que faz:** Template HTML customizado para quando o app roda na web.

---

### app/(auth)/login.tsx
**O que faz:** Tela de login do usuário.
- Valida email e senha localmente
- Chama `POST /auth/login` no backend
- Salva tokens JWT no storage (localStorage na web, SecureStore no mobile)
- Hidrata o `userStore` com dados do usuário
- Busca dados de gamificação do backend após login
- Modal de "Esqueci a senha" integrado

### app/(auth)/register.tsx
**O que faz:** Tela de cadastro de novo usuário.
- Valida nome, email, senha e confirmação
- Chama `POST /auth/register` no backend
- Redireciona para login após sucesso

### app/(auth)/_layout.tsx
**O que faz:** Layout do grupo de autenticação (Stack simples).

---

### app/(app)/home.tsx
**O que faz:** Tela principal após login.
- Exibe os 2 cursos disponíveis (Expo e AWS) como cards
- Mostra barra de XP e nível do usuário
- Ao montar, busca `GET /gamification` do backend para sincronizar XP/streak
- Contém o `StreakDebugPanel` (painel de teste de streak)

### app/(app)/course.tsx
**O que faz:** Trilha visual de lições de um curso.
- Exibe módulos como acordeões expansíveis
- Cada módulo contém lições com status (locked/available/completed)
- Ao montar, busca o status real das lições do backend (`GET /courses/:id/modules/:moduleId`)
- Inicia o curso automaticamente no backend (`POST /courses/:id/start`)
- Scroll automático até a próxima lição disponível
- Barra de progresso do curso

### app/(app)/question.tsx
**O que faz:** Tela de exercícios de uma lição.
- Carrega exercícios do mock local (`mockExercises.ts`)
- Exibe um exercício por vez com feedback visual
- Ao finalizar, envia respostas ao backend (`POST /lessons/:id/complete`)
- Calcula XP localmente e sincroniza com o backend
- Desbloqueia conquistas automaticamente
- Tela de resultado com breakdown de XP

### app/(app)/progress.tsx
**O que faz:** Tela de progresso e conquistas.
- Exibe XP total, nível, streak
- Lista conquistas desbloqueadas e bloqueadas
- Botão de resgatar recompensa (chama `POST /gamification/achievements/:id/claim`)
- Pull-to-refresh busca dados atualizados do backend
- Modal de conquista desbloqueada

### app/(app)/settings.tsx
**O que faz:** Configurações do perfil do usuário.
- Trocar foto de perfil (ImagePicker + salva no backend)
- Editar nickname (salva no backend via `PUT /auth/profile`)
- Exibe nível, XP e barra de progresso
- Calendário de streak semanal
- Botão de logout (limpa tokens + reseta stores + redireciona)

---

## 🧩 COMPONENTES

### components/ui/Button.tsx
Botão reutilizável com variantes: primary, secondary, disabled. Suporta loading state.

### components/ui/Input.tsx
Campo de texto com suporte a modo texto e senha (toggle de visibilidade).

### components/ui/FadeSlideIn.tsx
Animação de entrada (fade + slide) para elementos da tela. Aceita delay para sequenciar.

### components/ui/ScreenLoader.tsx
Tela de loading que aparece enquanto a página carrega, com fade out suave.

### components/ui/Spinner.tsx
Indicador de carregamento circular animado.

### components/ExerciseCard.tsx
Card de exercício que renderiza múltipla escolha ou verdadeiro/falso. Mostra feedback após resposta.

### components/exercise/OptionRow.tsx
Linha de opção individual dentro do ExerciseCard. Muda de cor conforme seleção e feedback.

### components/LessonNode.tsx
Nó visual da trilha de lições. Elipses coloridas (verde=completa, azul=disponível, cinza=bloqueada) conectadas por linhas.

### components/CourseCard.tsx
Card de curso na home com imagem e título. Ao clicar, navega para a trilha.

### components/Header.tsx
Cabeçalho com avatar, nome, nível e streak do usuário.

### components/BottomNavBar.tsx
Barra de navegação inferior com 3 abas: Home, Progresso, Configurações.

### components/XPBar.tsx
Barra de experiência com nível atual e progresso até o próximo nível.

### components/XPResultScreen.tsx
Tela de resultado após completar uma lição. Mostra XP ganho com breakdown (base + bônus).

### components/AchievementBadge.tsx
Badge de conquista com ícone, nome, descrição e botão de resgatar recompensa.

### components/AchievementUnlockedModal.tsx
Modal animado que aparece quando uma nova conquista é desbloqueada.

### components/StreakBadge.tsx
Badge de streak com ícone de fogo e contador de dias.

### components/StreakCalendar.tsx
Calendário semanal que mostra quais dias o usuário estudou.

### components/StreakDebugPanel.tsx
Painel de debug para testar streak. Botões: +1 dia, pulou dia, +5 dias, reset. Sincroniza com o backend.

### components/Avatar.tsx
Componente de avatar que exibe foto do usuário ou iniciais do nome.

### components/LevelUpModal.tsx
Modal de level up com animação.

---

## 🗄️ STORES (Estado Global)

### store/userStore.ts
**Tecnologia:** Zustand
**O que armazena:** Dados do perfil do usuário.
- `userId`, `username`, `email`, `avatarUri`
- `level`, `streak`, `currentXP`, `nextLevelXP`
**Funções:**
- `hydrateFromUser(user)` — preenche com dados do login
- `hydrateFromGamification(data)` — atualiza XP/streak/nível
- `setUsername(name)` / `setAvatarUri(uri)` — edição de perfil
- `reset()` — limpa tudo no logout

### store/gamificationStore.tsx
**Tecnologia:** Context API + useReducer
**O que armazena:** Estado de gamificação (XP, nível, streak, dias estudados).
**Actions:**
- `ADD_XP` — adiciona XP
- `COMPLETE_LESSON` — calcula XP ganho na lição
- `SET_STREAK` — define streak manualmente
- `ADVANCE_STREAK_DEBUG` — simula dias de streak
- `HYDRATE` — carrega dados do backend
- `RESET` — volta ao estado inicial
**Funções exportadas:**
- `completeLesson(result)` — processa conclusão de lição
- `addXP(amount)` — adiciona XP avulso
- `hydrate(data)` — sincroniza com backend
- `calculateLevel(xp)` — calcula nível baseado no XP
- `calculateXPGain(result)` — calcula XP de uma lição

### store/progressStore.ts
**Tecnologia:** Zustand
**O que armazena:** Status de desbloqueio das lições por curso.
- `overrides` — mapa de lessonId → status (sobrescreve o mock)
- `completedModules` / `completedCourses` — conquistas locais
**Funções:**
- `completeLesson(courseId, lessonId)` — marca como concluída e desbloqueia a próxima
- `getStatusMap(courseId)` — retorna mapa completo de status

### store/achievementStore.ts
**Tecnologia:** Zustand
**O que armazena:** Lista de conquistas com status de desbloqueio.
**Funções:**
- `unlock(achievementId)` — desbloqueia e notifica o backend
- `claimReward(achievementId)` — resgata XP da recompensa
- `checkStreakAchievements(streak)` — verifica conquistas de streak
- `hydrateFromApi(achievements)` — carrega do backend

---

## 🌐 SERVICES (Comunicação com API)

### services/api.ts
**O que faz:** Instância Axios configurada com:
- Base URL do backend (via `EXPO_PUBLIC_API_URL`)
- Interceptor de requisição: injeta token JWT automaticamente
- Interceptor de resposta: trata erros 401 (limpa tokens)
- Storage adaptável: `localStorage` na web, `expo-secure-store` no mobile
**Exporta:** `api`, `TOKEN_KEYS`, `getStorageItem`, `setStorageItem`, `deleteStorageItem`

### services/authService.ts
**O que faz:** Funções de autenticação.
- `login(data)` — autentica e salva tokens
- `register(data)` — cria conta
- `forgotPassword(email)` — recuperação de senha
- `updateProfile(data)` — atualiza nome/avatar
- `logout()` — remove tokens
- `isAuthenticated()` — verifica se tem token

### services/courseService.ts
**O que faz:** Funções de cursos e trilhas.
- `getCourses()` — lista cursos
- `getCourse(id)` — detalhes + módulos
- `getModule(courseId, moduleId)` — módulo + lições com status
- `startCourse(courseId)` — inicia curso

### services/lessonService.ts
**O que faz:** Funções de lições.
- `getLesson(id)` — lição + exercícios (sem resposta correta)
- `completeLesson(id, data)` — envia respostas + correctCount/totalCount
- `repeatLesson(id)` — marca para repetição

### services/progressService.ts
**O que faz:** Funções de progresso e gamificação.
- `getProgress()` — progresso em todos os cursos
- `getCourseProgress(courseId)` — progresso em um curso
- `getGamification()` — XP, nível, streak, conquistas
- `claimAchievementReward(id)` — resgata recompensa
- `unlockAchievement(id)` — notifica desbloqueio
- `getHistory()` — histórico de lições
- `getReviewSuggestions()` / `getReviewExercises()` — revisão inteligente

---

## 📝 TYPES (Interfaces TypeScript)

### types/index.ts
Tipos globais do projeto:
- `User` — perfil do usuário
- `AuthTokens` — tokens JWT (access, refresh, id)
- `LoginRequest` / `RegisterRequest` / `UpdateProfileRequest`
- `Course` / `Module` / `Lesson` — estrutura de cursos
- `Exercise` / `ExerciseOption` — exercícios
- `UserProgress` / `LessonHistory` — progresso
- `GamificationData` / `Achievement` — gamificação
- `ReviewSuggestion` — revisão inteligente
- `ApiResponse<T>` / `ApiError` — envelope de resposta

### types/exercise.ts
Tipos específicos de exercícios para o frontend:
- `ExerciseType` — "multiple_choice" | "true_false"
- `ExerciseFeedback` — resultado após responder
- `MultipleChoiceExercise` / `TrueFalseExercise`
- `ExerciseCardProps` — props do componente

### types/gamification.ts
Tipos de gamificação:
- `GamificationState` — estado completo
- `LessonResult` — resultado de uma lição
- `XPBreakdown` — detalhamento do XP ganho
- `LEVEL_THRESHOLDS` — tabela de XP por nível

---

## 🎨 CONSTANTS

### constants/colors.ts
Design system de cores:
- `Colors` — paleta completa (primary, green, backgrounds, borders, etc.)
- `Theme` — atalhos semânticos (screenBackground, brand, text, etc.)
- Cores dos nós da trilha (completed, available, locked)

### constants/exerciseAssets.ts
Imagem padrão exibida quando o exercício não define imagem própria.

---

## 📊 DATA (Dados Mock)

### data/mockCourses.ts
2 cursos completos com 5 módulos × 5 lições cada = 50 lições.
- `MOCK_EXPO_COURSE` — curso de Expo (React Native)
- `MOCK_AWS_COURSE` — curso de Amazon AWS
- `MOCK_COURSES` — mapa courseId → dados

### data/mockExercises.ts
150 exercícios (3 por lição × 50 lições).
- Perguntas reais sobre Expo e AWS
- Tipos: múltipla escolha e verdadeiro/falso
- `EXERCISES_BY_LESSON` — mapa lessonId → exercícios
- `getExercisesByLesson(id)` — função de lookup

---

## 🔧 UTILS E HOOKS

### utils/date.ts
- `toLocalDateString(date)` — formata data como YYYY-MM-DD local
- `getCurrentWeekDaysLocal()` — retorna os 7 dias da semana atual

### hooks/useResponsiveScale.ts
Hook que calcula escala responsiva baseada na largura da tela.
- `rs(size)` — escala um valor de pixel proporcionalmente

---

## ⚙️ BACKEND — Detalhamento

### backend/src/local/server.ts
**O que faz:** Servidor Express que emula o API Gateway.
- Configura CORS, JSON parsing
- Monta todas as rotas
- Rotas de debug: `/dev/users`, `/dev/db`, `/dev/sync-user`
- Rota de health check: `/health`
- Executa o seed ao iniciar

### backend/src/local/database.ts
**O que faz:** Banco de dados em memória com persistência em JSON.
- `putItem(item)` — insere/atualiza item
- `getItem(pk, sk)` — busca por chave primária
- `queryItems(pk, skPrefix)` — busca por PK + prefixo de SK
- `queryBySK(sk)` — busca pelo valor exato de SK (simula GSI1)
- `queryByField(field, value)` — busca por campo arbitrário
- `updateItem(pk, sk, updates)` — atualiza campos
- `deleteItem(pk, sk)` — remove item
- `loadFromDisk()` / `saveToDisk()` — persistência em arquivo
- `disableAutoSave()` / `enableAutoSave()` / `forceSave()` — controle de performance

### backend/src/local/auth-middleware.ts
**O que faz:** Autenticação JWT local.
- `generateTokens(userId, email, name)` — gera access/id/refresh tokens
- `authMiddleware(req, res, next)` — valida token e injeta userId no request

### backend/src/local/seed-local.ts
**O que faz:** Popula o banco com cursos, módulos, lições e exercícios.
- Preserva dados de usuários entre reinícios
- Recria apenas conteúdo de cursos (IDs sincronizados com o frontend)
- 2 cursos × 5 módulos × 5 lições × 3 exercícios = 150 exercícios

### backend/src/local/routes/auth.ts
- `POST /auth/register` — cria conta (bcrypt hash + conquistas iniciais)
- `POST /auth/login` — valida senha + retorna tokens + dados do usuário
- `POST /auth/forgot-password` — simula envio de email
- `PUT /auth/profile` — atualiza nome/avatar (protegida)

### backend/src/local/routes/courses.ts
- `GET /courses` — lista todos os cursos
- `GET /courses/:id` — detalhes + módulos
- `GET /courses/:id/modules/:moduleId` — lições com status calculado pelo histórico
- `POST /courses/:id/start` — cria registro de progresso (idempotente)

### backend/src/local/routes/lessons.ts
- `GET /lessons/:id` — lição + exercícios (sem correctAnswerId)
- `POST /lessons/:id/complete` — valida, calcula XP/streak, salva histórico, desbloqueia conquistas
- `POST /lessons/:id/repeat` — marca para repetição

### backend/src/local/routes/progress.ts
- `GET /progress` — progresso em todos os cursos
- `GET /progress/:courseId` — progresso em um curso específico

### backend/src/local/routes/gamification.ts
- `GET /gamification` — XP, nível, streak, conquistas
- `POST /gamification/achievements/:id/unlock` — desbloqueia conquista
- `POST /gamification/achievements/:id/claim` — resgata recompensa (+XP)
- `GET /history` — últimas 50 lições completadas

### backend/src/local/routes/review.ts
- `GET /review/suggestions` — lições com alta taxa de erro
- `GET /review/exercises` — exercícios frágeis para praticar

---

## 🗄️ Modelo de Dados (Single Table Design)

Tabela única com PK (Partition Key) e SK (Sort Key):

| Entidade | PK | SK | Campos principais |
|----------|----|----|-------------------|
| Usuário | `USER#<id>` | `PROFILE` | name, email, password, xp, level, streak |
| Progresso | `USER#<id>` | `PROGRESS#<courseId>` | currentModuleId, currentLessonId, percentComplete |
| Histórico | `USER#<id>` | `HISTORY#<timestamp>` | lessonId, correctAnswers, xpEarned |
| Conquista | `USER#<id>` | `ACHIEVEMENT#<id>` | unlocked, rewardClaimed, timesEarned |
| Erro | `USER#<id>` | `ERROR#<exerciseId>` | errorCount, totalAttempts |
| Curso | `COURSE#<id>` | `METADATA` | name, description, order |
| Módulo | `COURSE#<id>` | `MODULE#<moduleId>` | name, order |
| Lição | `MODULE#<id>` | `LESSON#<lessonId>` | name, order, xpReward |
| Exercício | `LESSON#<id>` | `EXERCISE#<exerciseId>` | type, question, correctAnswerId |

---

## 🎮 Regras de Negócio

### XP e Níveis
- XP base por lição: **10 XP**
- Bônus acerto > 90%: **+5 XP**
- Bônus streak múltiplo de 7: **+500 XP**
- Níveis: N1 (0–1000), N2 (1001–2500), N3 (2501–5000), N4 (5001–10000), N5 (10001+)

### Streak
- +1 ao completar ≥ 1 lição no dia
- Reseta para 1 se passar mais de 1 dia sem atividade
- Baseado no campo `lastStudyDate`

### Desbloqueio Progressivo
- Lição só fica "available" após a anterior ser "completed"
- Módulo só desbloqueia após todas as lições do anterior serem completadas
- Mínimo de **70% de acerto** para passar

### Conquistas
| ID | Condição | Recompensa |
|----|----------|------------|
| first-lesson | Completar primeira lição | +250 XP |
| streak-7 | 7 dias consecutivos | +500 XP |
| perfect-score | 100% em uma lição | +300 XP |
| module-complete | Concluir um módulo | +750 XP |
| course-complete | Concluir um curso | +2500 XP |

### Revisão Inteligente
- Exercícios com taxa de erro > 50% E ≥ 3 erros são "frágeis"
- Sugeridos para revisão na tela dedicada

---

## 🔐 Fluxo de Autenticação

```
1. Registro → POST /auth/register → cria usuário + conquistas iniciais
2. Login → POST /auth/login → retorna tokens + dados do usuário
3. Frontend salva tokens no storage (localStorage/SecureStore)
4. Toda requisição protegida envia: Authorization: Bearer <token>
5. Backend valida JWT e extrai userId
6. Logout → remove tokens do storage + reseta stores
```

---

## 🔄 Fluxo de Conclusão de Lição

```
1. Usuário responde exercícios (frontend valida localmente)
2. Ao finalizar → POST /lessons/:id/complete { answers, correctCount, totalCount }
3. Backend calcula: XP ganho, novo streak, novo nível
4. Backend salva: histórico, atualiza perfil, verifica conquistas
5. Backend retorna: { passed, xpEarned, newXP, newLevel, newStreak, nextLessonId }
6. Frontend atualiza stores locais com dados do backend
7. Ao reabrir o curso → GET /courses/:id/modules/:moduleId retorna status atualizado
```

---

## 📦 Dependências Principais

### Frontend
| Pacote | Versão | Uso |
|--------|--------|-----|
| expo | ~54 | Framework mobile |
| react | 19.1 | UI library |
| react-native | 0.81 | Componentes nativos |
| expo-router | ~6 | Navegação por arquivos |
| zustand | ^5 | Estado global |
| axios | latest | HTTP client |
| expo-secure-store | latest | Storage seguro (mobile) |
| expo-image-picker | latest | Seletor de imagem |

### Backend
| Pacote | Versão | Uso |
|--------|--------|-----|
| express | ^4.21 | Servidor HTTP |
| jsonwebtoken | ^9 | Autenticação JWT |
| bcryptjs | ^2.4 | Hash de senhas |
| uuid | ^10 | Geração de IDs |
| cors | ^2.8 | Cross-origin |
| dotenv | ^16 | Variáveis de ambiente |
| ts-node | ^10 | Execução TypeScript |

---

## 🚀 Como Rodar

```bash
# 1. Criar .env do frontend (dualingo/.env)
echo EXPO_PUBLIC_API_URL=http://localhost:3001 > .env

# 2. Criar .env do backend (dualingo/backend/.env)
echo PORT=3001 > backend/.env
echo JWT_SECRET=dualingo-local-dev-secret-2024 >> backend/.env

# 3. Instalar dependências
npm install
cd backend && npm install && cd ..

# 4. Terminal 1 — Backend
cd backend && npm run dev:local

# 5. Terminal 2 — Frontend
npx expo start --clear
```

---

## 🌐 Deploy Futuro

O backend já está preparado para AWS via Serverless Framework:
- `serverless.yml` — define todas as funções Lambda e recursos
- `src/functions/` — handlers prontos para Lambda
- `src/lib/dynamo.ts` — cliente DynamoDB configurado
- `src/lib/cognito.ts` — cliente Cognito configurado

Para deploy:
```bash
cd backend
npm run deploy        # ambiente dev
npm run deploy:prod   # ambiente prod
```
