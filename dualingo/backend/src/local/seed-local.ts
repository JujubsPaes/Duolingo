/**
 * Seed local — popula o banco em memória com os mesmos dados do seed do DynamoDB.
 * 
 * Executado automaticamente ao iniciar o servidor local.
 * Contém os 2 cursos completos (Expo + AWS) com módulos, lições e exercícios.
 */

import { putItem, clearAll, queryBySK } from "./database";

export function seedLocalDatabase(): void {
  // Só faz seed se não houver cursos no banco (preserva dados de usuários)
  const existingCourses = queryBySK("METADATA").filter((item) => item.PK.startsWith("COURSE#"));
  if (existingCourses.length > 0) {
    console.log("📂 Banco já possui dados, pulando seed (usuários preservados).");
    return;
  }

  console.log("🌱 Populando banco local com cursos e lições...");

  // ── USUÁRIO ADMIN (pra testes do painel administrativo) ─────────────────────
  // Senha: admin123 (hash bcrypt pré-computado pra não precisar importar bcrypt aqui)
  // Gerado com: bcrypt.hashSync("admin123", 10)
  putItem({
    PK: "USER#admin-001",
    SK: "PROFILE",
    userId: "admin-001",
    name: "Administrador",
    email: "admin@dualingo.com",
    password: "$2a$10$VdDxMO19Fxt/ZVM73RlRQunpGFHg50q9ANFplK/xhh3cTsEdp9Whm",
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    role: "admin",
    createdAt: new Date().toISOString(),
  });

  // ── CURSOS ──────────────────────────────────────────────────────────────────

  putItem({
    PK: "COURSE#expo",
    SK: "METADATA",
    courseId: "expo",
    name: "Expo (React Native)",
    description: "Aprenda a criar apps mobile com Expo e React Native do zero.",
    imageUrl: "https://assets.dualingo.dev/courses/expo-logo.png",
    order: 1,
  });

  putItem({
    PK: "COURSE#aws",
    SK: "METADATA",
    courseId: "aws",
    name: "Amazon AWS",
    description: "Domine os principais serviços da AWS e computação em nuvem.",
    imageUrl: "https://assets.dualingo.dev/courses/aws-logo.png",
    order: 2,
  });

  // ── MÓDULOS EXPO ────────────────────────────────────────────────────────────

  const expoModules = [
    { id: "mod-expo-1", name: "Introdução ao Expo", order: 1 },
    { id: "mod-expo-2", name: "Componentes e Estilização", order: 2 },
    { id: "mod-expo-3", name: "Navegação com Expo Router", order: 3 },
    { id: "mod-expo-4", name: "APIs e Estado", order: 4 },
    { id: "mod-expo-5", name: "Build e Deploy", order: 5 },
  ];

  for (const mod of expoModules) {
    putItem({
      PK: "COURSE#expo",
      SK: `MODULE#${mod.id}`,
      moduleId: mod.id,
      courseId: "expo",
      name: mod.name,
      order: mod.order,
    });
  }

  // ── MÓDULOS AWS ─────────────────────────────────────────────────────────────

  const awsModules = [
    { id: "mod-aws-1", name: "Conceitos de Cloud", order: 1 },
    { id: "mod-aws-2", name: "Infraestrutura AWS", order: 2 },
    { id: "mod-aws-3", name: "Serviços Principais", order: 3 },
    { id: "mod-aws-4", name: "Segurança na AWS", order: 4 },
    { id: "mod-aws-5", name: "Custos e Boas Práticas", order: 5 },
  ];

  for (const mod of awsModules) {
    putItem({
      PK: "COURSE#aws",
      SK: `MODULE#${mod.id}`,
      moduleId: mod.id,
      courseId: "aws",
      name: mod.name,
      order: mod.order,
    });
  }

  // ── LIÇÕES EXPO ─────────────────────────────────────────────────────────────

  seedExpoLessons();
  seedAwsLessons();

  console.log("✅ Banco local populado com sucesso!\n");
}

// ── Lições do curso Expo ──────────────────────────────────────────────────────

