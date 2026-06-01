# 🔗 Guia de Integração Frontend ↔ Backend — Dualingo

Este documento explica como o frontend e o backend estão conectados, como rodar tudo localmente e como fazer deploy futuramente.

---

## 📋 O que foi feito

### Backend Local (Express)
- Criado servidor Express em `backend/src/local/` que emula o API Gateway + Lambda
- Banco de dados em memória (simula DynamoDB Single Table Design)
- Autenticação via JWT local (simula Cognito)
- Seed automático com 2 cursos, 10 módulos, 50 lições e 150 exercícios
- Todas as 19 rotas da API implementadas e funcionando

### Frontend (Integração)
- Tela de **Login** agora chama `POST /auth/login` no backend real
- Tela de **Register** agora chama `POST /auth/register` no backend real
- Tela de **Forgot Password** agora chama `POST /auth/forgot-password`
- Tela de **Settings** agora salva alterações de perfil via `PUT /auth/profile`
- `api.ts` configurado para apontar para `http://localhost:3001`
- Interceptor de requisição injeta o token JWT automaticamente
- Interceptor de resposta trata erros 401 (token expirado)

### Arquitetura
```
Expo App (React Native)
    ↓ HTTP (Axios + JWT)
Express Server (localhost:3001)
    ↓ Banco em memória (Map)
Dados persistem enquanto o servidor roda
```

Em produção:
```
Expo App → API Gateway → Lambda → DynamoDB / Cognito
```

---

## 🚀 Como Rodar o Projeto

### 1. Backend

```bash
# Entrar na pasta do backend
cd dualingo/backend

# Instalar dependências (já feito)
npm install

# Rodar o servidor local
npm run dev:local

# Ou com hot-reload (reinicia ao salvar):
npm run dev:watch
```

O servidor inicia em `http://localhost:3001`.

### 2. Frontend

```bash
# Entrar na pasta do frontend
cd dualingo

# Instalar dependências
npm install

# Rodar o Expo
npm start
```

### 3. Configurar a URL da API

O arquivo `.env` na raiz do frontend define a URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

**Para dispositivo físico**, troque pelo IP da sua máquina:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
```

**Para emulador Android**:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

---

## 🧪 Como Testar as Rotas da API

### Usando curl ou Postman:

**1. Criar conta:**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@teste.com", "password": "123456"}'
```

**2. Fazer login:**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@teste.com", "password": "123456"}'
```

Resposta inclui o `accessToken`. Use-o nas próximas requisições:

**3. Listar cursos (rota protegida):**
```bash
curl http://localhost:3001/courses \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**4. Buscar lição com exercícios:**
```bash
curl http://localhost:3001/lessons/lesson-expo-1-1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**5. Concluir lição:**
```bash
curl -X POST http://localhost:3001/lessons/lesson-expo-1-1/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"answers": {"expo-1-1-ex1": "a", "expo-1-1-ex2": "b", "expo-1-1-ex3": "true"}}'
```

**6. Ver gamificação:**
```bash
curl http://localhost:3001/gamification \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🗂️ Estrutura de Arquivos Alterados/Criados

