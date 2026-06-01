# Contexto do Projeto – Plataforma de Aprendizado Gamificado (Dualingo)

## Visão Geral

Plataforma mobile de aprendizado gamificado inspirada no Duolingo, desenvolvida como projeto acadêmico de grupo (9 pessoas) para a disciplina de Mobile + AWS. O app ensina **Expo (React Native)** e **AWS Nuvem** por meio de trilhas progressivas, exercícios interativos e gamificação.

---

## Stack Tecnológica

### Frontend (pasta `/dualingo`)
- **Expo SDK ~54** com Expo Router ~6 (navegação baseada em arquivos)
- **React 19 + React Native 0.81**
- **TypeScript ~5.9**
- **Zustand** — gerenciamento de estado global
- **TanStack React Query** — cache e sincronização com a API
- **Axios** — cliente HTTP
- **expo-secure-store** — armazenamento seguro de tokens

### Backend (pasta `/backend` — a criar)
- **Node.js + TypeScript**
- **AWS Lambda** — funções serverless
- **AWS API Gateway** — endpoints REST
- **AWS DynamoDB** — banco NoSQL (Single Table Design)
- **AWS Cognito** — autenticação e gerenciamento de usuários
- **AWS S3** — assets e imagens
- **Serverless Framework** — deploy e infraestrutura como código

---

## Arquitetura

```
Expo App → API Gateway → Lambda Functions → DynamoDB / Cognito / S3
```

Autenticação via **JWT (Cognito Authorizer)** em todas as rotas protegidas.

---

## Modelo de Dados (DynamoDB — Single Table Design)

Tabela: `duolingo-app`

| Entidade        | PK                    | SK                        |
|-----------------|-----------------------|---------------------------|
| Usuário         | `USER#<userId>`       | `PROFILE`                 |
| Curso           | `COURSE#<courseId>`   | `METADATA`                |
| Módulo          | `COURSE#<courseId>`   | `MODULE#<moduleId>`       |
| Lição           | `MODULE#<moduleId>`   | `LESSON#<lessonId>`       |
| Exercício       | `LESSON#<lessonId>`   | `EXERCISE#<exerciseId>`   |
| Progresso       | `USER#<userId>`       | `PROGRESS#<courseId>`     |
| Histórico       | `USER#<userId>`       | `HISTORY#<timestamp>`     |
| Conquista       | `USER#<userId>`       | `ACHIEVEMENT#<id>`        |
| Erro Recorrente | `USER#<userId>`       | `ERROR#<exerciseId>`      |

GSI1: `sk` como PK (busca módulos por curso)
GSI2: `email` como PK (login por email)

---

## Regras de Negócio Críticas

- **Conclusão de lição**: exige mínimo de **70% de acerto**
- **Desbloqueio progressivo**: lição só libera após a anterior ser concluída; módulo só libera após todas as lições do módulo anterior
- **XP**: 10 XP base por lição + 5 XP bônus se acerto > 90% + 10 XP bônus a cada 7 dias de streak
- **Níveis**: N1 (0–100 XP), N2 (101–250), N3 (251–500), N4 (501–1000), N5 (1001+)
- **Streak**: incrementa ao completar ≥ 1 lição/dia; reseta após 24h sem atividade (campo `lastStudyDate`)
- **Revisão inteligente**: exercícios com taxa de erro > 50% são marcados como "frágeis"; sugestão após 3+ erros no mesmo exercício
- **Cursos simultâneos**: usuário pode fazer Expo e AWS ao mesmo tempo, com progresso independente
- **Exclusão de conteúdo admin**: nunca apagar progresso de usuários ao editar/excluir cursos

---

## Estrutura de Pastas do Frontend

```
dualingo/
├── app/
│   ├── (auth)/          ← login, register, forgot-password
│   ├── (tabs)/          ← home, progress, profile
│   ├── course/[id].tsx  ← trilha visual do curso
│   ├── lesson/[id].tsx  ← tela de lição com exercícios
│   ├── review.tsx       ← revisão inteligente
│   └── _layout.tsx      ← root layout com auth guard
├── components/
│   ├── ui/              ← Button, Card, ProgressBar, Badge
│   ├── CourseCard.tsx
│   ├── LessonNode.tsx   ← nó da trilha (bloqueado/liberado/concluído)
│   ├── ExerciseCard.tsx
│   ├── XPBar.tsx
│   ├── StreakBadge.tsx
│   └── AchievementBadge.tsx
├── store/               ← authStore, progressStore, gamificationStore
├── services/            ← api.ts, authService, courseService, lessonService, progressService
├── types/index.ts
└── constants/           ← colors.ts, config.ts
```

---

## Endpoints da API

### Auth
| Método | Rota                  | Descrição              |
|--------|-----------------------|------------------------|
| POST   | `/auth/register`      | Cadastro               |
| POST   | `/auth/login`         | Login                  |
| POST   | `/auth/forgot-password` | Recuperação de senha |
| PUT    | `/auth/profile`       | Editar perfil          |

