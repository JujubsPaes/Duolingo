# 🔧 Dualingo — Backend

API serverless construída com **AWS Lambda + API Gateway + DynamoDB + Cognito**.  
Para desenvolvimento local, usa um **servidor Express** com banco em memória que emula toda a infraestrutura AWS.

---

## 🚀 Como Iniciar o Backend

### 1. Instalar dependências

```bash
cd dualingo/backend
npm install
```

### 2. Iniciar o servidor local

```bash
npm run dev:local
```

O servidor inicia em **http://localhost:3001** e exibe todas as rotas disponíveis no terminal.

> **Dica:** Use `npm run dev:watch` para reiniciar automaticamente ao salvar arquivos.

### 3. Verificar se está rodando

Acesse no navegador: **http://localhost:3001/health**

Deve retornar:
```json
{ "status": "ok", "timestamp": "2026-05-28T22:00:00.000Z" }
```

---

## 🛠️ Rotas de Desenvolvedor (Debug)

O backend possui rotas especiais para facilitar o desenvolvimento. **Não existem em produção.**

| URL | O que mostra |
|-----|-------------|
| http://localhost:3001/dev/users | Lista todos os usuários cadastrados (nome, email, XP, nível, streak) |
| http://localhost:3001/dev/db | Mostra **todos** os dados do banco (cursos, lições, progresso, conquistas, etc.) |

### Exemplo de resposta `/dev/users`:
```json
{
  "total": 2,
  "users": [
    {
      "userId": "abc-123",
      "name": "João",
      "email": "joao@teste.com",
      "xp": 15,
      "level": 1,
      "streak": 1,
      "createdAt": "2026-05-28T22:00:00.000Z"
    }
  ]
}
```

> **Nota:** O banco é em memória. Se reiniciar o backend, os usuários cadastrados são perdidos (os cursos e lições são recriados automaticamente pelo seed).

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── local/                      ← Servidor Express para desenvolvimento
│   │   ├── server.ts               ← Ponto de entrada (npm run dev:local)
│   │   ├── database.ts             ← Banco em memória (simula DynamoDB)
│   │   ├── auth-middleware.ts      ← JWT local (simula Cognito Authorizer)
│   │   ├── seed-local.ts           ← Popula o banco com cursos/lições
│   │   └── routes/
│   │       ├── auth.ts             ← Register, Login, Forgot Password, Profile
│   │       ├── courses.ts          ← Listar cursos, módulos, iniciar curso
│   │       ├── lessons.ts          ← Buscar lição, concluir, repetir
│   │       ├── progress.ts         ← Progresso geral e por curso
│   │       ├── gamification.ts     ← XP, streak, conquistas, histórico
│   │       └── review.ts           ← Revisão inteligente
│   ├── functions/                   ← Handlers Lambda (deploy AWS)
│   │   ├── auth/
│   │   │   ├── register.ts         ← POST /auth/register
│   │   │   ├── login.ts            ← POST /auth/login
│   │   │   ├── forgotPassword.ts   ← POST /auth/forgot-password
│   │   │   └── updateProfile.ts    ← PUT /auth/profile
│   │   ├── courses/
│   │   │   ├── list.ts             ← GET /courses
│   │   │   ├── get.ts              ← GET /courses/{id}
│   │   │   ├── getModule.ts        ← GET /courses/{id}/modules/{moduleId}
│   │   │   └── start.ts            ← POST /courses/{id}/start
│   │   ├── lessons/
│   │   │   ├── get.ts              ← GET /lessons/{id}
│   │   │   ├── complete.ts         ← POST /lessons/{id}/complete
│   │   │   └── repeat.ts           ← POST /lessons/{id}/repeat
│   │   ├── progress/
│   │   │   ├── get.ts              ← GET /progress
│   │   │   └── getCourse.ts        ← GET /progress/{courseId}
│   │   ├── gamification/
│   │   │   ├── get.ts              ← GET /gamification
│   │   │   ├── claimAchievement.ts ← POST /gamification/achievements/{id}/claim
│   │   │   └── history.ts          ← GET /history
│   │   └── review/
│   │       ├── getSuggestions.ts    ← GET /review/suggestions
│   │       └── getExercises.ts     ← GET /review/exercises
│   ├── lib/
│   │   ├── dynamo.ts    ← Cliente DynamoDB + padrões de chave
│   │   ├── cognito.ts   ← Cliente Cognito
│   │   ├── auth.ts      ← Extrai userId do token JWT
│   │   └── response.ts  ← Helpers de resposta HTTP
│   ├── types/
│   │   └── index.ts     ← Interfaces TypeScript de todos os registros
│   └── seed/
│       └── seed.ts      ← Popula o DynamoDB real (produção)
├── .env                  ← Variáveis de ambiente locais
├── .env.example          ← Template de variáveis
├── serverless.yml        ← Configuração do Serverless Framework (deploy AWS)
├── tsconfig.json
└── package.json
```

---

## 📌 Rotas da API

### Auth (públicas)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Fazer login (retorna tokens + dados do usuário) |
| POST | `/auth/forgot-password` | Recuperação de senha |

### Auth (protegida)
| Método | Rota | Descrição |
|--------|------|-----------|
| PUT | `/auth/profile` | Atualizar nome/avatar |

### Cursos (protegidas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/courses` | Listar todos os cursos |
| GET | `/courses/:id` | Detalhes do curso + módulos |
| GET | `/courses/:id/modules/:moduleId` | Módulo + lições com status |
| POST | `/courses/:id/start` | Iniciar um curso |