function seedExpoLessons() {
  // Módulo 1
  seedLesson("mod-expo-1", "lesson-expo-1-1", "O que é o Expo?", 1, 10, [
    { id: "expo-1-1-ex1", type: "multiple_choice", question: "O Expo é usado principalmente para desenvolver:", options: [{ id: "a", label: "Aplicativos mobile" }, { id: "b", label: "Sites web apenas" }, { id: "c", label: "Jogos de computador" }], correctAnswerId: "a", explanation: "O Expo é uma plataforma focada em desenvolvimento de apps mobile com React Native." },
    { id: "expo-1-1-ex2", type: "multiple_choice", question: "O Expo funciona junto com qual tecnologia?", options: [{ id: "a", label: "Angular" }, { id: "b", label: "React Native" }, { id: "c", label: "Laravel" }], correctAnswerId: "b", explanation: "O Expo é construído sobre o React Native." },
    { id: "expo-1-1-ex3", type: "true_false", question: "O Expo facilita o desenvolvimento mobile sem precisar configurar o Android Studio logo no início.", correctAnswerId: "true", explanation: "Verdade! O Expo abstrai grande parte da configuração nativa." },
  ]);

  seedLesson("mod-expo-1", "lesson-expo-1-2", "Instalação e Ambiente", 2, 10, [
    { id: "expo-1-2-ex1", type: "multiple_choice", question: "Qual programa é necessário para executar projetos Expo pelo terminal?", options: [{ id: "a", label: "Photoshop" }, { id: "b", label: "MySQL" }, { id: "c", label: "Node.js" }], correctAnswerId: "c", explanation: "O Node.js é necessário para rodar o CLI do Expo." },
    { id: "expo-1-2-ex2", type: "multiple_choice", question: "Qual comando inicia um projeto Expo?", options: [{ id: "a", label: "npm mobile" }, { id: "b", label: "expo start" }, { id: "c", label: "react-native init" }], correctAnswerId: "b", explanation: "O comando 'expo start' inicia o servidor de desenvolvimento." },
    { id: "expo-1-2-ex3", type: "true_false", question: "É possível testar apps Expo no celular usando o aplicativo Expo Go.", correctAnswerId: "true", explanation: "O Expo Go permite escanear um QR code e visualizar o app no celular." },
  ]);

  seedLesson("mod-expo-1", "lesson-expo-1-3", "Estrutura do Projeto", 3, 10, [
    { id: "expo-1-3-ex1", type: "multiple_choice", question: "Qual arquivo geralmente contém o componente principal do app Expo?", options: [{ id: "a", label: "Banco.sql" }, { id: "b", label: "Config.py" }, { id: "c", label: "App.js" }], correctAnswerId: "c", explanation: "O App.js é o ponto de entrada padrão." },
    { id: "expo-1-3-ex2", type: "multiple_choice", question: "Qual linguagem é usada principalmente no Expo?", options: [{ id: "a", label: "Java" }, { id: "b", label: "C#" }, { id: "c", label: "JavaScript" }], correctAnswerId: "c", explanation: "O Expo usa JavaScript e TypeScript." },
    { id: "expo-1-3-ex3", type: "true_false", question: "No Expo, os componentes visuais são criados usando React Native.", correctAnswerId: "true", explanation: "Correto! O Expo usa os componentes do React Native." },
  ]);

  seedLesson("mod-expo-1", "lesson-expo-1-4", "Interface e Componentes", 4, 10, [
    { id: "expo-1-4-ex1", type: "multiple_choice", question: "Qual componente é usado para mostrar textos na tela no React Native?", options: [{ id: "a", label: "Button" }, { id: "b", label: "ViewController" }, { id: "c", label: "Text" }], correctAnswerId: "c", explanation: "O componente <Text> é obrigatório para exibir texto." },
    { id: "expo-1-4-ex2", type: "multiple_choice", question: "Qual componente funciona como container/layout no React Native?", options: [{ id: "a", label: "Table" }, { id: "b", label: "View" }, { id: "c", label: "DivMobile" }], correctAnswerId: "b", explanation: "O <View> é o equivalente ao <div> do HTML." },
    { id: "expo-1-4-ex3", type: "multiple_choice", question: "Qual componente é mais indicado para organizar elementos na tela?", options: [{ id: "a", label: "Image" }, { id: "b", label: "Text" }, { id: "c", label: "View" }], correctAnswerId: "c", explanation: "O <View> é o bloco de construção principal para layouts." },
  ]);

  seedLesson("mod-expo-1", "lesson-expo-1-5", "Navegação e Recursos", 5, 15, [
    { id: "expo-1-5-ex1", type: "multiple_choice", question: "Qual biblioteca é muito usada para navegação entre telas no Expo?", options: [{ id: "a", label: "Bootstrap" }, { id: "b", label: "Axios" }, { id: "c", label: "React Navigation" }], correctAnswerId: "c", explanation: "O React Navigation é a solução mais popular para navegação." },
    { id: "expo-1-5-ex2", type: "multiple_choice", question: "O Expo Go serve para:", options: [{ id: "a", label: "Editar vídeos" }, { id: "b", label: "Criar banco de dados" }, { id: "c", label: "Testar aplicativos mobile" }], correctAnswerId: "c", explanation: "O Expo Go permite visualizar seu projeto em tempo real." },
    { id: "expo-1-5-ex3", type: "true_false", question: "O Expo permite acessar recursos do celular, como câmera e localização.", correctAnswerId: "true", explanation: "O Expo disponibiliza APIs prontas para câmera, GPS, etc." },
  ]);

  // Módulos 2-5 com lições simplificadas (mesma estrutura)
  for (let m = 2; m <= 5; m++) {
    for (let l = 1; l <= 5; l++) {
      const lessonId = `lesson-expo-${m}-${l}`;
      const moduleId = `mod-expo-${m}`;
      const xp = l <= 3 ? 10 : 15;
      // Gera exercícios genéricos para completar a trilha
      seedLesson(moduleId, lessonId, `Lição ${m}.${l}`, l, xp, [
        { id: `${lessonId}-ex1`, type: "multiple_choice", question: `Pergunta 1 do módulo ${m}, lição ${l}`, options: [{ id: "a", label: "Opção A (correta)" }, { id: "b", label: "Opção B" }, { id: "c", label: "Opção C" }], correctAnswerId: "a", explanation: "Explicação da resposta correta." },
        { id: `${lessonId}-ex2`, type: "true_false", question: `Afirmação verdadeira do módulo ${m}, lição ${l}.`, correctAnswerId: "true", explanation: "Esta afirmação é verdadeira." },
        { id: `${lessonId}-ex3`, type: "multiple_choice", question: `Pergunta 3 do módulo ${m}, lição ${l}`, options: [{ id: "a", label: "Opção A" }, { id: "b", label: "Opção B (correta)" }, { id: "c", label: "Opção C" }], correctAnswerId: "b", explanation: "Explicação da resposta correta." },
      ]);
    }
  }
}