### Cursos e Trilhas
| Método | Rota                                    | Descrição                    |
|--------|-----------------------------------------|------------------------------|
| GET    | `/courses`                              | Listar cursos                |
| GET    | `/courses/{id}`                         | Detalhes + módulos           |
| GET    | `/courses/{id}/modules/{moduleId}`      | Módulo + lições com status   |
| POST   | `/courses/{id}/start`                   | Iniciar curso                |

### Lições
| Método | Rota                      | Descrição                    |
|--------|---------------------------|------------------------------|
| GET    | `/lessons/{id}`           | Lição com exercícios         |
| POST   | `/lessons/{id}/complete`  | Concluir lição (envia respostas) |
| POST   | `/lessons/{id}/repeat`    | Repetir lição                |

### Progresso e Gamificação
| Método | Rota                    | Descrição                        |
|--------|-------------------------|----------------------------------|
| GET    | `/progress`             | Progresso geral                  |
| GET    | `/progress/{courseId}`  | Progresso por curso              |
| GET    | `/gamification`         | XP, nível, streak, conquistas    |
| GET    | `/history`              | Histórico de lições              |

### Revisão
| Método | Rota                    | Descrição                        |
|--------|-------------------------|----------------------------------|
| GET    | `/review/suggestions`   | Conteúdos sugeridos para revisão |
| GET    | `/review/exercises`     | Exercícios personalizados        |

### Admin
| Método | Rota                      | Descrição              |
|--------|---------------------------|------------------------|
| POST/PUT/DELETE | `/admin/courses` | CRUD de cursos    |
| POST/PUT/DELETE | `/admin/modules` | CRUD de módulos   |
| POST/PUT/DELETE | `/admin/lessons` | CRUD de lições    |
| POST/PUT/DELETE | `/admin/exercises` | CRUD de exercícios |
| GET    | `/admin/reports`          | Relatórios de uso      |

---

## Tipos de Exercício Suportados

- Múltipla escolha (4 opções)
- Verdadeiro ou Falso
- Associação *(fase 2)*
- Completar código *(fase 2)*
- Ordenar passos *(fase 2)*

---

## Conteúdo dos Cursos (Seed)

### Curso 1: Expo (React Native)
Módulos: Fundamentos → Componentes → Navegação → APIs → Armazenamento → Build e Deploy

### Curso 2: AWS Nuvem
Módulos: Conceitos de Cloud → IAM → S3 → EC2 → Lambda → API Gateway → DynamoDB

---

## Divisão de Responsabilidades (9 membros)

| Membro | Área |
|--------|------|
| M1 | Infra AWS (Cognito, DynamoDB, S3, API Gateway, IAM) + Backend Auth |
| M2 | Backend: Cursos, Módulos, Lições, Desbloqueio progressivo |
| M3 | Backend: Progresso, Gamificação (XP/streak/conquistas), Revisão inteligente |
| M4 | Backend: Admin CRUD + Seed de dados + Documentação da API |
| M5 | Frontend: Auth (login/cadastro/recuperação) + Navegação + Auth guard |
| M6 | Frontend: Home (lista de cursos) + Trilha visual do curso |
| M7 | Frontend: Tela de lição + Componentes de exercício + Feedback |
| M8 | Frontend: Gamificação (XPBar, StreakBadge, AchievementBadge) + Tela de progresso |
| M9 | Frontend: Revisão inteligente + Design System (Button, Card, ProgressBar, Badge) |

---

## MVP — O que está incluído na primeira entrega

- Cadastro e login via Cognito
- 2 cursos com conteúdo real (Expo + AWS)
- Trilha com desbloqueio progressivo
- Exercícios de múltipla escolha e V/F
- XP, níveis e streak
- Progresso salvo no DynamoDB
- Revisão inteligente básica
- Painel de progresso

**Fora do MVP**: ranking, IA adaptativa avançada, notificações push avançadas.

---

## Padrões de Código

- TypeScript em todo o projeto (sem `any` desnecessário)
- Nunca expor credenciais AWS no código — usar variáveis de ambiente
- Validar JWT em todas as rotas protegidas via Cognito Authorizer
- Sanitizar inputs antes de salvar no DynamoDB
- Usar React Query para cache no frontend (não fazer fetch direto em componentes)
- Tokens salvos no `expo-secure-store` (nunca em AsyncStorage)
- Respostas da API padronizadas via `lib/response.ts`

---

## Arquivos de Referência do Projeto

- `PLANO_PROJETO.md` — arquitetura detalhada, modelo de dados, estrutura de pastas, fases de desenvolvimento
- `TASKS.md` — todas as tarefas organizadas por membro com checklist
- `USER_STORIES.md` — histórias de usuário com critérios de aceitação detalhados
