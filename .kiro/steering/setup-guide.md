# Guia de Setup — Como Inicializar o Projeto Dualingo

Este documento explica passo a passo como configurar e rodar o projeto do zero.
Serve tanto para desenvolvedores humanos quanto para agentes IA (Kiro).

---

## Pré-requisitos

- **Node.js** v18+ instalado
- **npm** v9+ instalado
- Terminal com acesso à pasta do projeto

---

## Estrutura do Projeto

```
Dualingo/
└── dualingo/              ← Raiz do código (git repo)
    ├── app/               ← Telas do Expo (frontend)
    ├── backend/           ← Servidor Express local (backend)
    ├── components/        ← Componentes React Native
    ├── services/          ← Chamadas à API (Axios)
    ├── store/             ← Estado global (Zustand + Context)
    ├── .env               ← ⚠️ PRECISA SER CRIADO (não está no git)
    └── backend/.env       ← ⚠️ PRECISA SER CRIADO (não está no git)
```

---

## Passo 1 — Instalar dependências

```bash
# Frontend (pasta dualingo/ dentro do repositório)
cd Dualingo/dualingo
npm install

# Backend (pasta dualingo/backend/ dentro do repositório)
cd backend
npm install
```

> **Atenção:** O repositório tem a estrutura `Dualingo/dualingo/`. O código fica dentro da segunda pasta `dualingo/`. NÃO confunda com `Dualingo/backend` (que não existe).

---

## Passo 2 — Criar os arquivos .env

### ⚠️ IMPORTANTE: Os arquivos `.env` NÃO estão no repositório (estão no .gitignore). Você PRECISA criá-los manualmente.

### Frontend (.env na raiz do dualingo/)

Crie o arquivo `dualingo/.env` com o conteúdo:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

> **Para emulador Android:** use `http://10.0.2.2:3001`
> **Para dispositivo físico:** use `http://SEU_IP_LOCAL:3001` (ex: `http://192.168.1.100:3001`)
> **Para web (navegador):** use `http://localhost:3001`

### Backend (.env dentro de dualingo/backend/)

Crie o arquivo `dualingo/backend/.env` com o conteúdo:

```env
PORT=3001
JWT_SECRET=dualingo-local-dev-secret-2024
```

> Existe um arquivo `backend/.env.example` como referência.

---

## Passo 3 — Iniciar o Backend

Abra um terminal e rode:

```bash
cd Dualingo/dualingo/backend
npm run dev:local
```

> **Caminho completo no Windows:** `C:\Users\...\Dualingo\dualingo\backend`

Deve aparecer:
```
🌱 Populando banco local...
✅ Banco local populado com sucesso!
🚀 Backend Dualingo rodando em http://localhost:3001
```

Para verificar: acesse http://localhost:3001/health no navegador.

---

## Passo 4 — Iniciar o Frontend

Abra **outro terminal** e rode:

```bash
cd Dualingo/dualingo
npx expo start --clear
```

> **Caminho completo no Windows:** `C:\Users\...\Dualingo\dualingo`

O `--clear` limpa o cache do Metro bundler (importante após criar o `.env`).

Depois pressione `w` para abrir no navegador, ou escaneie o QR code com o Expo Go.

---

## Passo 5 — Testar

1. Acesse o app no navegador (localhost:8081)
2. Crie uma conta na tela de registro
3. Faça login com o email/senha cadastrados
4. Complete uma lição e verifique o XP

### Rotas de debug do backend:
- http://localhost:3001/dev/users → Lista todos os usuários cadastrados
- http://localhost:3001/dev/db → Mostra todos os dados do banco
- http://localhost:3001/health → Verifica se o backend está rodando

---

## Resumo dos Comandos

| O que | Comando | Onde (pasta) |
|-------|---------|------|
| Instalar frontend | `npm install` | `Dualingo/dualingo/` |
| Instalar backend | `npm install` | `Dualingo/dualingo/backend/` |
| Rodar backend | `npm run dev:local` | `Dualingo/dualingo/backend/` |
| Rodar frontend | `npx expo start --clear` | `Dualingo/dualingo/` |
| Backend com hot-reload | `npm run dev:watch` | `Dualingo/dualingo/backend/` |

---

## Problemas Comuns

### "Não foi possível conectar ao servidor"
- O backend não está rodando. Inicie com `npm run dev:local` no terminal do backend.

### "expo-secure-store could not be found"
- Rode `npx expo install expo-secure-store` na pasta `dualingo/`.

### "axios could not be found"
- Rode `npm install axios` na pasta `dualingo/`.

### XP/streak zerado ao reabrir o app
- Certifique-se de que o backend está rodando antes de fazer login.
- O frontend busca os dados do backend ao entrar na Home.

### Erro 401 em loop no console
- Limpe o localStorage: no console do navegador, rode `localStorage.clear(); location.reload();`

### Backend perde dados ao reiniciar
- Os dados são salvos em `backend/data/db.json`. Se esse arquivo existir, os dados persistem.
- Se quiser resetar tudo, delete o arquivo `backend/data/db.json` e reinicie o backend.

---

## Para Agentes IA (Kiro)

Se você é um Kiro abrindo este projeto pela primeira vez:

1. Verifique se os arquivos `.env` existem (frontend e backend). Se não existirem, CRIE-OS conforme descrito acima.
2. O backend é um servidor Express local em `backend/src/local/server.ts` — NÃO depende da AWS para desenvolvimento.
3. O banco de dados é um arquivo JSON em `backend/data/db.json` — persiste entre reinícios.
4. A autenticação local usa JWT simples (não Cognito) — a chave está no `.env` do backend.
5. Todas as rotas da API estão documentadas em `backend/README.md`.
6. O frontend se conecta ao backend via Axios (`services/api.ts`) usando a URL do `.env`.
7. Ao fazer login, o frontend busca XP/streak/conquistas do backend e hidrata os stores locais.