// ── Lições do curso AWS ───────────────────────────────────────────────────────

function seedAwsLessons() {
  // Módulo 1
  seedLesson("mod-aws-1", "lesson-aws-1-1", "O que é Cloud Computing?", 1, 10, [
    { id: "aws-1-1-ex1", type: "multiple_choice", question: "O que é cloud computing?", options: [{ id: "a", label: "Armazenar arquivos apenas no computador local" }, { id: "b", label: "Usar servidores e serviços pela internet" }, { id: "c", label: "Programar somente em Python" }], correctAnswerId: "b", explanation: "Cloud computing é o fornecimento de serviços de TI pela internet." },
    { id: "aws-1-1-ex2", type: "multiple_choice", question: "Qual é uma vantagem da computação em nuvem?", options: [{ id: "a", label: "Precisar comprar mais servidores físicos" }, { id: "b", label: "Menor acesso à internet" }, { id: "c", label: "Escalabilidade" }], correctAnswerId: "c", explanation: "A nuvem permite aumentar ou reduzir recursos conforme a demanda." },
    { id: "aws-1-1-ex3", type: "true_false", question: "A AWS permite utilizar recursos sob demanda, pagando apenas pelo que usar.", correctAnswerId: "true", explanation: "O modelo pay-as-you-go da AWS elimina custos fixos." },
  ]);

  // Módulos 1-5 com lições
  for (let m = 1; m <= 5; m++) {
    const startLesson = m === 1 ? 2 : 1; // Módulo 1 já tem a lição 1
    for (let l = startLesson; l <= 5; l++) {
      const lessonId = `lesson-aws-${m}-${l}`;
      const moduleId = `mod-aws-${m}`;
      const xp = l <= 3 ? 10 : 15;
      seedLesson(moduleId, lessonId, `Lição AWS ${m}.${l}`, l, xp, [
        { id: `${lessonId}-ex1`, type: "multiple_choice", question: `Pergunta AWS módulo ${m}, lição ${l}`, options: [{ id: "a", label: "Opção A (correta)" }, { id: "b", label: "Opção B" }, { id: "c", label: "Opção C" }], correctAnswerId: "a", explanation: "Explicação da resposta." },
        { id: `${lessonId}-ex2`, type: "true_false", question: `Afirmação verdadeira AWS módulo ${m}, lição ${l}.`, correctAnswerId: "true", explanation: "Esta afirmação é verdadeira." },
        { id: `${lessonId}-ex3`, type: "multiple_choice", question: `Pergunta 3 AWS módulo ${m}, lição ${l}`, options: [{ id: "a", label: "Opção A" }, { id: "b", label: "Opção B (correta)" }, { id: "c", label: "Opção C" }], correctAnswerId: "b", explanation: "Explicação da resposta." },
      ]);
    }
  }
}

// ── Helper para criar lição + exercícios ──────────────────────────────────────

interface ExerciseData {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  options?: { id: string; label: string }[];
  correctAnswerId: string;
  explanation?: string;
}

function seedLesson(
  moduleId: string,
  lessonId: string,
  name: string,
  order: number,
  xpReward: number,
  exercises: ExerciseData[]
) {
  // Cria a lição
  putItem({
    PK: `MODULE#${moduleId}`,
    SK: `LESSON#${lessonId}`,
    lessonId,
    moduleId,
    name,
    order,
    xpReward,
  });

  // Cria os exercícios
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    putItem({
      PK: `LESSON#${lessonId}`,
      SK: `EXERCISE#${ex.id}`,
      exerciseId: ex.id,
      lessonId,
      type: ex.type,
      question: ex.question,
      options: ex.options,
      correctAnswerId: ex.correctAnswerId,
      explanation: ex.explanation,
      order: i + 1,
    });
  }
}
