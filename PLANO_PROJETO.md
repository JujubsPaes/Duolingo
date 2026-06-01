# Plano de Projeto – Plataforma de Aprendizado Gamificado (Duolingo Clone)

> Expo + AWS | Projeto 01

---

## 1. Visão Geral

Plataforma mobile de aprendizado gamificado inspirada no Duolingo, focada no ensino de **Expo (React Native)** e **AWS Nuvem**. O sistema oferece trilhas progressivas, exercícios interativos, gamificação e revisão inteligente baseada em erros do usuário.

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| Expo (React Native) | App mobile iOS/Android |
| Expo Router | Navegação baseada em arquivos |
| TypeScript | Tipagem estática |
| Zustand | Gerenciamento de estado global |
| React Query (TanStack) | Cache e sincronização de dados com a API |
| NativeWind ou StyleSheet | Estilização |

### Backend
| Tecnologia | Uso |
|---|---|
| Node.js + TypeScript | Runtime do servidor |
| AWS Lambda | Funções serverless (handlers da API) |
| AWS API Gateway | Exposição dos endpoints REST |
| AWS DynamoDB | Banco de dados NoSQL principal |
| AWS S3 | Armazenamento de imagens e assets |
| AWS Cognito | Autenticação e gerenciamento de usuários |
| AWS CloudWatch | Logs e monitoramento |

### Ferramentas de Desenvolvimento
| Ferramenta | Uso |
|---|---|
| Serverless Framework ou AWS SAM | Deploy das Lambdas e infraestrutura |
| Postman / Insomnia | Testes de API |
| GitHub | Controle de versão |
| GitHub Actions | CI/CD (opcional) |

---

## 3. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    EXPO APP (Mobile)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │  Cursos  │  │  Lições  │  │Perfil  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
└───────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │ HTTPS / REST
                    ┌────────▼────────┐
                    │  API Gateway    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌───────▼────┐  ┌─────▼──────┐
     │  Lambda    │  │  Lambda    │  │  Lambda    │
     │  /auth     │  │  /courses  │  │  /progress │
     └────────┬───┘  └───────┬────┘  └─────┬──────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌───────▼────┐  ┌─────▼──────┐
     │  Cognito   │  │  DynamoDB  │  │     S3     │
     │  (Auth)    │  │   (Dados)  │  │  (Assets)  │
     └────────────┘  └────────────┘  └────────────┘
```

---

## 4. Modelo de Dados (DynamoDB)

O DynamoDB usa um modelo de **Single Table Design** para eficiência. Cada entidade tem um `PK` (Partition Key) e `SK` (Sort Key).

### Tabela Principal: `duolingo-app`

| Entidade | PK | SK | Atributos principais |
|---|---|---|---|
| Usuário | `USER#<userId>` | `PROFILE` | nome, email, xp, nivel, streak, lastStudyDate |
| Curso | `COURSE#<courseId>` | `METADATA` | nome, descricao, ordem |
| Módulo | `COURSE#<courseId>` | `MODULE#<moduleId>` | nome, ordem |
| Lição | `MODULE#<moduleId>` | `LESSON#<lessonId>` | nome, ordem, xpReward |
| Exercício | `LESSON#<lessonId>` | `EXERCISE#<exerciseId>` | tipo, pergunta, respostas, respostaCorreta |
| Progresso | `USER#<userId>` | `PROGRESS#<courseId>` | moduloAtual, licaoAtual, xpAcumulado, percentual |
| Histórico | `USER#<userId>` | `HISTORY#<timestamp>` | licaoId, acertos, erros, xpGanho |
| Conquista | `USER#<userId>` | `ACHIEVEMENT#<achievementId>` | nome, descricao, dataConquista |
| Erro Recorrente | `USER#<userId>` | `ERROR#<exerciseId>` | count, ultimoErro |

### Índices Secundários (GSI)
- `GSI1`: `SK` como PK → permite buscar todos os módulos de um curso
- `GSI2`: `email` como PK → login por email via Cognito

---

## 5. Estrutura de Pastas

