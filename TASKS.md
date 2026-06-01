# Tasks – Plataforma de Aprendizado Gamificado

> Todas as tarefas do projeto organizadas por área e responsável.
> Marque com `[x]` conforme for concluindo.

---

## 🏗️ SETUP GERAL (Todo o grupo)

- [ ] Criar repositório no GitHub com estrutura monorepo (`/dualingo` + `/backend`)
- [ ] Definir branch strategy (ex: `main`, `develop`, feature branches)
- [ ] Criar arquivo `.env.example` com todas as variáveis necessárias
- [ ] Criar `README.md` com instruções de setup do projeto
- [ ] Configurar `.gitignore` para ignorar `.env`, `node_modules`, etc.
- [ ] Definir e documentar padrões de commit (ex: Conventional Commits)

---

## 👤 MEMBRO 1 – Infraestrutura AWS + Backend: Autenticação

### AWS – Infraestrutura
- [ ] Criar conta AWS e configurar IAM user com permissões adequadas
- [ ] Criar Cognito User Pool
  - [ ] Configurar atributos: nome, email
  - [ ] Habilitar verificação por email
  - [ ] Configurar fluxo `USER_PASSWORD_AUTH`
  - [ ] Criar App Client
- [ ] Criar tabela DynamoDB `duolingo-app`
  - [ ] Definir PK (`pk`) e SK (`sk`)
  - [ ] Criar GSI1: `sk` como PK (busca de módulos por curso)
  - [ ] Criar GSI2: `email` como PK
  - [ ] Configurar capacidade on-demand
- [ ] Criar bucket S3 para assets (imagens, ícones)
  - [ ] Configurar permissões de leitura pública para assets
- [ ] Configurar API Gateway (REST API)
  - [ ] Criar stages: `dev` e `prod`
  - [ ] Configurar CORS
  - [ ] Configurar Cognito Authorizer para rotas protegidas
- [ ] Configurar IAM roles para as Lambdas acessarem DynamoDB, S3 e Cognito
- [ ] Configurar Serverless Framework (`serverless.yml`)
  - [ ] Mapear todas as funções e rotas
  - [ ] Configurar variáveis de ambiente
- [ ] Configurar AWS CloudWatch para logs

### Backend – Autenticação
- [ ] Criar estrutura base do projeto backend (TypeScript + Node.js)
- [ ] Criar helper `lib/response.ts` (padronizar respostas HTTP)
- [ ] Criar helper `lib/cognito.ts` (cliente Cognito reutilizável)
- [ ] Criar helper `lib/dynamo.ts` (cliente DynamoDB reutilizável)
- [ ] Implementar `POST /auth/register`
  - [ ] Validar campos (email, senha, nome)
  - [ ] Criar usuário no Cognito
  - [ ] Criar registro do usuário no DynamoDB
  - [ ] Retornar erro se email já existir
- [ ] Implementar `POST /auth/login`
  - [ ] Autenticar via Cognito
  - [ ] Retornar `accessToken` e `refreshToken`
  - [ ] Retornar erro para credenciais inválidas
- [ ] Implementar `POST /auth/forgot-password`
  - [ ] Disparar fluxo de recuperação via Cognito
- [ ] Implementar `PUT /auth/profile`
  - [ ] Validar token JWT
  - [ ] Atualizar nome e foto no DynamoDB
- [ ] Testar todos os endpoints de auth no Postman

---

## 👤 MEMBRO 2 – Backend: Cursos, Módulos e Lições

- [ ] Implementar `GET /courses`
  - [ ] Buscar todos os cursos no DynamoDB
  - [ ] Retornar lista com id, nome, descrição, total de módulos
- [ ] Implementar `GET /courses/{id}`
  - [ ] Buscar curso pelo id
  - [ ] Buscar módulos do curso (via GSI1)
  - [ ] Retornar curso com lista de módulos
- [ ] Implementar `GET /courses/{id}/modules/{moduleId}`
  - [ ] Buscar módulo pelo id
  - [ ] Buscar lições do módulo
  - [ ] Retornar módulo com lista de lições e status (bloqueado/liberado/concluído) por usuário