```
backend/
├── src/local/                    ← NOVO: servidor Express local
│   ├── server.ts                 ← Ponto de entrada do servidor
│   ├── database.ts               ← Banco em memória (simula DynamoDB)
│   ├── auth-middleware.ts        ← JWT local (simula Cognito Authorizer)
│   ├── seed-local.ts             ← Popula o banco com dados dos cursos
│   └── routes/
│       ├── auth.ts               ← POST /auth/register, /login, /forgot-password, PUT /profile
│       ├── courses.ts            ← GET /courses, /:id, /:id/modules/:moduleId, POST /:id/start
│       ├── lessons.ts            ← GET /:id, POST /:id/complete, /:id/repeat
│       ├── progress.ts           ← GET /progress, /:courseId
│       ├── gamification.ts       ← GET /gamification, POST /achievements/:id/claim, GET /history
│       └── review.ts             ← GET /review/suggestions, /review/exercises
├── .env                          ← NOVO: variáveis de ambiente locais
├── .env.example                  ← NOVO: template de variáveis
├── tsconfig.json                 ← NOVO: configuração TypeScript
└── package.json                  ← ATUALIZADO: novos scripts e dependências

dualingo/
├── .env                          ← NOVO: EXPO_PUBLIC_API_URL
├── services/api.ts               ← ATUALIZADO: URL aponta para localhost:3001
├── app/(auth)/login.tsx          ← ATUALIZADO: integrado com authService.login()
├── app/(auth)/register.tsx       ← ATUALIZADO: integrado com authService.register()
└── app/(app)/settings.tsx        ← ATUALIZADO: integrado com authService.updateProfile()
```

---

## 🔐 Como Funciona a Autenticação

1. **Registro**: Frontend envia nome/email/senha → Backend cria usuário com senha hash (bcrypt) → Retorna sucesso
2. **Login**: Frontend envia email/senha → Backend valida → Retorna tokens JWT + dados do usuário
3. **Rotas protegidas**: Frontend envia token no header `Authorization: Bearer <token>` → Backend valida o JWT → Processa a requisição
4. **Persistência**: Tokens são salvos no `expo-secure-store` (criptografado no dispositivo)
5. **Logout**: Remove tokens do SecureStore

---

## 🌐 Deploy Futuro (Produção)

### Opção 1: AWS (Serverless Framework) — Recomendado
O backend já está 100% preparado para deploy na AWS:

```bash
cd backend

# Configurar credenciais AWS
aws configure

# Criar User Pool no Cognito e preencher .env com os IDs

# Deploy
npm run deploy
```

Após o deploy, o Serverless Framework retorna a URL do API Gateway. Atualize o `.env` do frontend:
```env
EXPO_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### Opção 2: Railway / Render (Express)
Para deploy rápido do servidor Express local:

1. Crie um `Procfile` ou configure o start command: `npm run dev:local`
2. Configure as variáveis de ambiente no painel do serviço
3. Troque o banco em memória por um banco real (MongoDB Atlas, PostgreSQL, etc.)

### Opção 3: Vercel (Serverless Functions)
Adapte cada rota para uma Vercel Serverless Function em `api/`.

---

## ⚡ Melhorias Recomendadas

### Segurança
- [ ] Implementar refresh token automático (quando o access token expirar)
- [ ] Rate limiting nas rotas de auth (prevenir brute force)
- [ ] Validação de input mais robusta (express-validator)
- [ ] HTTPS em produção (obrigatório)

### Performance
- [ ] Cache de cursos/módulos no frontend (React Query já está no package.json)
- [ ] Paginação no histórico de lições
- [ ] Compressão gzip nas respostas do Express

### Funcionalidades
- [ ] Upload de avatar para S3 (ou Cloudinary)
- [ ] Notificações push para lembrar do streak
- [ ] Ranking entre usuários
- [ ] Modo offline com sincronização posterior

---

## 📝 Variáveis de Ambiente

### Backend (.env)
| Variável | Descrição | Valor Local |
|----------|-----------|-------------|
| `PORT` | Porta do servidor | `3001` |
| `JWT_SECRET` | Chave para assinar tokens | `dualingo-local-dev-secret-2024` |
| `COGNITO_USER_POOL_ID` | ID do User Pool (produção) | — |
| `COGNITO_CLIENT_ID` | ID do Client (produção) | — |
| `DYNAMODB_TABLE` | Nome da tabela (produção) | `duolingo-app` |
| `AWS_REGION` | Região AWS (produção) | `us-east-1` |

### Frontend (.env)
| Variável | Descrição | Valor Local |
|----------|-----------|-------------|
| `EXPO_PUBLIC_API_URL` | URL base da API | `http://localhost:3001` |