### Frontend (`/dualingo`)
```
dualingo/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          ← Home (lista de cursos)
│   │   ├── progress.tsx       ← Painel de progresso
│   │   └── profile.tsx        ← Perfil do usuário
│   ├── course/
│   │   └── [id].tsx           ← Trilha visual do curso
│   ├── lesson/
│   │   └── [id].tsx           ← Tela de lição com exercícios
│   ├── review.tsx             ← Revisão inteligente
│   └── _layout.tsx            ← Root layout (auth guard)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ProgressBar.tsx
│   ├── CourseCard.tsx
│   ├── LessonNode.tsx         ← Nó da trilha (bloqueado/liberado/concluído)
│   ├── ExerciseCard.tsx
│   ├── XPBar.tsx
│   ├── StreakBadge.tsx
│   └── AchievementBadge.tsx
├── store/
│   ├── authStore.ts           ← Estado de autenticação
│   ├── progressStore.ts       ← Estado de progresso
│   └── gamificationStore.ts   ← XP, streak, conquistas
├── services/
│   ├── api.ts                 ← Configuração base (axios/fetch)
│   ├── authService.ts
│   ├── courseService.ts
│   ├── lessonService.ts
│   └── progressService.ts
├── types/
│   └── index.ts               ← Interfaces TypeScript
└── constants/
    ├── colors.ts
    └── config.ts
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── functions/
│   │   ├── auth/
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   └── forgotPassword.ts
│   │   ├── courses/
│   │   │   ├── list.ts
│   │   │   ├── get.ts
│   │   │   └── admin-crud.ts
│   │   ├── lessons/
│   │   │   ├── get.ts
│   │   │   ├── complete.ts
│   │   │   └── admin-crud.ts
│   │   ├── progress/
│   │   │   ├── get.ts
│   │   │   └── update.ts
│   │   ├── gamification/
│   │   │   ├── streak.ts
│   │   │   └── achievements.ts
│   │   └── review/
│   │       ├── getSuggestions.ts
│   │       └── getExercises.ts
│   ├── lib/
│   │   ├── dynamo.ts          ← Cliente DynamoDB
│   │   ├── cognito.ts         ← Cliente Cognito
│   │   └── response.ts        ← Helper de respostas HTTP
│   └── types/
│       └── index.ts
├── serverless.yml             ← Configuração do Serverless Framework
└── package.json
```

---

## 6. Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login |
| POST | `/auth/forgot-password` | Recuperação de senha |
| PUT | `/auth/profile` | Editar perfil |

### Cursos e Trilhas
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/courses` | Listar todos os cursos |
| GET | `/courses/{id}` | Detalhes do curso + módulos |
| GET | `/courses/{id}/modules/{moduleId}` | Módulo + lições |
| POST | `/courses/{id}/start` | Iniciar curso |

### Lições e Exercícios
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/lessons/{id}` | Carregar lição com exercícios |
| POST | `/lessons/{id}/complete` | Concluir lição (envia respostas) |
| POST | `/lessons/{id}/repeat` | Repetir lição |

### Progresso e Gamificação
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/progress` | Progresso geral do usuário |
| GET | `/progress/{courseId}` | Progresso por curso |
| GET | `/gamification` | XP, nível, streak, conquistas |
| GET | `/history` | Histórico de lições |

### Revisão Inteligente
| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/review/suggestions` | Conteúdos sugeridos para revisão |
| GET | `/review/exercises` | Exercícios personalizados |