- [ ] Implementar `POST /courses/{id}/start`
  - [ ] Verificar se usuário já iniciou o curso
  - [ ] Criar registro de progresso inicial no DynamoDB
  - [ ] Liberar primeira lição do curso
- [ ] Implementar `GET /lessons/{id}`
  - [ ] Buscar lição pelo id
  - [ ] Buscar exercícios da lição
  - [ ] Retornar lição com lista de exercícios
- [ ] Implementar `POST /lessons/{id}/repeat`
  - [ ] Permitir refazer lição já concluída
- [ ] Implementar lógica de desbloqueio progressivo
  - [ ] Verificar se lição anterior foi concluída antes de liberar próxima
  - [ ] Verificar se todas as lições do módulo foram concluídas antes de liberar próximo módulo
- [ ] Testar todos os endpoints no Postman

---

## 👤 MEMBRO 3 – Backend: Progresso, Gamificação e Revisão

### Progresso
- [ ] Implementar `POST /lessons/{id}/complete`
  - [ ] Receber respostas do usuário
  - [ ] Calcular taxa de acerto
  - [ ] Validar mínimo de 70% para concluir
  - [ ] Registrar erros por exercício no DynamoDB
  - [ ] Calcular XP ganho (base + bônus)
  - [ ] Atualizar progresso do usuário
  - [ ] Atualizar streak diário
  - [ ] Verificar e conceder conquistas
  - [ ] Retornar resultado (acertos, erros, XP ganho, concluído: true/false)
- [ ] Implementar `GET /progress`
  - [ ] Retornar progresso geral do usuário (todos os cursos)
- [ ] Implementar `GET /progress/{courseId}`
  - [ ] Retornar progresso detalhado por curso (módulo atual, lição atual, % concluído)
- [ ] Implementar `GET /history`
  - [ ] Retornar histórico de lições realizadas com data, acertos, erros e XP

### Gamificação
- [ ] Implementar `GET /gamification`
  - [ ] Retornar XP total, nível atual, streak atual, lista de conquistas
- [ ] Implementar lógica de XP e níveis
  - [ ] XP base por lição: 10 XP
  - [ ] Bônus acerto > 90%: +5 XP
  - [ ] Bônus streak a cada 7 dias: +10 XP
  - [ ] Tabela de níveis: 0-100 = N1, 101-250 = N2, 251-500 = N3, 501-1000 = N4, 1001+ = N5
- [ ] Implementar lógica de streak diário
  - [ ] Incrementar streak ao completar lição no dia
  - [ ] Resetar streak se passar 24h sem atividade
  - [ ] Usar campo `lastStudyDate` no perfil do usuário
- [ ] Implementar sistema de conquistas
  - [ ] "Primeira lição" — concluir a primeira lição
  - [ ] "Semana perfeita" — 7 dias de streak
  - [ ] "Módulo completo" — concluir um módulo inteiro
  - [ ] "Curso completo" — concluir um curso inteiro
  - [ ] "Nota máxima" — acertar 100% em uma lição

### Revisão Inteligente
- [ ] Implementar `GET /review/suggestions`
  - [ ] Buscar exercícios com taxa de erro > 50% do usuário
  - [ ] Retornar lista de lições/módulos sugeridos para revisão
- [ ] Implementar `GET /review/exercises`
  - [ ] Gerar lista de exercícios baseada nos erros registrados
  - [ ] Priorizar exercícios com mais erros
- [ ] Testar todos os endpoints no Postman

---

## 👤 MEMBRO 4 – Backend: Admin + Seed de Dados

### Admin CRUD
- [ ] Implementar `POST /admin/courses` — criar curso
- [ ] Implementar `PUT /admin/courses/{id}` — editar curso
- [ ] Implementar `DELETE /admin/courses/{id}` — excluir curso (sem apagar progresso)
- [ ] Implementar `POST /admin/modules` — criar módulo
- [ ] Implementar `PUT /admin/modules/{id}` — editar módulo
- [ ] Implementar `DELETE /admin/modules/{id}` — excluir módulo
- [ ] Implementar `POST /admin/lessons` — criar lição
- [ ] Implementar `PUT /admin/lessons/{id}` — editar lição
- [ ] Implementar `DELETE /admin/lessons/{id}` — excluir lição
- [ ] Implementar `POST /admin/exercises` — criar exercício
- [ ] Implementar `PUT /admin/exercises/{id}` — editar exercício
- [ ] Implementar `DELETE /admin/exercises/{id}` — excluir exercício
- [ ] Implementar `GET /admin/reports`
  - [ ] Total de usuários cadastrados
  - [ ] Lições mais concluídas
  - [ ] Taxa de acerto média por exercício
  - [ ] Usuários com maior streak

