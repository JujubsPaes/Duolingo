# PROJETO DUOLINGO EXPO - RESUMÃO PARA PROVA

# 1. OBJETIVO DO PROJETO

O projeto é uma plataforma educacional inspirada no Duolingo.

Ao invés de ensinar idiomas, a aplicação ensina conteúdos das disciplinas do curso.

O usuário:

* Faz login
* Escolhe um curso
* Acessa lições
* Responde perguntas
* Ganha XP
* Evolui de nível
* Mantém streak
* Desbloqueia conquistas
* Tem seu progresso salvo no backend

Tecnologias principais:

* React Native
* Expo
* Expo Router
* TypeScript
* Zustand
* Axios
* AsyncStorage

---

# 2. COMO INICIAR O PROJETO

Instalar dependências:

```bash
npm install
```

Executar projeto:

```bash
npx expo start
```

ou

```bash
npm start
```

Abrir:

* Android Emulator
* Expo Go
* Web Browser

---

# 3. PRINCIPAIS PASTAS

## app/

Contém todas as telas.

Exemplos:

```text
app/
 ├── (auth)
 ├── (app)
 ├── _layout.tsx
```

---

## services/

Comunicação com backend.

Exemplos:

```text
services/
 ├── api.ts
 ├── lessonService.ts
 ├── progressService.ts
```

---

## store/

Estados globais usando Zustand.

Exemplos:

```text
store/
 ├── userStore.ts
 ├── achievementStore.ts
```

---

## constants/

Constantes da aplicação.

Exemplo:

```text
constants/
 ├── colors.ts
```

---

## components/

Componentes reutilizáveis.

Exemplos:

```text
components/
 ├── ExerciseCard.tsx
 ├── Header.tsx
 ├── Button.tsx
```

---

# 4. PRINCIPAIS ARQUIVOS

## app/_layout.tsx

Arquivo principal do Expo Router.

Funções:

* Define navegação
* Define rotas
* Renderiza Stack
* É o primeiro arquivo carregado

Pergunta possível:

"O que acontece quando o aplicativo inicia?"

Resposta:

O Expo Router carrega o arquivo _layout.tsx e monta toda a estrutura de navegação da aplicação.

---

## app/(auth)/login.tsx

Tela de login.

Funções:

* Recebe email e senha
* Chama backend
* Salva token
* Redireciona para área autenticada

---

## app/(app)/_layout.tsx

Auth Guard.

Funções:

* Verifica token
* Recupera sessão
* Redireciona para login se necessário

Fluxo:

1. Verifica se existe userId
2. Verifica token salvo
3. Busca dados do usuário
4. Hidrata stores
5. Libera acesso

---

## app/(app)/home.tsx

Tela principal.

Funções:

* Lista cursos
* Mostra progresso
* Mostra XP
* Mostra streak

---

## app/(app)/question.tsx

Tela responsável pelas perguntas.

Funções:

* Carregar exercícios
* Exibir alternativas
* Corrigir respostas
* Calcular acertos
* Atualizar progresso
* Concluir lição

---

## services/api.ts

Centraliza chamadas HTTP.

Funções:

* Configuração Axios
* URL base
* Armazenamento de token

---

## store/userStore.ts

Armazena:

* Nome
* ID
* XP
* Nível
* Role
* Streak

---

## store/achievementStore.ts

Armazena:

* Conquistas
* Badges
* Progresso das conquistas

---

# 5. FLUXO COMPLETO DO SISTEMA

Usuário abre aplicativo

↓

Tela Login

↓

Backend valida usuário

↓

Token salvo no AsyncStorage

↓

Home

↓

Escolhe curso

↓

Escolhe lição

↓

Question.tsx

↓

Responde perguntas

↓

Sistema calcula nota

↓

Se >= 70%

↓

Lição concluída

↓

XP atualizado

↓

Conquistas verificadas

↓

Backend recebe progresso

---

# 6. EXPLICAÇÃO DE 10 LINHAS IMPORTANTES

## 1

```ts
const [ready, setReady] = useState(false);
```

Controla quando a aplicação está pronta para renderizar.

---

## 2

```ts
const userId = useUserStore((s) => s.userId);
```

Obtém o ID do usuário armazenado globalmente.

---

## 3

```ts
const token = await getStorageItem(TOKEN_KEYS.ACCESS);
```

Recupera token salvo localmente.

---

## 4

```ts
router.replace("/(auth)/login");
```

Redireciona para login.

---

## 5

```ts
const data = await progressService.getGamification();
```

Busca progresso do usuário no backend.

---

## 6

```ts
useUserStore.getState().hydrateFromGamification(data);
```

Atualiza o estado global do usuário.

---

## 7

```ts
const [exerciseIndex, setExerciseIndex] = useState(0);
```

Controla pergunta atual.

---

## 8

```ts
const [selectedAnswerId, setSelectedAnswerId] = useState(null);
```

Armazena resposta selecionada.

---

## 9

```ts
const isCorrect = selectedAnswerId === exercise.correctAnswerId;
```

Verifica se a resposta está correta.

---

## 10

```ts
lessonService.completeLesson(...)
```

Envia resultado final para o backend.

---

# 7. O QUE É EXPO ROUTER?

Sistema de navegação baseado em arquivos.

Exemplo:

```text
app/home.tsx
```

vira automaticamente:

```text
/home
```

Vantagens:

* Navegação automática
* Menos configuração
* Organização simples

---

# 8. O QUE É ZUSTAND?

Biblioteca de gerenciamento de estado.

Permite compartilhar dados entre telas.

Exemplo:

* usuário
* xp
* nível
* conquistas

Sem precisar passar props.

---

# 9. O QUE É ASYNC STORAGE?

Banco local do celular.

Usado para armazenar:

* token JWT
* configurações
* sessão

Permite que o usuário continue logado após fechar o aplicativo.

---

# 10. PERGUNTAS QUE PODEM CAIR

## 1

Como iniciar o projeto?

Resposta:

```bash
npm install
npx expo start
```

---

## 2

Qual arquivo é carregado primeiro?

Resposta:

```text
app/_layout.tsx
```

---

## 3

O que faz o Expo Router?

Resposta:

Cria navegação baseada em arquivos.

---

## 4

O que faz o AsyncStorage?

Resposta:

Armazena dados localmente.

---

## 5

O que faz o Zustand?

Resposta:

Gerencia estados globais.

---

## 6

O que acontece quando o usuário faz login?

Resposta:

Backend valida, retorna token, token é salvo e o usuário é redirecionado para Home.

---

## 7

Qual arquivo protege as rotas autenticadas?

Resposta:

```text
app/(app)/_layout.tsx
```

---

## 8

Como o sistema sabe se o usuário já está logado?

Resposta:

Verificando o token salvo no AsyncStorage.

---

## 9

O que acontece ao concluir uma lição?

Resposta:

O progresso é atualizado, XP é concedido e o backend é notificado.

---

## 10

Qual é a função do question.tsx?

Resposta:

Gerenciar perguntas, respostas, correção e conclusão da lição.