### Admin
| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/admin/courses` | Criar curso |
| PUT | `/admin/courses/{id}` | Editar curso |
| DELETE | `/admin/courses/{id}` | Excluir curso |
| POST | `/admin/modules` | Criar módulo |
| POST | `/admin/lessons` | Criar lição |
| POST | `/admin/exercises` | Criar exercício |
| GET | `/admin/reports` | Relatórios de uso |

---

## 7. Regras de Negócio Importantes

### Conclusão de Lição
- Usuário precisa acertar **mínimo de 70%** dos exercícios para concluir
- Se não atingir o mínimo, a lição não é marcada como concluída
- Erros são registrados por exercício para a revisão inteligente

### Desbloqueio Progressivo
- Lição só é liberada após a anterior ser concluída
- Módulo só é liberado após todas as lições do módulo anterior serem concluídas

### XP e Níveis
- XP base por lição: **10 XP**
- Bônus por acerto acima de 90%: **+5 XP**
- Bônus de streak (a cada 7 dias): **+10 XP**
- Tabela de níveis: 0-100 XP = Nível 1, 101-250 = Nível 2, 251-500 = Nível 3, etc.

### Streak Diário
- Incrementa se o usuário completar ao menos **1 lição no dia**
- Reseta para 0 se passar **24h sem atividade**
- Verificado via `lastStudyDate` no perfil do usuário

### Revisão Inteligente
- Exercícios com taxa de erro > 50% são marcados como "frágeis"
- Sistema sugere revisão após 3+ erros no mesmo exercício
- Exercícios de revisão são gerados a partir dos erros registrados

---

## 8. Divisão de Tarefas (9 pessoas)

> A parte de arquitetura, padrões de código e integração final é responsabilidade coletiva do grupo — todo mundo contribui um pouco com isso.

### Membro 1 – Infraestrutura AWS + Backend: Autenticação
- Criar e configurar todos os recursos na AWS:
  - Cognito User Pool
  - DynamoDB (tabela principal + GSIs)
  - S3 bucket, API Gateway, IAM roles
- Configurar Serverless Framework (`serverless.yml`)
- Gerenciar variáveis de ambiente e secrets
- Endpoints de autenticação: register, login, forgot-password, editar perfil
- Configurar Cognito Authorizer no API Gateway

### Membro 2 – Backend: Cursos, Módulos e Lições
- `GET /courses` — listar cursos
- `GET /courses/{id}` — detalhes + módulos
- `GET /lessons/{id}` — lição com exercícios
- `POST /courses/{id}/start` — iniciar curso
- Lógica de desbloqueio progressivo

### Membro 3 – Backend: Progresso, Gamificação e Revisão
- `POST /lessons/{id}/complete` — concluir lição, calcular XP
- `GET /progress` e `GET /progress/{courseId}`
- `GET /gamification` — XP, nível, streak, conquistas
- `GET /review/suggestions` e `GET /review/exercises`
- Lógica de streak diário e sistema de conquistas

### Membro 4 – Backend: Admin + Seed de Dados
- CRUD admin: cursos, módulos, lições, exercícios
- `GET /admin/reports`
- Criar seed de dados completo (2 cursos com módulos, lições e exercícios reais)
- Documentar a API (Postman Collection ou Swagger)

### Membro 5 – Frontend: Auth + Navegação
- Telas: login, cadastro, recuperação de senha
- Root layout com auth guard (redirecionar se não autenticado)
- Guardar tokens no SecureStore
- Integração com os endpoints de auth
- Navegação base (tabs, stack)

### Membro 6 – Frontend: Cursos e Trilha
- Tela home com lista de cursos
- Tela de trilha visual (nós bloqueados/liberados/concluídos)
- Integração com endpoints de cursos

### Membro 7 – Frontend: Lições e Exercícios
- Tela de lição com fluxo de exercícios
- Tipos de exercício: múltipla escolha, V/F
- Feedback imediato (correto/incorreto + explicação)
- Integração com endpoints de lições

### Membro 8 – Frontend: Gamificação e Progresso
- Tela de progresso (por curso e por módulo)
- Tela de histórico de lições
- Componentes: XPBar, StreakBadge, AchievementBadge
- Integração com endpoints de progresso e gamificação

### Membro 9 – Frontend: Revisão Inteligente + UI/Design System
- Tela de revisão inteligente
- Integração com endpoints de revisão
- Componentes de UI reutilizáveis (Button, Card, ProgressBar, etc.)
- Identidade visual: cores, tipografia, ícones

---

## 9. Fluxo de Desenvolvimento (Fases)

### Fase 1 – Setup e Infraestrutura (Semana 1)
- [ ] Criar repositório no GitHub com monorepo (`/dualingo` + `/backend`)
- [ ] Configurar AWS: Cognito User Pool, DynamoDB table, S3 bucket
- [ ] Configurar Serverless Framework no backend
- [ ] Definir variáveis de ambiente
- [ ] Criar estrutura de pastas do frontend e backend
- [ ] Instalar dependências (Zustand, React Query, Axios)

### Fase 2 – Backend Core (Semana 2)
- [ ] Lambda: register, login (Cognito)
- [ ] Lambda: listar cursos, módulos, lições
- [ ] Lambda: concluir lição (com cálculo de XP e progresso)
- [ ] Lambda: buscar progresso do usuário
- [ ] Seed de dados: 2 cursos com módulos, lições e exercícios reais
- [ ] Testar todos os endpoints no Postman

### Fase 3 – Frontend Core (Semana 3)
- [ ] Telas de auth (login, cadastro)
- [ ] Home com lista de cursos
- [ ] Tela de trilha do curso
- [ ] Tela de lição com exercícios de múltipla escolha
- [ ] Feedback imediato e conclusão de lição
- [ ] Integração com API (auth + cursos + lições)

### Fase 4 – Gamificação e Progresso (Semana 4)
- [ ] XP e níveis funcionando
- [ ] Streak diário
- [ ] Tela de progresso
- [ ] Conquistas básicas
- [ ] Revisão inteligente (sugestões)

### Fase 5 – Polimento e Entrega (Semana 5)
- [ ] Testes end-to-end do fluxo principal
- [ ] Ajustes de UI/UX
- [ ] Deploy final na AWS
- [ ] Documentação da API
- [ ] Apresentação

---

## 10. Conteúdo dos Cursos (Seed de Dados)

### Curso 1: Expo (React Native)
| Módulo | Lições |
|---|---|
| Fundamentos | O que é Expo, Criando projeto, Estrutura de pastas |
| Componentes | View, Text, Image, TouchableOpacity, FlatList |
| Navegação | Expo Router, Stack, Tabs, Parâmetros de rota |
| APIs | Fetch, Axios, REST APIs, Tratamento de erros |
| Armazenamento | AsyncStorage, SecureStore, Context API |
| Build e Deploy | EAS Build, Publicação na loja |

### Curso 2: AWS Nuvem
| Módulo | Lições |
|---|---|
| Conceitos de Cloud | O que é cloud, Modelos (IaaS/PaaS/SaaS), Regiões e AZs |
| IAM | Usuários, Grupos, Políticas, Roles |
| S3 | Buckets, Upload/Download, Permissões, Static hosting |
| EC2 | Instâncias, AMIs, Security Groups, Key Pairs |
| Lambda | Funções serverless, Triggers, Layers, Cold start |
| API Gateway | REST API, Rotas, Integração com Lambda, CORS |
| DynamoDB | Tabelas, PK/SK, Queries, GSI, Capacidade |

---

## 11. Pontos de Atenção

### Segurança
- Nunca expor credenciais AWS no código — usar variáveis de ambiente
- Validar JWT em todas as rotas protegidas (via Cognito Authorizer no API Gateway)
- Sanitizar inputs antes de salvar no DynamoDB

### Performance
- Usar React Query para cache das requisições no frontend
- Configurar TTL no DynamoDB para dados temporários (ex: sessões)
- Lazy loading de exercícios (não carregar tudo de uma vez)

### DynamoDB
- Planejar bem as queries antes de criar a tabela — DynamoDB não permite joins
- Usar Single Table Design para reduzir custo e latência
- Definir capacidade provisionada ou on-demand (on-demand é mais simples para MVP)

### Cognito
- Usar o fluxo `USER_PASSWORD_AUTH` para login simples
- Configurar email de verificação e recuperação de senha
- Guardar o `accessToken` e `refreshToken` no SecureStore do Expo

---

## 12. Dependências a Instalar

### Frontend
```bash
cd dualingo
npx expo install zustand @tanstack/react-query axios
npx expo install expo-secure-store
```

### Backend
```bash
mkdir backend && cd backend
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install @aws-sdk/client-cognito-identity-provider
npm install -D typescript serverless serverless-offline @types/aws-lambda
```

---

## 13. Checklist de Entrega

- [ ] App mobile funcional (iOS/Android)
- [ ] Autenticação via AWS Cognito
- [ ] 2 cursos com conteúdo real (Expo + AWS)
- [ ] Fluxo completo: login → curso → lição → exercício → XP
- [ ] Streak diário funcionando
- [ ] Progresso salvo no DynamoDB
- [ ] API deployada na AWS (Lambda + API Gateway)
- [ ] Revisão inteligente básica
- [ ] README com instruções de setup

---

*Documento gerado como guia de planejamento. Adapte conforme as decisões do grupo evoluírem.*
