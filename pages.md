#  Guia de Estudos – Projeto Dualingo (Expo)

## Objetivo do Projeto

O Dualingo é uma plataforma educacional inspirada no Duolingo.

O usuário pode:

* Fazer login
* Escolher cursos
* Acessar lições
* Responder exercícios
* Ganhar XP
* Evoluir de nível
* Desbloquear conquistas
* Acompanhar seu progresso

---

# Arquitetura do Projeto

```text
app/
components/
services/
store/
data/
constants/
types/
```

## Responsabilidade de cada pasta

| Pasta      | Responsabilidade          |
| ---------- | ------------------------- |
| app        | Telas e rotas             |
| components | Componentes reutilizáveis |
| services   | Comunicação com backend   |
| store      | Estados globais           |
| data       | Dados mockados            |
| constants  | Constantes da aplicação   |
| types      | Interfaces TypeScript     |

---

# Fluxo de Autenticação

## Arquivo

```text
app/(app)/_layout.tsx
```

## Responsabilidade

Auth Guard.

Protege todas as telas autenticadas.

## Fluxo

1. Verifica se existe userId no store.
2. Caso não exista, procura token salvo.
3. Se não encontrar token → Login.
4. Se encontrar token → busca dados do backend.
5. Hidrata os stores.
6. Libera acesso às telas.

## Perguntas Possíveis

* O que é um Auth Guard?
* Como funciona o login persistente?
* O que acontece após um F5?
* Qual a diferença entre token e userId?

---

# 🚪 Login

## Arquivo

```text
app/(auth)/login.tsx
```

## Responsabilidade

Autenticar usuário.

## Fluxo

1. Usuário digita email.
2. Usuário digita senha.
3. Sistema valida campos.
4. Backend autentica.
5. Tokens são salvos.
6. UserStore é hidratado.
7. Navega para Home.

## Perguntas Possíveis

* Quais validações são feitas?
* Por que salvar tokens?
* O que acontece se a senha estiver errada?

---

# 🏠 Home

## Arquivo

```text
app/(app)/home.tsx
```

## Responsabilidade

Tela principal do sistema.

## Fluxo

1. Verifica role do usuário.
2. Se admin → mostra painel administrativo.
3. Se aluno → mostra cursos.
4. Busca gamificação atualizada.
5. Atualiza stores.
6. Exibe XP, nível e streak.

## Perguntas Possíveis

* Como o sistema identifica um admin?
* Por que buscar dados do backend novamente?

---

# 📖 Cursos

## Arquivo

```text
app/(app)/course.tsx
```

## Responsabilidade

Exibir trilha de aprendizado.

## Fluxo

1. Recebe courseId.
2. Busca curso.
3. Busca status das lições.
4. Renderiza módulos.
5. Exibe progresso.
6. Permite abrir lições disponíveis.

## Perguntas Possíveis

* Como o sistema sabe quais lições estão bloqueadas?
* O que são overrides?
* Como funciona o desbloqueio progressivo?

---

#  Exercícios

## Arquivo

```text
app/(app)/question.tsx
```

## Responsabilidade

Executar uma lição.

## Fluxo

1. Recebe lessonId.
2. Busca exercícios.
3. Exibe pergunta.
4. Usuário responde.
5. Sistema valida resposta.
6. Exibe feedback.
7. Calcula porcentagem.
8. Atualiza progresso.
9. Atualiza XP.
10. Salva resultado.

## Regra Principal

```text
Aprovação >= 70%
```

## Perguntas Possíveis

* Como o XP é calculado?
* O que acontece se reprovar?
* Como funciona o feedback imediato?
* Por que usar answersRef?

---

#  Progresso

## Arquivo

```text
app/(app)/progress.tsx
```

## Responsabilidade

Mostrar evolução do aluno.

## Exibe

* XP
* Nível
* Streak
* Conquistas
* Recompensas

## Perguntas Possíveis

* Como funciona o resgate de XP?
* Como diferenciar conquistas bloqueadas?

---

#  Configurações

## Arquivo

```text
app/(app)/settings.tsx
```

## Responsabilidade

Gerenciar perfil.

## Funcionalidades

* Alterar nome
* Alterar foto
* Ver estatísticas
* Fazer logout

## Perguntas Possíveis

* Como funciona o logout?
* O que acontece ao alterar nome?

---

#  Comunicação com Backend

## Arquivo

```text
services/api.ts
```

## Responsabilidade

Configurar Axios.

## Funções

* Injetar token JWT
* Tratar erros
* Salvar tokens
* Remover tokens

## Perguntas Possíveis

* O que são interceptors?
* Como o sistema trata token expirado?
* O que acontece em erro 401?

---

## Arquivo

```text
services/progressService.ts
```

## Responsabilidade

Centralizar APIs de progresso.

## Principais Métodos

```text
getProgress()
getGamification()
claimAchievementReward()
unlockAchievement()
```

## Perguntas Possíveis

* Qual vantagem de usar services?
* Qual diferença entre unlock e claimReward?

---

#  Stores

## userStore.ts

### Responsabilidade

Dados do usuário.

### Armazena

* userId
* role
* username
* XP
* nível
* streak

### Perguntas Possíveis

* Por que armazenar dados no store?
* Qual diferença entre hydrateFromUser e hydrateFromGamification?

---

## progressStore.ts

### Responsabilidade

Controlar desbloqueio das lições.

### Conceito Principal

```text
Overrides
```

Overrides representam alterações feitas pelo aluno em relação ao estado original do curso.

### Perguntas Possíveis

* O que são overrides?
* Como a próxima lição é desbloqueada?

---

## achievementStore.ts

### Responsabilidade

Gerenciar conquistas.

### Funcionalidades

* Desbloquear conquista
* Resgatar recompensa
* Sincronizar backend

### Perguntas Possíveis

* O que acontece ao desbloquear conquista?
* Qual função do newlyUnlocked?

---

## gamificationStore.tsx

### Responsabilidade

Gerenciar:

* XP
* Nível
* Streak

### Perguntas Possíveis

* Como o nível é calculado?
* Como funciona o bônus de streak?

---

#  Dados Mockados

## mockCourses.ts

### Responsabilidade

Simular cursos.

Exemplo:

```text
Expo
AWS
```

### Perguntas Possíveis

* Por que usar mocks?
* Qual vantagem durante desenvolvimento?

---

## mockExercises.ts

### Responsabilidade

Simular exercícios.

### Estrutura

```text
lessonId
 └─ exercícios
```

### Perguntas Possíveis

* Como os exercícios são encontrados?
* Como cada lição se relaciona com seus exercícios?

---