### Seed de Dados
- [ ] Criar script de seed (`scripts/seed.ts`)
- [ ] Popular Curso 1: Expo (React Native)
  - [ ] Módulo: Fundamentos (3 lições, 5 exercícios cada)
  - [ ] Módulo: Componentes (3 lições, 5 exercícios cada)
  - [ ] Módulo: Navegação (3 lições, 5 exercícios cada)
  - [ ] Módulo: APIs (3 lições, 5 exercícios cada)
  - [ ] Módulo: Armazenamento (2 lições, 5 exercícios cada)
  - [ ] Módulo: Build e Deploy (2 lições, 5 exercícios cada)
- [ ] Popular Curso 2: AWS Nuvem
  - [ ] Módulo: Conceitos de Cloud (3 lições, 5 exercícios cada)
  - [ ] Módulo: IAM (3 lições, 5 exercícios cada)
  - [ ] Módulo: S3 (3 lições, 5 exercícios cada)
  - [ ] Módulo: EC2 (3 lições, 5 exercícios cada)
  - [ ] Módulo: Lambda (3 lições, 5 exercícios cada)
  - [ ] Módulo: API Gateway (2 lições, 5 exercícios cada)
  - [ ] Módulo: DynamoDB (3 lições, 5 exercícios cada)
- [ ] Garantir exercícios de múltipla escolha e V/F no seed

### Documentação
- [ ] Criar Postman Collection com todos os endpoints
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Escrever README do backend com instruções de setup e deploy

---

## 👤 MEMBRO 5 – Frontend: Auth + Navegação

### Setup Frontend
- [ ] Instalar dependências: `zustand`, `@tanstack/react-query`, `axios`, `expo-secure-store`
- [ ] Criar `constants/colors.ts` com paleta de cores do projeto
- [ ] Criar `constants/config.ts` com URL base da API
- [ ] Criar `types/index.ts` com interfaces TypeScript (User, Course, Lesson, Exercise, etc.)
- [ ] Criar `services/api.ts` com instância do Axios e interceptors (token no header)

### Auth Store e Service
- [ ] Criar `store/authStore.ts` (Zustand)
  - [ ] Estado: `user`, `token`, `isAuthenticated`, `isLoading`
  - [ ] Actions: `login`, `logout`, `register`, `updateProfile`
- [ ] Criar `services/authService.ts`
  - [ ] `register(name, email, password)`
  - [ ] `login(email, password)`
  - [ ] `forgotPassword(email)`
  - [ ] `updateProfile(data)`
- [ ] Salvar/recuperar token no `expo-secure-store`

### Telas de Auth
- [ ] Criar `app/(auth)/_layout.tsx`
- [ ] Criar `app/(auth)/login.tsx`
  - [ ] Campos: email, senha
  - [ ] Botão de login
  - [ ] Link para cadastro
  - [ ] Link para recuperar senha
  - [ ] Exibir erro de credenciais inválidas
- [ ] Criar `app/(auth)/register.tsx`
  - [ ] Campos: nome, email, senha, confirmar senha
  - [ ] Validação de campos
  - [ ] Exibir erro de email já cadastrado
- [ ] Criar `app/(auth)/forgot-password.tsx`
  - [ ] Campo: email
  - [ ] Feedback de email enviado

### Navegação e Auth Guard
- [ ] Criar `app/_layout.tsx` (root layout)
  - [ ] Verificar token ao iniciar o app
  - [ ] Redirecionar para login se não autenticado
  - [ ] Redirecionar para home se autenticado
- [ ] Criar `app/(tabs)/_layout.tsx` com bottom tabs
  - [ ] Tab: Home (ícone de casa)
  - [ ] Tab: Progresso (ícone de gráfico)
  - [ ] Tab: Perfil (ícone de usuário)
