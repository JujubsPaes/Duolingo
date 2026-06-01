/**
 * Seed de dados — popula o DynamoDB com os 2 cursos reais do projeto:
 * - Curso 1: Expo (React Native)
 * - Curso 2: AWS Nuvem
 *
 * Como rodar:
 *   npx ts-node src/seed/seed.ts
 *
 * Pré-requisitos:
 *   - Variáveis de ambiente configuradas (DYNAMODB_TABLE, AWS_REGION)
 *   - Tabela DynamoDB já criada com os GSIs corretos
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "duolingo-app";
const client = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

// ── IDs fixos para facilitar referências ──────────────────────────────────────

const COURSE_EXPO_ID = "course-expo";
const COURSE_AWS_ID = "course-aws";

// Módulos do curso Expo
const MOD_EXPO_FUNDAMENTOS = "mod-expo-fundamentos";
const MOD_EXPO_COMPONENTES = "mod-expo-componentes";
const MOD_EXPO_NAVEGACAO = "mod-expo-navegacao";
const MOD_EXPO_APIS = "mod-expo-apis";

// Módulos do curso AWS
const MOD_AWS_CLOUD = "mod-aws-cloud";
const MOD_AWS_IAM = "mod-aws-iam";
const MOD_AWS_S3 = "mod-aws-s3";
const MOD_AWS_LAMBDA = "mod-aws-lambda";
const MOD_AWS_DYNAMODB = "mod-aws-dynamodb";

// ── Helper para inserir item ──────────────────────────────────────────────────

async function put(item: Record<string, any>) {
  await dynamo.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  console.log(`✓ ${item.PK} | ${item.SK}`);
}

// ── Seed principal ────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱 Iniciando seed do DynamoDB...\n");

  // ── CURSOS ──────────────────────────────────────────────────────────────────

  await put({
    PK: `COURSE#${COURSE_EXPO_ID}`,
    SK: "METADATA",
    courseId: COURSE_EXPO_ID,
    name: "Expo (React Native)",
    description: "Aprenda a criar apps mobile com Expo e React Native do zero.",
    imageUrl: "https://assets.dualingo.dev/courses/expo-logo.png",
    order: 1,
  });

  await put({
    PK: `COURSE#${COURSE_AWS_ID}`,
    SK: "METADATA",
    courseId: COURSE_AWS_ID,
    name: "Amazon AWS",
    description: "Domine os principais serviços da AWS e computação em nuvem.",
    imageUrl: "https://assets.dualingo.dev/courses/aws-logo.png",
    order: 2,
  });

  // ── MÓDULOS — EXPO ──────────────────────────────────────────────────────────

  const expoModules = [
    { id: MOD_EXPO_FUNDAMENTOS, name: "Fundamentos", order: 1 },
    { id: MOD_EXPO_COMPONENTES, name: "Componentes", order: 2 },
    { id: MOD_EXPO_NAVEGACAO, name: "Navegação", order: 3 },
    { id: MOD_EXPO_APIS, name: "APIs e Dados", order: 4 },
  ];

  for (const mod of expoModules) {
    await put({
      PK: `COURSE#${COURSE_EXPO_ID}`,
      SK: `MODULE#${mod.id}`,
      moduleId: mod.id,
      courseId: COURSE_EXPO_ID,
      name: mod.name,
      order: mod.order,
    });
  }

  // ── MÓDULOS — AWS ───────────────────────────────────────────────────────────

  const awsModules = [
    { id: MOD_AWS_CLOUD, name: "Conceitos de Cloud", order: 1 },
    { id: MOD_AWS_IAM, name: "IAM", order: 2 },
    { id: MOD_AWS_S3, name: "S3", order: 3 },
    { id: MOD_AWS_LAMBDA, name: "Lambda", order: 4 },
    { id: MOD_AWS_DYNAMODB, name: "DynamoDB", order: 5 },
  ];

  for (const mod of awsModules) {
    await put({
      PK: `COURSE#${COURSE_AWS_ID}`,
      SK: `MODULE#${mod.id}`,
      moduleId: mod.id,
      courseId: COURSE_AWS_ID,
      name: mod.name,
      order: mod.order,
    });
  }

  // ── LIÇÕES E EXERCÍCIOS — EXPO: FUNDAMENTOS ─────────────────────────────────

  await seedLesson(MOD_EXPO_FUNDAMENTOS, "lesson-expo-f1", "O que é o Expo?", 1, 10, [
    {
      type: "multiple_choice",
      question: "O que é o Expo?",
      prompt: "Escolha a alternativa correta:",
      options: [
        { id: "a", label: "Um framework para criar apps com React Native" },
        { id: "b", label: "Um banco de dados NoSQL" },
        { id: "c", label: "Uma linguagem de programação" },
        { id: "d", label: "Um serviço de hospedagem web" },
      ],
      correctAnswerId: "a",
      explanation: "O Expo é um framework e plataforma que simplifica o desenvolvimento de apps com React Native.",
    },
    {
      type: "true_false",
      question: "O Expo permite criar apps para iOS e Android com o mesmo código.",
      correctAnswerId: "true",
      explanation: "Sim! O Expo usa React Native, que compila para iOS e Android a partir de um único código JavaScript.",
    },
    {
      type: "multiple_choice",
      question: "Qual comando cria um novo projeto Expo?",
      prompt: "Selecione o comando correto:",
      options: [
        { id: "a", label: "npm create expo" },
        { id: "b", label: "npx create-expo-app" },
        { id: "c", label: "expo init" },
        { id: "d", label: "react-native init" },
      ],
      correctAnswerId: "b",
      explanation: "O comando correto é 'npx create-expo-app nome-do-projeto'.",
    },
  ]);

  await seedLesson(MOD_EXPO_FUNDAMENTOS, "lesson-expo-f2", "Estrutura de Pastas", 2, 10, [
    {
      type: "multiple_choice",
      question: "No Expo Router, onde ficam os arquivos de rota?",
      prompt: "Escolha a pasta correta:",
      options: [
        { id: "a", label: "src/" },
        { id: "b", label: "pages/" },
        { id: "c", label: "app/" },
        { id: "d", label: "routes/" },
      ],
      correctAnswerId: "c",
      explanation: "O Expo Router usa a pasta app/ para definir as rotas baseadas em arquivos.",
    },
    {
      type: "true_false",
      question: "O arquivo _layout.tsx define o layout compartilhado entre as telas.",
      correctAnswerId: "true",
      explanation: "Correto! O _layout.tsx é o arquivo de layout que envolve as telas filhas.",
    },
  ]);

  // ── LIÇÕES E EXERCÍCIOS — EXPO: COMPONENTES ─────────────────────────────────

  await seedLesson(MOD_EXPO_COMPONENTES, "lesson-expo-c1", "View e Text", 1, 10, [
    {
      type: "multiple_choice",
      question: "Qual componente é equivalente a uma <div> no React Native?",
      prompt: "Selecione o componente correto:",
      options: [
        { id: "a", label: "Text" },
        { id: "b", label: "View" },
        { id: "c", label: "Container" },
        { id: "d", label: "Box" },
      ],
      correctAnswerId: "b",
      explanation: "O componente View é o equivalente à <div> do HTML no React Native.",
    },
    {
      type: "true_false",
      question: "No React Native, todo texto deve estar dentro de um componente Text.",
      correctAnswerId: "true",
      explanation: "Sim! Diferente do HTML, no React Native strings soltas fora de <Text> causam erro.",
    },
    {
      type: "multiple_choice",
      question: "Qual prop do componente Image define a URL da imagem?",
      options: [
        { id: "a", label: "src" },
        { id: "b", label: "href" },
        { id: "c", label: "source" },
        { id: "d", label: "url" },
      ],
      correctAnswerId: "c",
      explanation: "No React Native, a prop 'source' recebe o caminho ou URL da imagem.",
    },
  ]);

  // ── LIÇÕES E EXERCÍCIOS — AWS: CONCEITOS DE CLOUD ───────────────────────────

  await seedLesson(MOD_AWS_CLOUD, "lesson-aws-cl1", "O que é Cloud Computing?", 1, 10, [
    {
      type: "multiple_choice",
      question: "O que é cloud computing?",
      prompt: "Escolha a definição mais adequada:",
      options: [
        { id: "a", label: "Utilizar serviços e servidores pela internet" },
        { id: "b", label: "Instalar programas sem internet" },
        { id: "c", label: "Utilizar apenas computadores físicos locais" },
        { id: "d", label: "Armazenar arquivos apenas no computador" },
      ],
      correctAnswerId: "a",
      explanation: "Cloud computing é o uso de recursos computacionais (servidores, armazenamento, bancos de dados) entregues pela internet sob demanda.",
    },
    {
      type: "true_false",
      question: "A AWS permite provisionar recursos sob demanda, sem necessidade de comprar hardware antecipadamente.",
      correctAnswerId: "true",
      explanation: "Correto! Um dos pilares da nuvem é a elasticidade — você provisiona e libera recursos conforme a necessidade.",
    },
    {
      type: "multiple_choice",
      question: "Qual é uma vantagem da computação em nuvem?",
      prompt: "Selecione a alternativa correta:",
      options: [
        { id: "a", label: "Escalabilidade sob demanda" },
        { id: "b", label: "Dependência de hardware físico próprio" },
        { id: "c", label: "Redução do acesso remoto" },
        { id: "d", label: "Necessidade de comprar mais servidores físicos" },
      ],
      correctAnswerId: "a",
      explanation: "A escalabilidade sob demanda permite aumentar ou reduzir recursos automaticamente conforme o tráfego da aplicação.",
    },
  ]);

  await seedLesson(MOD_AWS_CLOUD, "lesson-aws-cl2", "Infraestrutura e Modelos de Serviço", 2, 10, [
    {
      type: "multiple_choice",
      question: "O que é uma Região AWS?",
      prompt: "Escolha a definição correta:",
      options: [
        { id: "a", label: "Um grupo de usuários IAM" },
        { id: "b", label: "Uma localização geográfica composta por datacenters AWS" },
        { id: "c", label: "Um serviço de armazenamento" },
        { id: "d", label: "Um tipo de instância EC2" },
      ],
      correctAnswerId: "b",
      explanation: "Uma Região AWS é uma localização geográfica (ex: us-east-1) composta por múltiplas Availability Zones.",
    },
    {
      type: "true_false",
      question: "As Availability Zones garantem redundância e alta disponibilidade dentro de uma Região.",
      correctAnswerId: "true",
      explanation: "Correto! Cada AZ é um datacenter isolado. Distribuir recursos entre AZs protege contra falhas localizadas.",
    },
    {
      type: "multiple_choice",
      question: "O modelo Pay-as-you-go da AWS significa:",
      options: [
        { id: "a", label: "Pagar apenas pelos recursos utilizados" },
        { id: "b", label: "Pagar uma licença anual fixa" },
        { id: "c", label: "Utilizar serviços ilimitados gratuitamente" },
        { id: "d", label: "Pagar por servidor independente do uso" },
      ],
      correctAnswerId: "a",
      explanation: "No modelo Pay-as-you-go, você paga somente pelo que consome — sem contratos longos ou custos antecipados.",
    },
  ]);

  // ── LIÇÕES — AWS: IAM ───────────────────────────────────────────────────────

  await seedLesson(MOD_AWS_IAM, "lesson-aws-iam1", "Gerenciamento de Identidade", 1, 10, [
    {
      type: "multiple_choice",
      question: "Qual serviço gerencia usuários e permissões na AWS?",
      prompt: "Selecione o serviço correto:",
      options: [
        { id: "a", label: "IAM (Identity and Access Management)" },
        { id: "b", label: "EC2" },
        { id: "c", label: "CloudWatch" },
        { id: "d", label: "Route 53" },
      ],
      correctAnswerId: "a",
      explanation: "O IAM é o serviço central da AWS para controlar quem pode acessar quais recursos e com quais permissões.",
    },
    {
      type: "true_false",
      question: "No modelo de responsabilidade compartilhada, cliente e AWS possuem responsabilidades diferentes sobre segurança.",
      correctAnswerId: "true",
      explanation: "Correto! A AWS cuida da segurança DA nuvem (hardware, rede) e o cliente cuida da segurança NA nuvem (dados, IAM, configs).",
    },
    {
      type: "multiple_choice",
      question: "O MFA (Multi-Factor Authentication) serve para:",
      options: [
        { id: "a", label: "Adicionar uma camada extra de segurança na autenticação" },
        { id: "b", label: "Criar máquinas virtuais" },
        { id: "c", label: "Gerenciar buckets S3" },
        { id: "d", label: "Monitorar logs de aplicação" },
      ],
      correctAnswerId: "a",
      explanation: "O MFA exige um segundo fator (código do celular, token) além da senha, dificultando acessos não autorizados.",
    },
  ]);

  await seedLesson(MOD_AWS_IAM, "lesson-aws-iam2", "Políticas e Boas Práticas", 2, 10, [
    {
      type: "multiple_choice",
      question: "Qual é a melhor prática para a conta root da AWS?",
      prompt: "Selecione a recomendação correta:",
      options: [
        { id: "a", label: "Usar a conta root para tarefas diárias" },
        { id: "b", label: "Proteger com MFA e usar apenas para tarefas administrativas críticas" },
        { id: "c", label: "Compartilhar as credenciais root com a equipe" },
        { id: "d", label: "Desativar a conta root após criar usuários IAM" },
      ],
      correctAnswerId: "b",
      explanation: "A conta root tem acesso irrestrito. A boa prática é protegê-la com MFA e criar usuários IAM para o dia a dia.",
    },
    {
      type: "true_false",
      question: "Uma política IAM no formato JSON define quais ações são permitidas ou negadas em quais recursos.",
      correctAnswerId: "true",
      explanation: "Correto! Políticas IAM usam JSON com campos como Effect (Allow/Deny), Action e Resource.",
    },
  ]);

  // ── LIÇÕES — AWS: S3 ───────────────────────────────────────────────────────

  await seedLesson(MOD_AWS_S3, "lesson-aws-s31", "Armazenamento de Objetos", 1, 10, [
    {
      type: "multiple_choice",
      question: "Qual serviço AWS é utilizado para armazenamento de objetos?",
      prompt: "Selecione o serviço correto:",
      options: [
        { id: "a", label: "Amazon S3" },
        { id: "b", label: "AWS Lambda" },
        { id: "c", label: "Amazon VPC" },
        { id: "d", label: "Amazon RDS" },
      ],
      correctAnswerId: "a",
      explanation: "O Amazon S3 (Simple Storage Service) armazena objetos (arquivos) com alta durabilidade e disponibilidade.",
    },
    {
      type: "true_false",
      question: "O Amazon EC2 é utilizado para computação virtual na nuvem (máquinas virtuais).",
      correctAnswerId: "true",
      explanation: "Correto! O EC2 (Elastic Compute Cloud) fornece instâncias de servidores virtuais redimensionáveis.",
    },
    {
      type: "multiple_choice",
      question: "Qual ferramenta auxilia na estimativa de custos dos serviços AWS?",
      options: [
        { id: "a", label: "AWS Pricing Calculator" },
        { id: "b", label: "AWS Shield" },
        { id: "c", label: "Amazon Inspector" },
        { id: "d", label: "AWS CloudTrail" },
      ],
      correctAnswerId: "a",
      explanation: "O AWS Pricing Calculator permite simular cenários de uso e estimar custos antes de provisionar recursos.",
    },
  ]);

  // ── LIÇÕES — AWS: LAMBDA ────────────────────────────────────────────────────

  await seedLesson(MOD_AWS_LAMBDA, "lesson-aws-lam1", "Funções Serverless", 1, 10, [
    {
      type: "multiple_choice",
      question: "Qual serviço executa código sem necessidade de gerenciar servidores?",
      prompt: "Selecione o serviço correto:",
      options: [
        { id: "a", label: "Amazon EC2" },
        { id: "b", label: "AWS Lambda" },
        { id: "c", label: "Amazon Route 53" },
        { id: "d", label: "Amazon RDS" },
      ],
      correctAnswerId: "b",
      explanation: "O AWS Lambda é serverless — você sobe o código e a AWS cuida de toda a infraestrutura por baixo.",
    },
    {
      type: "true_false",
      question: "O AWS Lambda cobra pelo tempo de execução da função e pelo número de invocações.",
      correctAnswerId: "true",
      explanation: "Sim! Lambda cobra por número de requisições e por duração (em milissegundos de execução).",
    },
    {
      type: "multiple_choice",
      question: "O que é 'cold start' no Lambda?",
      options: [
        { id: "a", label: "Quando a função é pausada por inatividade" },
        { id: "b", label: "O tempo extra na primeira execução para inicializar o container" },
        { id: "c", label: "Um erro de timeout na função" },
        { id: "d", label: "Quando a função é executada em uma região fria" },
      ],
      correctAnswerId: "b",
      explanation: "Cold start é o tempo adicional na primeira invocação (ou após inatividade) para inicializar o ambiente de execução.",
    },
  ]);

  // ── LIÇÕES — AWS: DYNAMODB ──────────────────────────────────────────────────

  await seedLesson(MOD_AWS_DYNAMODB, "lesson-aws-dyn1", "Introdução ao DynamoDB", 1, 10, [
    {
      type: "multiple_choice",
      question: "O DynamoDB é qual tipo de banco de dados?",
      options: [
        { id: "a", label: "Relacional (SQL)" },
        { id: "b", label: "Grafos" },
        { id: "c", label: "NoSQL (chave-valor / documento)" },
        { id: "d", label: "Colunar" },
      ],
      correctAnswerId: "c",
      explanation: "O DynamoDB é um banco NoSQL totalmente gerenciado que armazena dados como pares chave-valor e documentos.",
    },
    {
      type: "true_false",
      question: "No DynamoDB, a Partition Key (PK) deve ser única em toda a tabela quando não há Sort Key.",
      correctAnswerId: "true",
      explanation: "Correto! Sem Sort Key, a PK é a chave primária e deve ser única.",
    },
    {
      type: "multiple_choice",
      question: "O que é um GSI no DynamoDB?",
      options: [
        { id: "a", label: "Global Secondary Index — permite queries por atributos não-chave" },
        { id: "b", label: "General Storage Interface" },
        { id: "c", label: "Global Sync Integration" },
        { id: "d", label: "Um tipo de tabela especial" },
      ],
      correctAnswerId: "a",
      explanation: "GSI (Global Secondary Index) permite fazer queries eficientes usando atributos diferentes da chave primária.",
    },
  ]);

  // ── CONQUISTAS PADRÃO ───────────────────────────────────────────────────────
  // As conquistas são criadas por usuário quando desbloqueadas.
  // Aqui definimos o catálogo de conquistas disponíveis.
  console.log("\n📋 Catálogo de conquistas (referência):");
  const achievements = [
    { id: "first-lesson", name: "Primeira Lição", icon: "🎯", reward: "+50 XP", xpReward: 50 },
    { id: "streak-7", name: "Semana Perfeita", icon: "🔥", reward: "+100 XP", xpReward: 100 },
    { id: "streak-30", name: "Mês Dedicado", icon: "💪", reward: "+300 XP", xpReward: 300 },
    { id: "course-expo", name: "Mestre do Expo", icon: "🏆", reward: "+500 XP", xpReward: 500 },
    { id: "course-aws", name: "Arquiteto AWS", icon: "☁️", reward: "+500 XP", xpReward: 500 },
    { id: "perfect-lesson", name: "Perfeição", icon: "⭐", reward: "+75 XP", xpReward: 75 },
  ];
  achievements.forEach((a) => console.log(`  - ${a.icon} ${a.name} (${a.reward})`));

  console.log("\n✅ Seed concluído com sucesso!\n");
}

// ── Helper para criar lição + exercícios ──────────────────────────────────────

async function seedLesson(
  moduleId: string,
  lessonId: string,
  name: string,
  order: number,
  xpReward: number,
  exercises: Array<{
    type: "multiple_choice" | "true_false";
    question: string;
    prompt?: string;
    options?: { id: string; label: string }[];
    correctAnswerId: string;
    explanation?: string;
  }>
) {
  // Cria a lição
  await put({
    PK: `MODULE#${moduleId}`,
    SK: `LESSON#${lessonId}`,
    lessonId,
    moduleId,
    name,
    order,
    xpReward,
  });

  // Cria os exercícios da lição
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const exerciseId = `${lessonId}-ex${i + 1}`;

    await put({
      PK: `LESSON#${lessonId}`,
      SK: `EXERCISE#${exerciseId}`,
      exerciseId,
      lessonId,
      type: ex.type,
      question: ex.question,
      prompt: ex.prompt,
      options: ex.type === "multiple_choice" ? ex.options : undefined,
      correctAnswerId: ex.correctAnswerId,
      explanation: ex.explanation,
      order: i + 1,
    });
  }
}

// Executa o seed
seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