### Lições (protegidas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/lessons/:id` | Lição com exercícios (sem resposta correta) |
| POST | `/lessons/:id/complete` | Concluir lição (envia respostas) |
| POST | `/lessons/:id/repeat` | Repetir lição |

### Progresso (protegidas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/progress` | Progresso em todos os cursos |
| GET | `/progress/:courseId` | Progresso em um curso específico |

### Gamificação (protegidas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/gamification` | XP, nível, streak, conquistas |
| POST | `/gamification/achievements/:id/claim` | Resgatar recompensa |
| GET | `/history` | Histórico de lições completadas |

### Revisão Inteligente (protegidas)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/review/suggestions` | Lições sugeridas para revisão |
| GET | `/review/exercises` | Exercícios frágeis para praticar |

---

## 🗄️ Modelo de Dados (DynamoDB — Single Table Design)

Tabela: `duolingo-app`

| Entidade | PK | SK |
|----------|----|----|
| Usuário | `USER#<userId>` | `PROFILE` |
| Curso | `COURSE#<courseId>` | `METADATA` |
| Módulo | `COURSE#<courseId>` | `MODULE#<moduleId>` |
| Lição | `MODULE#<moduleId>` | `LESSON#<lessonId>` |
| Exercício | `LESSON#<lessonId>` | `EXERCISE#<exerciseId>` |
| Progresso | `USER#<userId>` | `PROGRESS#<courseId>` |
| Histórico | `USER#<userId>` | `HISTORY#<timestamp>` |
| Conquista | `USER#<userId>` | `ACHIEVEMENT#<id>` |
| Erro recorrente | `USER#<userId>` | `ERROR#<exerciseId>` |

---

## 🎮 Regras de Negócio

### Conclusão de Lição (`POST /lessons/:id/complete`)
- Mínimo de **70% de acerto** para passar
- XP base: **10 XP** por lição
- Bônus: **+5 XP** se acerto > 90%
- Bônus: **+500 XP** a cada 7 dias de streak
- Erros são registrados por exercício para a revisão inteligente

### Streak
- Incrementa se o usuário completar ≥ 1 lição no dia
- Reseta para 1 se passar mais de 1 dia sem atividade

### Desbloqueio Progressivo
- Lição só fica `available` após a anterior ser `completed`
- Status calculado em `GET /courses/:id/modules/:moduleId`

### Conquistas (desbloqueio automático)
| ID | Condição | Recompensa |
|----|----------|------------|
| `first-lesson` | Completar a primeira lição | +250 XP |
| `streak-7` | 7 dias consecutivos | +500 XP |
| `perfect-score` | 100% de acerto em uma lição | +300 XP |
| `module-complete` | Concluir todas as lições de um módulo | +750 XP |
| `course-complete` | Concluir um curso inteiro | +2500 XP |

---

## 🔐 Autenticação

### Desenvolvimento local
- Usa **JWT simples** assinado com uma chave secreta fixa
- Token gerado no login, validado pelo middleware em rotas protegidas
- Tokens salvos no `localStorage` (web) ou `expo-secure-store` (mobile)

### Produção (AWS)
- Usa **AWS Cognito** para autenticação
- Token validado pelo **Cognito Authorizer** no API Gateway
- O `userId` é extraído do claim `sub` do JWT

### Header obrigatório em rotas protegidas:
```
Authorization: Bearer <accessToken>
```

---

## 📦 Envelope de Resposta

Todas as respostas seguem o padrão:

```json
// Sucesso
{ "success": true, "data": { ... } }

// Erro
{ "success": false, "message": "Descrição do erro" }
```

---

## 🌐 Deploy na AWS (Produção)

### 1. Configurar variáveis de ambiente
Crie um `.env` com os dados do Cognito e DynamoDB:
```env
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
DYNAMODB_TABLE=duolingo-app
AWS_REGION=us-east-1
```

### 2. Popular o DynamoDB com dados reais
```bash
npx ts-node src/seed/seed.ts
```

### 3. Deploy
```bash
npm run deploy          # ambiente dev
npm run deploy:prod     # ambiente prod
```

---

## 📋 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev:local` | Inicia o servidor Express local (porta 3001) |
| `npm run dev:watch` | Inicia com hot-reload (reinicia ao salvar) |
| `npm run build` | Compila o TypeScript |
| `npm run dev` | Inicia via Serverless Offline (emula API Gateway) |
| `npm run deploy` | Deploy na AWS (ambiente dev) |
| `npm run deploy:prod` | Deploy na AWS (ambiente prod) |
| `npm run seed` | Popula o DynamoDB real com dados dos cursos |