- [ ] Criar `app/(tabs)/profile.tsx`
  - [ ] Exibir nome, email, XP, nível, streak
  - [ ] Botão de editar perfil
  - [ ] Botão de logout

---

## 👤 MEMBRO 6 – Frontend: Cursos e Trilha

### Services e Store
- [ ] Criar `services/courseService.ts`
  - [ ] `getCourses()`
  - [ ] `getCourse(id)`
  - [ ] `getModule(courseId, moduleId)`
  - [ ] `startCourse(id)`
- [ ] Criar `store/progressStore.ts` (Zustand)
  - [ ] Estado: `courses`, `currentCourse`, `progress`
  - [ ] Actions: `setCourses`, `setProgress`

### Componentes
- [ ] Criar `components/CourseCard.tsx`
  - [ ] Exibir nome, descrição, ícone do curso
  - [ ] Exibir barra de progresso
  - [ ] Estado: não iniciado / em andamento / concluído
- [ ] Criar `components/LessonNode.tsx`
  - [ ] Exibir nó da trilha (círculo com ícone)
  - [ ] Estados visuais: bloqueado (cinza), liberado (colorido), concluído (check)
  - [ ] Animação ao desbloquear (opcional)

### Telas
- [ ] Criar `app/(tabs)/index.tsx` (Home)
  - [ ] Exibir saudação com nome do usuário
  - [ ] Exibir streak atual e XP
  - [ ] Listar cursos disponíveis com `CourseCard`
  - [ ] Integrar com `GET /courses`
- [ ] Criar `app/course/[id].tsx` (Trilha do curso)
  - [ ] Exibir nome e descrição do curso
  - [ ] Exibir progresso geral do curso (%)
  - [ ] Renderizar trilha visual com módulos e lições usando `LessonNode`
  - [ ] Lições bloqueadas não são clicáveis
  - [ ] Ao clicar em lição liberada, navegar para `app/lesson/[id]`
  - [ ] Integrar com `GET /courses/{id}`

---

## 👤 MEMBRO 7 – Frontend: Lições e Exercícios

### Services
- [ ] Criar `services/lessonService.ts`
  - [ ] `getLesson(id)`
  - [ ] `completeLesson(id, answers)`
  - [ ] `repeatLesson(id)`

### Componentes de Exercício
- [ ] Criar `components/ExerciseCard.tsx` (container base)
  - [ ] Exibir pergunta
  - [ ] Exibir tipo de exercício
  - [ ] Exibir feedback (correto/incorreto) após responder
- [ ] Criar componente de exercício: **Múltipla Escolha**
  - [ ] Exibir 4 opções
  - [ ] Destacar opção selecionada
  - [ ] Mostrar correto (verde) / incorreto (vermelho) após confirmar
- [ ] Criar componente de exercício: **Verdadeiro ou Falso**
  - [ ] Dois botões: Verdadeiro / Falso
  - [ ] Mesmo feedback visual

### Tela de Lição
- [ ] Criar `app/lesson/[id].tsx`
  - [ ] Exibir barra de progresso da lição (exercício X de Y)
  - [ ] Renderizar exercício atual com o componente correto
  - [ ] Botão "Confirmar" para verificar resposta
  - [ ] Exibir feedback imediato (correto/incorreto + explicação)
  - [ ] Botão "Próximo" para avançar ao próximo exercício
  - [ ] Ao finalizar todos os exercícios, chamar `POST /lessons/{id}/complete`
  - [ ] Exibir tela de resultado (XP ganho, acertos, erros, concluído ou não)
  - [ ] Botão para voltar à trilha
  - [ ] Botão para repetir lição (se não concluída)
- [ ] Tratar caso de lição não concluída (< 70% de acerto)
  - [ ] Exibir mensagem motivacional
  - [ ] Oferecer opção de tentar novamente

---

## 👤 MEMBRO 8 – Frontend: Gamificação e Progresso

### Services e Store
- [ ] Criar `services/progressService.ts`
  - [ ] `getProgress()`
  - [ ] `getCourseProgress(courseId)`
  - [ ] `getHistory()`
  - [ ] `getGamification()`
- [ ] Criar `store/gamificationStore.ts` (Zustand)
  - [ ] Estado: `xp`, `level`, `streak`, `achievements`
  - [ ] Actions: `updateXP`, `updateStreak`, `addAchievement`

