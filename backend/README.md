# Dualingo Backend

Backend serverless da plataforma de aprendizado gamificado Dualingo.

## Stack

- **Runtime**: Node.js 20 + TypeScript
- **Infraestrutura**: AWS Lambda + API Gateway + DynamoDB
- **Deploy**: Serverless Framework
- **Banco de dados**: DynamoDB (Single Table Design)

## Setup

```bash
# Instalar dependências
npm install

# Rodar localmente (requer serverless-offline)
npm run dev

# Build do TypeScript
npm run build

# Deploy para AWS
npm run deploy
```

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DYNAMODB_TABLE` | Nome da tabela DynamoDB (auto-configurado pelo Serverless) |

## Endpoints Admin

### Cursos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/courses` | Criar curso |
| PUT | `/admin/courses/{id}` | Editar curso |
| DELETE | `/admin/courses/{id}` | Excluir curso |
| GET | `/admin/courses` | Listar cursos |

### Módulos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/modules` | Criar módulo |
| PUT | `/admin/modules/{id}` | Editar módulo (body: courseId) |
| DELETE | `/admin/modules/{id}?courseId=xxx` | Excluir módulo |
| GET | `/admin/modules?courseId=xxx` | Listar módulos do curso |

### Lições
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/lessons` | Criar lição |
| PUT | `/admin/lessons/{id}` | Editar lição (body: moduleId) |
| DELETE | `/admin/lessons/{id}?moduleId=xxx` | Excluir lição |
| GET | `/admin/lessons?moduleId=xxx` | Listar lições do módulo |

### Exercícios
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/exercises` | Criar exercício |
| PUT | `/admin/exercises/{id}` | Editar exercício (body: lessonId) |
| DELETE | `/admin/exercises/{id}?lessonId=xxx` | Excluir exercício |
| GET | `/admin/exercises?lessonId=xxx` | Listar exercícios da lição |

### Relatórios
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/reports` | Relatórios de uso da plataforma |

## Modelo de Dados

Usa Single Table Design no DynamoDB:

```
COURSE#<id> | METADATA         → Curso
COURSE#<id> | MODULE#<id>      → Módulo
MODULE#<id> | LESSON#<id>      → Lição
LESSON#<id> | EXERCISE#<id>    → Exercício
USER#<id>   | PROFILE          → Usuário
USER#<id>   | PROGRESS#<id>    → Progresso
USER#<id>   | HISTORY#<ts>     → Histórico
USER#<id>   | ERROR#<id>       → Erro recorrente
```

## Estrutura de Pastas

```
backend/
├── src/
│   ├── functions/
│   │   └── admin/
│   │       ├── courses.ts    ← CRUD de cursos
│   │       ├── modules.ts    ← CRUD de módulos
│   │       ├── lessons.ts    ← CRUD de lições
│   │       ├── exercises.ts  ← CRUD de exercícios
│   │       └── reports.ts    ← Relatórios de uso
│   ├── lib/
│   │   ├── dynamo.ts         ← Cliente DynamoDB
│   │   ├── response.ts       ← Respostas HTTP padronizadas
│   │   └── validators.ts     ← Validação de entrada
│   └── types/
│       └── index.ts          ← Interfaces TypeScript
├── serverless.yml            ← Configuração do Serverless Framework
├── tsconfig.json
└── package.json
```
