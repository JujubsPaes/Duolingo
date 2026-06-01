# 🦉 Dualingo

Plataforma mobile de aprendizado gamificado inspirada no Duolingo, focada no ensino de **Expo (React Native)** e **AWS Nuvem**. Desenvolvida com Expo + AWS como projeto colaborativo.

---

## 📋 Sobre o Projeto

O Dualingo oferece trilhas progressivas de aprendizado, exercícios interativos, gamificação (XP, streak, conquistas) e revisão inteligente baseada nos erros do usuário. O sistema é composto por um app mobile multiplataforma (iOS/Android/Web) integrado a uma API serverless na AWS.

---

## 👥 Integrantes da Equipe

| # | Nome |
|---|---|
| 1 | Andressa Bartolomeu |
| 2 | Carol Almeida |
| 3 | Felipe Cutiur |
| 4 | Ian Lucas |
| 5 | Julia Paes |
| 6 | Lucas Miguel |
| 7 | Marcela Mulato |
| 8 | Natalia Nogueira |
| 9 | Rodrigo Soares |

---

## 🚀 Stack Tecnológica

### Frontend
- **Expo (React Native)** — app mobile iOS/Android/Web
- **Expo Router** — navegação baseada em arquivos
- **TypeScript** — tipagem estática
- **Zustand** — gerenciamento de estado global
- **React Query (TanStack)** — cache e sincronização com a API
- **React Native Reanimated** — animações fluidas

### Backend
- **Node.js + TypeScript** — runtime do servidor
- **AWS Lambda** — funções serverless
- **AWS API Gateway** — endpoints REST
- **AWS DynamoDB** — banco de dados NoSQL (Single Table Design)
- **AWS Cognito** — autenticação e gerenciamento de usuários
- **AWS S3** — armazenamento de assets
- **Serverless Framework** — deploy da infraestrutura

---

## 📁 Estrutura do Projeto

```
dualingo/
├── app/
│   ├── (auth)/          ← telas de autenticação (login, cadastro)
│   ├── (app)/           ← telas pós-login (home, cursos, lições...)
│   ├── +html.tsx        ← template HTML para versão web
│   ├── _layout.tsx      ← root layout e configuração de rotas
│   └── index.tsx        ← redireciona para login
├── components/
│   └── ui/
│       ├── Button.tsx       ← botão reutilizável (primary/secondary/disabled)
│       ├── Input.tsx        ← input com modo texto e senha
│       ├── Spinner.tsx      ← arco giratório animado
│       ├── ScreenLoader.tsx ← overlay de loading com fade-out
│       └── FadeSlideIn.tsx  ← animação de entrada fade + slide-up
├── store/               ← estado global (Zustand)
├── services/            ← integração com a API
├── types/               ← interfaces TypeScript
└── backend/             ← funções Lambda e infraestrutura AWS
```

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Instalação

```bash
cd dualingo
npm install
```

### Iniciar o app

```bash
npx expo start
```

Opções disponíveis no terminal:
- Pressione `a` para abrir no Android emulator
- Pressione `i` para abrir no iOS simulator
- Pressione `w` para abrir no navegador (web)
- Escaneie o QR code com o app **Expo Go** no seu celular

---

## 🔐 Usuário de Teste (Mock)

Enquanto o backend não está integrado, use as credenciais abaixo para testar o login:

| Campo | Valor |
|---|---|
| Email | `teste@dualingo.com` |
| Senha | `123456` |

---

## 🎨 Design System

| Elemento | Cor |
|---|---|
| Fundo das telas | `#000721` |
| Botão primário | `#093AFF` |
| Borda botão primário | `#0026BD` |
| Botão pressionado | `#32374A` |
| Fundo do input | `#FFFFFF` |
| Borda do input | `#E6E6E6` |
| Título "Dualingo" | `#093AFF` |
| Erro | `#FF3B30` |
| Border radius (inputs/botões) | `15` |

---

## 📝 Regras de Negócio

- Mínimo de **70% de acertos** para concluir uma lição
- Lições desbloqueadas progressivamente (uma por vez)
- **XP base por lição:** 10 XP | **Bônus acima de 90%:** +5 XP | **Bônus streak 7 dias:** +10 XP
- Streak incrementa ao completar ao menos 1 lição por dia; reseta após 24h sem atividade
- Exercícios com taxa de erro > 50% são marcados para revisão inteligente

---

<div align="center">

Desenvolvido com ❤️ pela equipe Dualingo

</div>
