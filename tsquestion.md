# Guia de Estudos – Projeto Duolingo Expo

## Objetivo do Projeto

O projeto consiste em uma plataforma educacional inspirada no Duolingo.

Ao invés de ensinar idiomas, o aplicativo ensina conteúdos das disciplinas do curso.

O usuário pode:

* Fazer login
* Escolher cursos
* Acessar lições
* Responder perguntas
* Ganhar XP
* Evoluir de nível
* Desbloquear conquistas
* Acompanhar seu progresso

---

# Estrutura Geral do Projeto

```text
app/
components/
services/
store/
data/
constants/
types/
```

---

# Principais Pastas

## app/

Responsável pelas telas e rotas da aplicação.

Exemplos:

```text
app/
 ├── _layout.tsx
 ├── (auth)
 └── (app)
```

### O que faz?

O Expo Router utiliza essa pasta para criar automaticamente as rotas da aplicação.

---

## app/(auth)

Contém telas públicas.

Exemplos:

```text
(auth)
 ├── login.tsx
 └── register.tsx
```

### O que faz?

Agrupa telas que não exigem autenticação.

---

## app/(app)

Contém telas protegidas.

Exemplos:

```text
(app)
 ├── home.tsx
 ├── course.tsx
 ├── question.tsx
 ├── progress.tsx
 └── settings.tsx
```

### O que faz?

Agrupa todas as telas que exigem usuário autenticado.

---

## components/

Componentes reutilizáveis.

Exemplos:

```text
components/
 ├── Button.tsx
 ├── CourseCard.tsx
 └── ExerciseCard.tsx
```

### O que faz?

Evita repetição de código e facilita manutenção.

---

## services/

Responsável pela comunicação com o backend.

Exemplos:

```text
services/
 ├── api.ts
 ├── lessonService.ts
 └── progressService.ts
```

### O que faz?

Realiza chamadas HTTP para enviar e buscar dados.

---

## store/

Gerenciamento de estado global utilizando Zustand.

Exemplos:

```text
store/
 ├── userStore.ts
 ├── progressStore.ts
 └── achievementStore.ts
```

### O que faz?

Compartilha dados entre várias telas.

---

## data/

Dados mockados utilizados durante desenvolvimento.

Exemplos:

```text
data/
 ├── mockCourses.ts
 └── mockExercises.ts
```

### O que faz?

Armazena cursos, lições e exercícios simulados.

---

## types/

Interfaces TypeScript.

Exemplo:

```ts
interface Exercise {
  id: string;
  question: string;
}
```

### O que faz?

Define a estrutura dos dados da aplicação.

---

# Como Iniciar o Projeto

Instalar dependências:

```bash
npm install
```

Executar aplicação:

```bash
npx expo start
```

ou

```bash
npm start
```

---

# Fluxo Completo do Sistema

1. Usuário abre o aplicativo.
2. Tela de login é exibida.
3. Backend valida usuário.
4. Token JWT é salvo.
5. Usuário acessa Home.
6. Escolhe um curso.
7. Escolhe uma lição.
8. Acessa question.tsx.
9. Responde exercícios.
10. Sistema calcula desempenho.
11. XP é atualizado.
12. Progresso é salvo.
13. Backend recebe os dados.

---

# Principais Arquivos

## app/_layout.tsx

Arquivo principal de navegação.

### Funções

* Inicializa navegação
* Define estrutura global
* Configura Stack Navigation

---

## app/(app)/_layout.tsx

Auth Guard.

### Funções

* Verifica token
* Recupera sessão
* Busca dados do backend
* Hidrata stores
* Bloqueia usuários não autenticados

---

## app/(app)/question.tsx

Tela responsável pelas perguntas.

### Funções

* Carregar exercícios
* Exibir alternativas
* Verificar respostas
* Calcular nota
* Atualizar progresso
* Concluir lições

---

## services/api.ts

Centraliza configuração da API.

### Funções

* Configurar Axios
* Definir URL base
* Gerenciar tokens

---

## store/userStore.ts

Responsável pelos dados do usuário.

### Armazena

* userId
* username
* xp
* level
* role
* streak

---

## store/progressStore.ts

Responsável pelo progresso.

### Armazena

* lições concluídas
* porcentagem de progresso
* histórico

---

# Explicação de 10 Linhas Importantes

## 1

```ts
const [ready, setReady] = useState(false);
```

Controla quando a tela está pronta para ser exibida.

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

Busca o token salvo no dispositivo.

---

## 4

```ts
if (!token)
```

Verifica se existe uma sessão válida.

---

## 5

```ts
router.replace("/(auth)/login");
```

Redireciona o usuário para a tela de login.

---

## 6

```ts
const data = await progressService.getGamification();
```

Busca informações do usuário no backend.

---

## 7

```ts
useUserStore.getState().hydrateFromGamification(data);
```

Atualiza os dados do usuário no store.

---

## 8

```ts
const [exerciseIndex, setExerciseIndex] = useState(0);
```

Controla qual pergunta está sendo exibida.

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

Envia para o backend que a lição foi concluída.

---

# Perguntas Técnicas que Podem Cair

## 1

Explique a estrutura de pastas do projeto.

---

## 2

Qual a função da pasta app?

Resposta:

Criar e organizar as rotas da aplicação.

---

## 3

Qual a diferença entre services e stores?

Resposta:

Services comunicam com o backend.

Stores armazenam dados localmente na aplicação.

---

## 4

Como o sistema mantém o usuário logado?

Resposta:

Utilizando token salvo no AsyncStorage.

---

## 5

O que acontece quando o usuário dá F5?

Resposta:

O sistema recupera o token e busca os dados novamente no backend.

---

## 6

Como as perguntas são carregadas?

Resposta:

Question.tsx busca os exercícios da lição selecionada.

---

## 7

Como o progresso é atualizado?

Resposta:

Após concluir a lição, os stores e o backend recebem as atualizações.

---

## 8

Onde ficam cadastrados os cursos?

Resposta:

No arquivo mockCourses.ts.

---

## 9

Onde ficam cadastradas as perguntas?

Resposta:

No arquivo mockExercises.ts.

---

## 10

Explique o fluxo completo de responder uma questão.

Resposta:

* Usuário seleciona alternativa
* Sistema verifica resposta
* Salva resultado
* Exibe próxima pergunta
* Calcula nota final
* Atualiza progresso
* Envia resultado ao backend

---

# Perguntas que Eu Apostaria que Podem Cair

1. Como funciona o login?
2. Como o sistema mantém a sessão?
3. O que faz o app/(app)/_layout.tsx?
4. O que faz o question.tsx?
5. Como o progresso é salvo?
6. Como o XP é calculado?
7. Qual a função do userStore?
8. Qual a função do progressStore?
9. Como o frontend conversa com o backend?
10. Explique 10 linhas de código do projeto.

---

# Resumo Final

Arquivos mais importantes para estudar:

```text
app/_layout.tsx
app/(app)/_layout.tsx
app/(app)/question.tsx
services/api.ts
services/progressService.ts
store/userStore.ts
store/progressStore.ts
data/mockCourses.ts
data/mockExercises.ts
```

Se souber explicar esses arquivos, você consegue explicar praticamente todo o funcionamento do projeto.