### Componentes
- [ ] Criar `components/XPBar.tsx`
  - [ ] Barra de progresso de XP para o próximo nível
  - [ ] Exibir XP atual / XP necessário
  - [ ] Animação ao ganhar XP
- [ ] Criar `components/StreakBadge.tsx`
  - [ ] Exibir número de dias consecutivos
  - [ ] Ícone de fogo
  - [ ] Destaque visual quando streak > 7 dias
- [ ] Criar `components/AchievementBadge.tsx`
  - [ ] Exibir ícone e nome da conquista
  - [ ] Estado: conquistado / bloqueado (cinza)
- [ ] Criar `components/ui/ProgressBar.tsx` (reutilizável)

### Telas
- [ ] Criar `app/(tabs)/progress.tsx` (Painel de Progresso)
  - [ ] Exibir XP total e nível atual com `XPBar`
  - [ ] Exibir streak com `StreakBadge`
  - [ ] Exibir progresso por curso (barra de %)
  - [ ] Exibir lista de conquistas com `AchievementBadge`
  - [ ] Integrar com `GET /progress` e `GET /gamification`
- [ ] Criar seção de histórico dentro da tela de progresso
  - [ ] Listar lições realizadas (nome, data, acertos, XP ganho)
  - [ ] Integrar com `GET /history`

---

## 👤 MEMBRO 9 – Frontend: Revisão Inteligente + Design System

### Design System / Componentes UI
- [ ] Criar `components/ui/Button.tsx`
  - [ ] Variantes: primary, secondary, outline, danger
  - [ ] Estado: loading, disabled
- [ ] Criar `components/ui/Card.tsx`
  - [ ] Container com sombra e bordas arredondadas
- [ ] Criar `components/ui/ProgressBar.tsx`
  - [ ] Barra animada com cor configurável
- [ ] Criar `components/ui/Badge.tsx`
  - [ ] Pequeno indicador colorido (ex: "Novo", "Bloqueado")
- [ ] Definir `constants/colors.ts` com paleta completa
  - [ ] Cores primárias, secundárias, feedback (sucesso, erro, aviso)
  - [ ] Suporte a tema claro/escuro (opcional)
- [ ] Garantir acessibilidade nos componentes
  - [ ] `accessibilityLabel` nos botões e ícones
  - [ ] Contraste de cores adequado

### Tela de Revisão Inteligente
- [ ] Criar `app/review.tsx`
  - [ ] Exibir lista de conteúdos frágeis (lições/exercícios com mais erros)
  - [ ] Exibir taxa de erro por item
  - [ ] Botão para iniciar revisão de um item
  - [ ] Integrar com `GET /review/suggestions`
- [ ] Criar fluxo de exercícios de revisão
  - [ ] Reutilizar componentes de exercício do Membro 7
  - [ ] Integrar com `GET /review/exercises`
  - [ ] Ao concluir revisão, atualizar progresso

---

## ✅ CHECKLIST FINAL DE ENTREGA

### Funcionalidades
- [ ] Cadastro e login funcionando via Cognito
- [ ] 2 cursos com conteúdo real (Expo + AWS)
- [ ] Trilha visual com desbloqueio progressivo
- [ ] Fluxo completo: login → curso → lição → exercício → XP
- [ ] Feedback imediato nos exercícios
- [ ] XP e níveis funcionando
- [ ] Streak diário funcionando
- [ ] Progresso salvo no DynamoDB
- [ ] Conquistas básicas funcionando
- [ ] Revisão inteligente básica
- [ ] Tela de progresso e histórico

### Infraestrutura
- [ ] API deployada na AWS (Lambda + API Gateway)
- [ ] DynamoDB configurado com dados reais
- [ ] Cognito configurado e funcional
- [ ] S3 configurado para assets
- [ ] Variáveis de ambiente configuradas (sem secrets no código)

### Qualidade
- [ ] App roda no Android e/ou iOS sem crashes
- [ ] Sem erros de TypeScript
- [ ] README com instruções de setup
- [ ] Postman Collection documentada
- [ ] Apresentação preparada

---

*Atualizado conforme o progresso do grupo. Cada membro deve marcar suas tasks ao concluir.*
