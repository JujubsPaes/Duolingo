/**
 * mockExercises.ts — Banco de exercícios para desenvolvimento local.
 *
 * Organização:
 *  - Cada lição tem exatamente 3 exercícios.
 *  - A dificuldade aumenta progressivamente dentro de cada módulo.
 *  - Os exercícios são mapeados por lessonId para facilitar o lookup na QuestionScreen.
 *
 * Quando o backend estiver pronto, substituir pelo retorno real de GET /lessons/{id}.
 *
 * Fonte das perguntas: documento "perguntas expo go.docx"
 */

import type { Exercise } from "../types/exercise";

// ─────────────────────────────────────────────────────────────────────────────
// CURSO EXPO — 5 módulos × 5 lições × 3 exercícios
// ─────────────────────────────────────────────────────────────────────────────

// ── Módulo 1: Introdução ao Expo ─────────────────────────────────────────────

/** Lição 1-1: O que é o Expo? (mais fácil) */
const EXPO_1_1: Exercise[] = [
  {
    id: "expo-1-1-ex1",
    type: "multiple_choice",
    question: "O Expo é usado principalmente para desenvolver:",
    options: [
      { id: "a", label: "Aplicativos mobile" },
      { id: "b", label: "Sites web apenas" },
      { id: "c", label: "Jogos de computador" },
    ],
    correctAnswerId: "a",
    explanation:
      "O Expo é uma plataforma focada em desenvolvimento de apps mobile com React Native.",
  },
  {
    id: "expo-1-1-ex2",
    type: "multiple_choice",
    question: "O Expo funciona junto com qual tecnologia?",
    options: [
      { id: "a", label: "Angular" },
      { id: "b", label: "React Native" },
      { id: "c", label: "Laravel" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Expo é construído sobre o React Native, simplificando o desenvolvimento mobile.",
  },
  {
    id: "expo-1-1-ex3",
    type: "true_false",
    question:
      'O Expo facilita o desenvolvimento mobile sem precisar configurar o Android Studio logo no início.',
    correctAnswerId: "true",
    explanation:
      "Verdade! O Expo abstrai grande parte da configuração nativa, permitindo começar rapidamente.",
  },
];

/** Lição 1-2: Instalação e Ambiente */
const EXPO_1_2: Exercise[] = [
  {
    id: "expo-1-2-ex1",
    type: "multiple_choice",
    question: "Qual programa é necessário para executar projetos Expo pelo terminal?",
    options: [
      { id: "a", label: "Photoshop" },
      { id: "b", label: "MySQL" },
      { id: "c", label: "Node.js" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Node.js é necessário para rodar o CLI do Expo e gerenciar pacotes com npm.",
  },
  {
    id: "expo-1-2-ex2",
    type: "multiple_choice",
    question: "Qual comando inicia um projeto Expo?",
    options: [
      { id: "a", label: "npm mobile" },
      { id: "b", label: "expo start" },
      { id: "c", label: "react-native init" },
    ],
    correctAnswerId: "b",
    explanation:
      'O comando "expo start" inicia o servidor de desenvolvimento e abre o Metro Bundler.',
  },
  {
    id: "expo-1-2-ex3",
    type: "true_false",
    question: "É possível testar apps Expo no celular usando o aplicativo Expo Go.",
    correctAnswerId: "true",
    explanation:
      "O Expo Go permite escanear um QR code e visualizar o app no celular em tempo real.",
  },
];

/** Lição 1-3: Estrutura do Projeto */
const EXPO_1_3: Exercise[] = [
  {
    id: "expo-1-3-ex1",
    type: "multiple_choice",
    question: "Qual arquivo geralmente contém o componente principal do app Expo?",
    options: [
      { id: "a", label: "Banco.sql" },
      { id: "b", label: "Config.py" },
      { id: "c", label: "App.js" },
    ],
    correctAnswerId: "c",
    explanation:
      "O App.js (ou App.tsx) é o ponto de entrada padrão de um projeto Expo.",
  },
  {
    id: "expo-1-3-ex2",
    type: "multiple_choice",
    question: "Qual linguagem é usada principalmente no Expo?",
    options: [
      { id: "a", label: "Java" },
      { id: "b", label: "C#" },
      { id: "c", label: "JavaScript" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Expo usa JavaScript (e TypeScript como superset opcional) para todo o código do app.",
  },
  {
    id: "expo-1-3-ex3",
    type: "true_false",
    question: "No Expo, os componentes visuais são criados usando React Native.",
    correctAnswerId: "true",
    explanation:
      "Correto! O Expo usa os componentes do React Native como View, Text, Image, etc.",
  },
];

/** Lição 1-4: Interface e Componentes */
const EXPO_1_4: Exercise[] = [
  {
    id: "expo-1-4-ex1",
    type: "multiple_choice",
    question: "Qual componente é usado para mostrar textos na tela no React Native?",
    options: [
      { id: "a", label: "Button" },
      { id: "b", label: "ViewController" },
      { id: "c", label: "Text" },
    ],
    correctAnswerId: "c",
    explanation:
      'O componente <Text> é obrigatório para exibir qualquer texto no React Native.',
  },
  {
    id: "expo-1-4-ex2",
    type: "multiple_choice",
    question: "Qual componente funciona como container/layout no React Native?",
    options: [
      { id: "a", label: "Table" },
      { id: "b", label: "View" },
      { id: "c", label: "DivMobile" },
    ],
    correctAnswerId: "b",
    explanation:
      'O <View> é o equivalente ao <div> do HTML — serve para agrupar e posicionar elementos.',
  },
  {
    id: "expo-1-4-ex3",
    type: "multiple_choice",
    question: "Qual componente é mais indicado para organizar elementos na tela no React Native?",
    options: [
      { id: "a", label: "Image" },
      { id: "b", label: "Text" },
      { id: "c", label: "View" },
    ],
    correctAnswerId: "c",
    explanation:
      "O <View> é o bloco de construção principal para layouts no React Native.",
  },
];

/** Lição 1-5: Navegação e Recursos (mais difícil do módulo) */
const EXPO_1_5: Exercise[] = [
  {
    id: "expo-1-5-ex1",
    type: "multiple_choice",
    question: "Qual biblioteca é muito usada para navegação entre telas no Expo?",
    options: [
      { id: "a", label: "Bootstrap" },
      { id: "b", label: "Axios" },
      { id: "c", label: "React Navigation" },
    ],
    correctAnswerId: "c",
    explanation:
      "O React Navigation é a solução mais popular para gerenciar rotas e navegação no Expo.",
  },
  {
    id: "expo-1-5-ex2",
    type: "multiple_choice",
    question: "O Expo Go serve para:",
    options: [
      { id: "a", label: "Editar vídeos" },
      { id: "b", label: "Criar banco de dados" },
      { id: "c", label: "Testar aplicativos mobile" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Expo Go é um app instalado no celular que permite visualizar seu projeto em tempo real.",
  },
  {
    id: "expo-1-5-ex3",
    type: "true_false",
    question: "O Expo permite acessar recursos do celular, como câmera e localização.",
    correctAnswerId: "true",
    explanation:
      "O Expo disponibiliza APIs prontas para câmera, GPS, notificações e muito mais.",
  },
];

// ── Módulo 2: Componentes e Estilização ──────────────────────────────────────

/** Lição 2-1: StyleSheet e Flexbox */
const EXPO_2_1: Exercise[] = [
  {
    id: "expo-2-1-ex1",
    type: "multiple_choice",
    question: "Como se aplica estilo a um componente no React Native?",
    options: [
      { id: "a", label: "Usando arquivos CSS externos" },
      { id: "b", label: "Usando StyleSheet.create()" },
      { id: "c", label: "Usando classes HTML" },
    ],
    correctAnswerId: "b",
    explanation:
      "O StyleSheet.create() é a forma padrão de definir estilos no React Native.",
  },
  {
    id: "expo-2-1-ex2",
    type: "multiple_choice",
    question: "Qual sistema de layout é usado por padrão no React Native?",
    options: [
      { id: "a", label: "Grid CSS" },
      { id: "b", label: "Float Layout" },
      { id: "c", label: "Flexbox" },
    ],
    correctAnswerId: "c",
    explanation:
      "O React Native usa Flexbox como sistema de layout padrão, igual ao CSS moderno.",
  },
  {
    id: "expo-2-1-ex3",
    type: "true_false",
    question: 'No React Native, a propriedade "flexDirection" define a direção dos filhos em um container.',
    correctAnswerId: "true",
    explanation:
      'flexDirection: "row" alinha horizontalmente; "column" (padrão) alinha verticalmente.',
  },
];

/** Lição 2-2: Imagens e Assets */
const EXPO_2_2: Exercise[] = [
  {
    id: "expo-2-2-ex1",
    type: "multiple_choice",
    question: "Qual componente é usado para exibir imagens no React Native?",
    options: [
      { id: "a", label: "Picture" },
      { id: "b", label: "Image" },
      { id: "c", label: "Photo" },
    ],
    correctAnswerId: "b",
    explanation:
      "O componente <Image> do React Native exibe imagens locais ou remotas.",
  },
  {
    id: "expo-2-2-ex2",
    type: "multiple_choice",
    question: "Como importar uma imagem local no Expo?",
    options: [
      { id: "a", label: "import img from './foto.png'" },
      { id: "b", label: "require('./foto.png')" },
      { id: "c", label: "Ambas as formas funcionam" },
    ],
    correctAnswerId: "c",
    explanation:
      "No Expo, tanto import quanto require funcionam para carregar imagens locais.",
  },
  {
    id: "expo-2-2-ex3",
    type: "true_false",
    question: "A pasta assets/ é o local recomendado para guardar imagens e fontes no Expo.",
    correctAnswerId: "true",
    explanation:
      "Por convenção, a pasta assets/ centraliza todos os recursos estáticos do projeto.",
  },
];

/** Lição 2-3: Animações com Reanimated */
const EXPO_2_3: Exercise[] = [
  {
    id: "expo-2-3-ex1",
    type: "multiple_choice",
    question: "Qual biblioteca é recomendada para animações performáticas no Expo?",
    options: [
      { id: "a", label: "react-native-reanimated" },
      { id: "b", label: "jQuery Animate" },
      { id: "c", label: "CSS Transitions" },
    ],
    correctAnswerId: "a",
    explanation:
      "O react-native-reanimated roda animações na thread nativa, garantindo 60fps.",
  },
  {
    id: "expo-2-3-ex2",
    type: "multiple_choice",
    question: "O Animated.View do React Native serve para:",
    options: [
      { id: "a", label: "Exibir vídeos" },
      { id: "b", label: "Aplicar animações a componentes" },
      { id: "c", label: "Criar formulários" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Animated.View envolve componentes que precisam ser animados com a API Animated.",
  },
  {
    id: "expo-2-3-ex3",
    type: "true_false",
    question: "Animações no React Native podem ser executadas na thread nativa para melhor desempenho.",
    correctAnswerId: "true",
    explanation:
      "Com useNativeDriver: true, a animação roda na thread nativa sem bloquear o JavaScript.",
  },
];

/** Lição 2-4: Gestos e Interações */
const EXPO_2_4: Exercise[] = [
  {
    id: "expo-2-4-ex1",
    type: "multiple_choice",
    question: "Qual componente detecta toques simples no React Native?",
    options: [
      { id: "a", label: "TouchableOpacity" },
      { id: "b", label: "ClickView" },
      { id: "c", label: "TapHandler" },
    ],
    correctAnswerId: "a",
    explanation:
      "O TouchableOpacity reduz a opacidade ao toque, dando feedback visual ao usuário.",
  },
  {
    id: "expo-2-4-ex2",
    type: "multiple_choice",
    question: "Qual biblioteca é usada para gestos avançados (swipe, pinch) no Expo?",
    options: [
      { id: "a", label: "react-native-gesture-handler" },
      { id: "b", label: "touch-events-js" },
      { id: "c", label: "expo-swipe" },
    ],
    correctAnswerId: "a",
    explanation:
      "O react-native-gesture-handler oferece reconhecimento de gestos complexos com alta performance.",
  },
  {
    id: "expo-2-4-ex3",
    type: "true_false",
    question: "O componente Pressable permite detectar estados de hover, press e long press.",
    correctAnswerId: "true",
    explanation:
      "O Pressable é mais flexível que o TouchableOpacity e suporta múltiplos estados de interação.",
  },
];

/** Lição 2-5: ScrollView e FlatList (mais difícil do módulo) */
const EXPO_2_5: Exercise[] = [
  {
    id: "expo-2-5-ex1",
    type: "multiple_choice",
    question: "Qual componente é mais eficiente para listas longas no React Native?",
    options: [
      { id: "a", label: "ScrollView" },
      { id: "b", label: "FlatList" },
      { id: "c", label: "ListView" },
    ],
    correctAnswerId: "b",
    explanation:
      "O FlatList renderiza apenas os itens visíveis na tela (lazy rendering), economizando memória.",
  },
  {
    id: "expo-2-5-ex2",
    type: "multiple_choice",
    question: "Qual prop do FlatList define os dados a serem exibidos?",
    options: [
      { id: "a", label: "items" },
      { id: "b", label: "source" },
      { id: "c", label: "data" },
    ],
    correctAnswerId: "c",
    explanation:
      'A prop "data" recebe o array de itens que o FlatList vai renderizar.',
  },
  {
    id: "expo-2-5-ex3",
    type: "true_false",
    question: "O ScrollView renderiza todos os filhos de uma vez, independente de estarem visíveis.",
    correctAnswerId: "true",
    explanation:
      "Por isso o ScrollView não é recomendado para listas muito longas — use FlatList nesses casos.",
  },
];

// ── Módulo 3: Navegação com Expo Router ──────────────────────────────────────

/** Lição 3-1: Navegação com Expo Router */
const EXPO_3_1: Exercise[] = [
  {
    id: "expo-3-1-ex1",
    type: "multiple_choice",
    question: "O Expo Router usa qual convenção para definir rotas?",
    options: [
      { id: "a", label: "Configuração em um arquivo routes.js" },
      { id: "b", label: "Estrutura de arquivos na pasta app/" },
      { id: "c", label: "Decorators TypeScript" },
    ],
    correctAnswerId: "b",
    explanation:
      "No Expo Router, cada arquivo dentro de app/ representa automaticamente uma rota.",
  },
  {
    id: "expo-3-1-ex2",
    type: "multiple_choice",
    question: "Como navegar para outra tela usando Expo Router?",
    options: [
      { id: "a", label: "navigation.navigate('Tela')" },
      { id: "b", label: "router.push('/tela')" },
      { id: "c", label: "window.location.href = '/tela'" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Expo Router usa router.push() para navegar, similar ao Next.js.",
  },
  {
    id: "expo-3-1-ex3",
    type: "true_false",
    question: "O arquivo _layout.tsx define o layout compartilhado entre as telas de um grupo.",
    correctAnswerId: "true",
    explanation:
      "O _layout.tsx envolve todas as rotas do mesmo nível, ideal para headers e tabs.",
  },
];

/** Lição 3-2: Parâmetros de Rota */
const EXPO_3_2: Exercise[] = [
  {
    id: "expo-3-2-ex1",
    type: "multiple_choice",
    question: "Como criar uma rota dinâmica no Expo Router?",
    options: [
      { id: "a", label: "Nomear o arquivo como [id].tsx" },
      { id: "b", label: "Usar :id no nome do arquivo" },
      { id: "c", label: "Criar uma pasta params/" },
    ],
    correctAnswerId: "a",
    explanation:
      "Colchetes no nome do arquivo ([id].tsx) indicam um segmento dinâmico de rota.",
  },
  {
    id: "expo-3-2-ex2",
    type: "multiple_choice",
    question: "Qual hook recupera os parâmetros da rota atual no Expo Router?",
    options: [
      { id: "a", label: "useParams()" },
      { id: "b", label: "useLocalSearchParams()" },
      { id: "c", label: "useRoute()" },
    ],
    correctAnswerId: "b",
    explanation:
      "O useLocalSearchParams() retorna os parâmetros da URL da tela atual.",
  },
  {
    id: "expo-3-2-ex3",
    type: "true_false",
    question: "É possível passar parâmetros ao navegar com router.push() usando a prop params.",
    correctAnswerId: "true",
    explanation:
      "Exemplo: router.push({ pathname: '/curso', params: { id: '123' } })",
  },
];

/** Lição 3-3: Layouts e Grupos */
const EXPO_3_3: Exercise[] = [
  {
    id: "expo-3-3-ex1",
    type: "multiple_choice",
    question: "O que são grupos de rotas no Expo Router (pastas com parênteses)?",
    options: [
      { id: "a", label: "Rotas que aparecem na URL" },
      { id: "b", label: "Agrupamentos lógicos que não afetam a URL" },
      { id: "c", label: "Rotas protegidas por autenticação" },
    ],
    correctAnswerId: "b",
    explanation:
      "Pastas como (auth) ou (app) agrupam rotas sem adicionar segmento na URL.",
  },
  {
    id: "expo-3-3-ex2",
    type: "multiple_choice",
    question: "Qual componente do Expo Router cria uma navegação por abas (tabs)?",
    options: [
      { id: "a", label: "Tabs" },
      { id: "b", label: "TabBar" },
      { id: "c", label: "BottomNav" },
    ],
    correctAnswerId: "a",
    explanation:
      "O componente <Tabs> do Expo Router cria automaticamente a barra de navegação inferior.",
  },
  {
    id: "expo-3-3-ex3",
    type: "true_false",
    question: "O router.replace() substitui a tela atual na pilha de navegação, sem permitir voltar.",
    correctAnswerId: "true",
    explanation:
      "Use replace() quando não quiser que o usuário volte para a tela anterior (ex: após login).",
  },
];

/** Lição 3-4: Stack e Modal */
const EXPO_3_4: Exercise[] = [
  {
    id: "expo-3-4-ex1",
    type: "multiple_choice",
    question: "O que é uma Stack Navigator?",
    options: [
      { id: "a", label: "Uma lista de componentes empilhados visualmente" },
      { id: "b", label: "Navegação em pilha onde novas telas são empilhadas sobre as anteriores" },
      { id: "c", label: "Um banco de dados em memória" },
    ],
    correctAnswerId: "b",
    explanation:
      "A Stack Navigator empilha telas e permite voltar à anterior com o botão de back.",
  },
  {
    id: "expo-3-4-ex2",
    type: "multiple_choice",
    question: "Como abrir uma tela como modal no Expo Router?",
    options: [
      { id: "a", label: "Definir presentation: 'modal' no Stack.Screen" },
      { id: "b", label: "Usar o componente <Modal>" },
      { id: "c", label: "Adicionar .modal ao nome do arquivo" },
    ],
    correctAnswerId: "a",
    explanation:
      "A prop presentation: 'modal' faz a tela deslizar de baixo para cima como um modal.",
  },
  {
    id: "expo-3-4-ex3",
    type: "true_false",
    question: "O router.back() navega para a tela anterior na pilha de navegação.",
    correctAnswerId: "true",
    explanation:
      "router.back() é equivalente ao botão de voltar do dispositivo.",
  },
];

/** Lição 3-5: Auth Guard e Redirecionamento (mais difícil do módulo) */
const EXPO_3_5: Exercise[] = [
  {
    id: "expo-3-5-ex1",
    type: "multiple_choice",
    question: "Como proteger rotas que exigem autenticação no Expo Router?",
    options: [
      { id: "a", label: "Verificar o token no _layout.tsx e redirecionar se não autenticado" },
      { id: "b", label: "Adicionar .protected ao nome do arquivo" },
      { id: "c", label: "Usar o componente <PrivateRoute>" },
    ],
    correctAnswerId: "a",
    explanation:
      "O _layout.tsx é o lugar ideal para verificar autenticação e redirecionar com router.replace().",
  },
  {
    id: "expo-3-5-ex2",
    type: "multiple_choice",
    question: "Qual hook do Expo Router verifica se o app já carregou os assets iniciais?",
    options: [
      { id: "a", label: "useAppReady()" },
      { id: "b", label: "useFonts()" },
      { id: "c", label: "SplashScreen.preventAutoHideAsync()" },
    ],
    correctAnswerId: "c",
    explanation:
      "SplashScreen.preventAutoHideAsync() mantém a splash screen até o app estar pronto.",
  },
  {
    id: "expo-3-5-ex3",
    type: "true_false",
    question: "O arquivo index.tsx na pasta app/ representa a rota raiz '/' do aplicativo.",
    correctAnswerId: "true",
    explanation:
      "O index.tsx é a tela inicial padrão, acessada quando nenhuma rota específica é informada.",
  },
];

// ── Módulo 4: APIs e Estado ───────────────────────────────────────────────────

/** Lição 4-1: Fetch e Axios */
const EXPO_4_1: Exercise[] = [
  {
    id: "expo-4-1-ex1",
    type: "multiple_choice",
    question: "Qual biblioteca é usada para fazer requisições HTTP no projeto?",
    options: [
      { id: "a", label: "jQuery" },
      { id: "b", label: "Axios" },
      { id: "c", label: "XMLHttpRequest" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Axios simplifica requisições HTTP com suporte a interceptors e tratamento de erros.",
  },
  {
    id: "expo-4-1-ex2",
    type: "multiple_choice",
    question: "O que é uma API REST?",
    options: [
      { id: "a", label: "Um banco de dados relacional" },
      { id: "b", label: "Uma interface de comunicação entre sistemas via HTTP" },
      { id: "c", label: "Um framework de testes" },
    ],
    correctAnswerId: "b",
    explanation:
      "APIs REST usam verbos HTTP (GET, POST, PUT, DELETE) para comunicação entre cliente e servidor.",
  },
  {
    id: "expo-4-1-ex3",
    type: "true_false",
    question: "O método GET é usado para buscar dados e o POST para enviar novos dados.",
    correctAnswerId: "true",
    explanation:
      "GET lê dados sem modificar o servidor; POST envia dados para criar um novo recurso.",
  },
];

/** Lição 4-2: React Query */
const EXPO_4_2: Exercise[] = [
  {
    id: "expo-4-2-ex1",
    type: "multiple_choice",
    question: "Para que serve o TanStack React Query no projeto?",
    options: [
      { id: "a", label: "Gerenciar animações" },
      { id: "b", label: "Cache e sincronização de dados com a API" },
      { id: "c", label: "Criar componentes de UI" },
    ],
    correctAnswerId: "b",
    explanation:
      "O React Query gerencia cache, loading states e revalidação automática de dados da API.",
  },
  {
    id: "expo-4-2-ex2",
    type: "multiple_choice",
    question: "Qual hook do React Query busca dados de uma API?",
    options: [
      { id: "a", label: "useFetch()" },
      { id: "b", label: "useQuery()" },
      { id: "c", label: "useGet()" },
    ],
    correctAnswerId: "b",
    explanation:
      "O useQuery() busca dados, gerencia loading/error e faz cache automático.",
  },
  {
    id: "expo-4-2-ex3",
    type: "true_false",
    question: "O React Query evita que o mesmo dado seja buscado múltiplas vezes desnecessariamente.",
    correctAnswerId: "true",
    explanation:
      "O cache do React Query reutiliza dados já buscados enquanto estiverem frescos (stale time).",
  },
];

/** Lição 4-3: Zustand */
const EXPO_4_3: Exercise[] = [
  {
    id: "expo-4-3-ex1",
    type: "multiple_choice",
    question: "O Zustand é usado no projeto para:",
    options: [
      { id: "a", label: "Gerenciamento de estado global" },
      { id: "b", label: "Estilização de componentes" },
      { id: "c", label: "Navegação entre telas" },
    ],
    correctAnswerId: "a",
    explanation:
      "O Zustand é uma biblioteca leve de gerenciamento de estado global para React.",
  },
  {
    id: "expo-4-3-ex2",
    type: "multiple_choice",
    question: "Como acessar o estado de uma store Zustand em um componente?",
    options: [
      { id: "a", label: "useContext(store)" },
      { id: "b", label: "useStore(state => state.valor)" },
      { id: "c", label: "connect(mapStateToProps)" },
    ],
    correctAnswerId: "b",
    explanation:
      "O hook gerado pelo Zustand aceita um selector para acessar partes específicas do estado.",
  },
  {
    id: "expo-4-3-ex3",
    type: "true_false",
    question: "O Zustand é mais simples que o Redux e não exige boilerplate de actions e reducers.",
    correctAnswerId: "true",
    explanation:
      "O Zustand usa uma API minimalista com create() e set(), sem necessidade de actions/reducers.",
  },
];

/** Lição 4-4: Armazenamento Seguro */
const EXPO_4_4: Exercise[] = [
  {
    id: "expo-4-4-ex1",
    type: "multiple_choice",
    question: "Onde os tokens de autenticação devem ser armazenados no Expo?",
    options: [
      { id: "a", label: "AsyncStorage" },
      { id: "b", label: "expo-secure-store" },
      { id: "c", label: "localStorage" },
    ],
    correctAnswerId: "b",
    explanation:
      "O expo-secure-store usa o Keychain (iOS) e Keystore (Android) para armazenar dados sensíveis.",
  },
  {
    id: "expo-4-4-ex2",
    type: "multiple_choice",
    question: "Por que não usar AsyncStorage para guardar tokens JWT?",
    options: [
      { id: "a", label: "É muito lento" },
      { id: "b", label: "Não suporta strings" },
      { id: "c", label: "Os dados ficam em texto puro, sem criptografia" },
    ],
    correctAnswerId: "c",
    explanation:
      "O AsyncStorage não criptografa os dados, tornando tokens vulneráveis em dispositivos comprometidos.",
  },
  {
    id: "expo-4-4-ex3",
    type: "true_false",
    question: "O expo-secure-store criptografa os dados antes de salvá-los no dispositivo.",
    correctAnswerId: "true",
    explanation:
      "Ele usa as APIs nativas de segurança do sistema operacional para proteger os dados.",
  },
];

/** Lição 4-5: Tratamento de Erros e Loading (mais difícil do módulo) */
const EXPO_4_5: Exercise[] = [
  {
    id: "expo-4-5-ex1",
    type: "multiple_choice",
    question: "Qual é a boa prática ao fazer uma requisição assíncrona no React?",
    options: [
      { id: "a", label: "Ignorar erros para não travar o app" },
      { id: "b", label: "Usar try/catch e exibir feedback ao usuário" },
      { id: "c", label: "Fazer a requisição diretamente no render" },
    ],
    correctAnswerId: "b",
    explanation:
      "Sempre trate erros com try/catch e informe o usuário com mensagens claras.",
  },
  {
    id: "expo-4-5-ex2",
    type: "multiple_choice",
    question: "O que é um interceptor no Axios?",
    options: [
      { id: "a", label: "Um componente de loading" },
      { id: "b", label: "Função que intercepta requisições/respostas para tratamento global" },
      { id: "c", label: "Um tipo de rota protegida" },
    ],
    correctAnswerId: "b",
    explanation:
      "Interceptors permitem adicionar headers (como o token JWT) em todas as requisições automaticamente.",
  },
  {
    id: "expo-4-5-ex3",
    type: "true_false",
    question: "É uma boa prática nunca expor credenciais AWS diretamente no código do app.",
    correctAnswerId: "true",
    explanation:
      "Credenciais devem ficar em variáveis de ambiente no backend, nunca no código do cliente.",
  },
];

// ── Módulo 5: Build, Deploy e Boas Práticas ──────────────────────────────────

/** Lição 5-1: Build com EAS */
const EXPO_5_1: Exercise[] = [
  {
    id: "expo-5-1-ex1",
    type: "multiple_choice",
    question: "O que é o EAS (Expo Application Services)?",
    options: [
      { id: "a", label: "Um editor de código da Expo" },
      { id: "b", label: "Serviço de build e deploy de apps Expo na nuvem" },
      { id: "c", label: "Um banco de dados da Expo" },
    ],
    correctAnswerId: "b",
    explanation:
      "O EAS Build compila o app na nuvem, gerando APK/IPA sem precisar de Mac ou Android Studio.",
  },
  {
    id: "expo-5-1-ex2",
    type: "multiple_choice",
    question: "Qual arquivo configura os perfis de build do EAS?",
    options: [
      { id: "a", label: "app.json" },
      { id: "b", label: "eas.json" },
      { id: "c", label: "build.config.js" },
    ],
    correctAnswerId: "b",
    explanation:
      "O eas.json define perfis como development, preview e production para o EAS Build.",
  },
  {
    id: "expo-5-1-ex3",
    type: "true_false",
    question: "O EAS Build permite gerar APKs para Android sem ter o Android Studio instalado.",
    correctAnswerId: "true",
    explanation:
      "O build acontece nos servidores da Expo, então você não precisa do ambiente nativo local.",
  },
];

/** Lição 5-2: Variáveis de Ambiente */
const EXPO_5_2: Exercise[] = [
  {
    id: "expo-5-2-ex1",
    type: "multiple_choice",
    question: "Como acessar variáveis de ambiente no Expo?",
    options: [
      { id: "a", label: "process.env.VARIAVEL" },
      { id: "b", label: "Constants.expoConfig.extra.variavel" },
      { id: "c", label: "Ambas as formas são válidas no Expo" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Expo suporta process.env (com prefixo EXPO_PUBLIC_) e extra no app.json/app.config.js.",
  },
  {
    id: "expo-5-2-ex2",
    type: "multiple_choice",
    question: "Qual prefixo torna uma variável de ambiente acessível no código cliente do Expo?",
    options: [
      { id: "a", label: "REACT_APP_" },
      { id: "b", label: "EXPO_PUBLIC_" },
      { id: "c", label: "PUBLIC_" },
    ],
    correctAnswerId: "b",
    explanation:
      "Variáveis com prefixo EXPO_PUBLIC_ são expostas ao bundle do cliente pelo Expo.",
  },
  {
    id: "expo-5-2-ex3",
    type: "true_false",
    question: "Variáveis de ambiente sem o prefixo EXPO_PUBLIC_ ficam disponíveis apenas no servidor.",
    correctAnswerId: "true",
    explanation:
      "Isso protege segredos como chaves de API de serem expostos no bundle do app.",
  },
];

/** Lição 5-3: TypeScript no Expo */
const EXPO_5_3: Exercise[] = [
  {
    id: "expo-5-3-ex1",
    type: "multiple_choice",
    question: "Qual é a vantagem de usar TypeScript no lugar de JavaScript puro?",
    options: [
      { id: "a", label: "O app fica mais rápido em tempo de execução" },
      { id: "b", label: "Tipagem estática que detecta erros antes de rodar o código" },
      { id: "c", label: "Reduz o tamanho do bundle final" },
    ],
    correctAnswerId: "b",
    explanation:
      "O TypeScript detecta erros de tipo em tempo de desenvolvimento, antes de chegar ao usuário.",
  },
  {
    id: "expo-5-3-ex2",
    type: "multiple_choice",
    question: "O que é uma interface no TypeScript?",
    options: [
      { id: "a", label: "Um componente visual" },
      { id: "b", label: "Um contrato que define a forma de um objeto" },
      { id: "c", label: "Uma função assíncrona" },
    ],
    correctAnswerId: "b",
    explanation:
      "Interfaces definem quais propriedades e tipos um objeto deve ter, garantindo consistência.",
  },
  {
    id: "expo-5-3-ex3",
    type: "true_false",
    question: "O uso de 'any' no TypeScript deve ser evitado pois desativa a verificação de tipos.",
    correctAnswerId: "true",
    explanation:
      "O 'any' remove os benefícios do TypeScript. Prefira tipos específicos ou 'unknown'.",
  },
];

/** Lição 5-4: Performance e Otimização */
const EXPO_5_4: Exercise[] = [
  {
    id: "expo-5-4-ex1",
    type: "multiple_choice",
    question: "O hook useMemo serve para:",
    options: [
      { id: "a", label: "Memorizar funções entre renders" },
      { id: "b", label: "Memorizar valores calculados para evitar recálculos desnecessários" },
      { id: "c", label: "Armazenar dados no AsyncStorage" },
    ],
    correctAnswerId: "b",
    explanation:
      "useMemo recalcula o valor apenas quando suas dependências mudam, otimizando performance.",
  },
  {
    id: "expo-5-4-ex2",
    type: "multiple_choice",
    question: "O hook useCallback serve para:",
    options: [
      { id: "a", label: "Memorizar funções para evitar recriação a cada render" },
      { id: "b", label: "Fazer chamadas de API" },
      { id: "c", label: "Criar animações" },
    ],
    correctAnswerId: "a",
    explanation:
      "useCallback evita que funções sejam recriadas a cada render, útil ao passar callbacks para filhos.",
  },
  {
    id: "expo-5-4-ex3",
    type: "true_false",
    question: "O React.memo evita que um componente filho seja re-renderizado se suas props não mudaram.",
    correctAnswerId: "true",
    explanation:
      "React.memo faz uma comparação rasa das props e pula o render se nada mudou.",
  },
];

/** Lição 5-5: Publicação e Atualizações OTA (mais difícil do módulo) */
const EXPO_5_5: Exercise[] = [
  {
    id: "expo-5-5-ex1",
    type: "multiple_choice",
    question: "O que são atualizações OTA (Over-the-Air) no Expo?",
    options: [
      { id: "a", label: "Atualizações que exigem nova submissão nas lojas" },
      { id: "b", label: "Atualizações do bundle JS enviadas diretamente ao app sem passar pelas lojas" },
      { id: "c", label: "Atualizações do sistema operacional" },
    ],
    correctAnswerId: "b",
    explanation:
      "Com EAS Update, você envia novas versões do JavaScript sem precisar publicar nas lojas.",
  },
  {
    id: "expo-5-5-ex2",
    type: "multiple_choice",
    question: "Qual serviço da Expo gerencia atualizações OTA?",
    options: [
      { id: "a", label: "EAS Build" },
      { id: "b", label: "EAS Update" },
      { id: "c", label: "Expo Go" },
    ],
    correctAnswerId: "b",
    explanation:
      "O EAS Update distribui atualizações do bundle JS para usuários que já têm o app instalado.",
  },
  {
    id: "expo-5-5-ex3",
    type: "true_false",
    question: "Mudanças no código nativo (como adicionar um novo módulo nativo) exigem um novo build.",
    correctAnswerId: "true",
    explanation:
      "OTA só atualiza o JavaScript. Mudanças nativas precisam de um novo APK/IPA nas lojas.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CURSO AWS — 5 módulos × 5 lições × 3 exercícios
// ─────────────────────────────────────────────────────────────────────────────

// ── Módulo 1: Conceitos de Cloud ─────────────────────────────────────────────

/** Lição AWS 1-1: O que é Cloud Computing? */
const AWS_1_1: Exercise[] = [
  {
    id: "aws-1-1-ex1",
    type: "multiple_choice",
    question: "O que é cloud computing?",
    options: [
      { id: "a", label: "Armazenar arquivos apenas no computador local" },
      { id: "b", label: "Usar servidores e serviços pela internet" },
      { id: "c", label: "Programar somente em Python" },
    ],
    correctAnswerId: "b",
    explanation:
      "Cloud computing é o fornecimento de serviços de TI (servidores, armazenamento, etc.) pela internet.",
  },
  {
    id: "aws-1-1-ex2",
    type: "multiple_choice",
    question: "Qual é uma vantagem da computação em nuvem?",
    options: [
      { id: "a", label: "Precisar comprar mais servidores físicos" },
      { id: "b", label: "Menor acesso à internet" },
      { id: "c", label: "Escalabilidade" },
    ],
    correctAnswerId: "c",
    explanation:
      "A nuvem permite aumentar ou reduzir recursos conforme a demanda, sem investimento em hardware.",
  },
  {
    id: "aws-1-1-ex3",
    type: "true_false",
    question: "A AWS permite utilizar recursos sob demanda, pagando apenas pelo que usar.",
    correctAnswerId: "true",
    explanation:
      "O modelo pay-as-you-go da AWS elimina custos fixos de infraestrutura.",
  },
];

/** Lição AWS 1-2: Regiões e Zonas de Disponibilidade */
const AWS_1_2: Exercise[] = [
  {
    id: "aws-1-2-ex1",
    type: "multiple_choice",
    question: "O que é uma Região AWS?",
    options: [
      { id: "a", label: "Um tipo de banco de dados" },
      { id: "b", label: "Um aplicativo da Amazon" },
      { id: "c", label: "Uma localização física com datacenters AWS" },
    ],
    correctAnswerId: "c",
    explanation:
      "Regiões são localizações geográficas (ex: us-east-1, sa-east-1) com múltiplos datacenters.",
  },
  {
    id: "aws-1-2-ex2",
    type: "multiple_choice",
    question: "As Availability Zones (AZs) servem para:",
    options: [
      { id: "a", label: "Criar usuários IAM" },
      { id: "b", label: "Armazenar senhas" },
      { id: "c", label: "Aumentar disponibilidade e redundância" },
    ],
    correctAnswerId: "c",
    explanation:
      "Cada Região tem múltiplas AZs isoladas fisicamente, garantindo alta disponibilidade.",
  },
  {
    id: "aws-1-2-ex3",
    type: "true_false",
    question: "Uma Região AWS é composta por pelo menos duas Availability Zones.",
    correctAnswerId: "true",
    explanation:
      "A AWS garante no mínimo 2 AZs por Região para oferecer redundância e tolerância a falhas.",
  },
];

/** Lição AWS 1-3: Modelos de Serviço */
const AWS_1_3: Exercise[] = [
  {
    id: "aws-1-3-ex1",
    type: "multiple_choice",
    question: "O que significa IaaS?",
    options: [
      { id: "a", label: "Internet as a Service" },
      { id: "b", label: "Infrastructure as a Service" },
      { id: "c", label: "Integration as a Service" },
    ],
    correctAnswerId: "b",
    explanation:
      "IaaS fornece infraestrutura virtualizada (servidores, rede, armazenamento) pela internet.",
  },
  {
    id: "aws-1-3-ex2",
    type: "multiple_choice",
    question: "Qual modelo de serviço o AWS Lambda representa?",
    options: [
      { id: "a", label: "IaaS" },
      { id: "b", label: "PaaS" },
      { id: "c", label: "FaaS (Function as a Service)" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Lambda é serverless — você executa funções sem gerenciar servidores, um modelo FaaS.",
  },
  {
    id: "aws-1-3-ex3",
    type: "true_false",
    question: "No modelo SaaS, o usuário final acessa o software pronto sem gerenciar infraestrutura.",
    correctAnswerId: "true",
    explanation:
      "Exemplos de SaaS: Gmail, Salesforce, Office 365 — o provedor gerencia tudo.",
  },
];

/** Lição AWS 1-4: Console AWS e IAM */
const AWS_1_4: Exercise[] = [
  {
    id: "aws-1-4-ex1",
    type: "multiple_choice",
    question: "Qual serviço é responsável pelo gerenciamento de usuários e permissões na AWS?",
    options: [
      { id: "a", label: "EC2" },
      { id: "b", label: "S3" },
      { id: "c", label: "IAM" },
    ],
    correctAnswerId: "c",
    explanation:
      "O IAM (Identity and Access Management) controla quem pode acessar o quê na AWS.",
  },
  {
    id: "aws-1-4-ex2",
    type: "multiple_choice",
    question: "O MFA na AWS serve para:",
    options: [
      { id: "a", label: "Criar máquinas virtuais" },
      { id: "b", label: "Melhorar a velocidade da internet" },
      { id: "c", label: "Aumentar a segurança da conta" },
    ],
    correctAnswerId: "c",
    explanation:
      "O MFA (Multi-Factor Authentication) adiciona uma segunda camada de verificação no login.",
  },
  {
    id: "aws-1-4-ex3",
    type: "true_false",
    question: "É uma boa prática usar a conta root da AWS para tarefas do dia a dia.",
    correctAnswerId: "false",
    explanation:
      "A conta root tem acesso total e deve ser usada apenas para configurações iniciais. Crie usuários IAM para uso diário.",
  },
];

/** Lição AWS 1-5: Modelo de Responsabilidade Compartilhada (mais difícil) */
const AWS_1_5: Exercise[] = [
  {
    id: "aws-1-5-ex1",
    type: "multiple_choice",
    question: "No modelo de responsabilidade compartilhada, quem é responsável pela segurança física dos datacenters?",
    options: [
      { id: "a", label: "O cliente" },
      { id: "b", label: "A AWS" },
      { id: "c", label: "Ambos igualmente" },
    ],
    correctAnswerId: "b",
    explanation:
      "A AWS é responsável pela segurança 'da' nuvem (hardware, datacenters). O cliente cuida do que está 'na' nuvem.",
  },
  {
    id: "aws-1-5-ex2",
    type: "multiple_choice",
    question: "No modelo de responsabilidade compartilhada, quem configura as permissões IAM?",
    options: [
      { id: "a", label: "A AWS" },
      { id: "b", label: "O cliente" },
      { id: "c", label: "O suporte técnico da Amazon" },
    ],
    correctAnswerId: "b",
    explanation:
      "Configurar usuários, roles e políticas IAM é responsabilidade do cliente.",
  },
  {
    id: "aws-1-5-ex3",
    type: "true_false",
    question: "No modelo de responsabilidade compartilhada, a AWS e o cliente possuem responsabilidades diferentes.",
    correctAnswerId: "true",
    explanation:
      "A AWS cuida da infraestrutura; o cliente cuida dos dados, configurações e acessos.",
  },
];

// ── Módulo 2: Infraestrutura AWS ─────────────────────────────────────────────

/** Lição AWS 2-1: Amazon EC2 */
const AWS_2_1: Exercise[] = [
  {
    id: "aws-2-1-ex1",
    type: "true_false",
    question: "O Amazon EC2 é um serviço de computação virtual (máquinas virtuais na nuvem).",
    correctAnswerId: "true",
    explanation:
      "O EC2 (Elastic Compute Cloud) fornece servidores virtuais configuráveis na nuvem AWS.",
  },
  {
    id: "aws-2-1-ex2",
    type: "multiple_choice",
    question: "O que é uma instância EC2?",
    options: [
      { id: "a", label: "Um banco de dados gerenciado" },
      { id: "b", label: "Um servidor virtual em execução na AWS" },
      { id: "c", label: "Um arquivo armazenado no S3" },
    ],
    correctAnswerId: "b",
    explanation:
      "Uma instância EC2 é um servidor virtual que você pode iniciar, parar e configurar conforme necessário.",
  },
  {
    id: "aws-2-1-ex3",
    type: "multiple_choice",
    question: "O que é um Security Group no EC2?",
    options: [
      { id: "a", label: "Um grupo de usuários IAM" },
      { id: "b", label: "Um firewall virtual que controla o tráfego da instância" },
      { id: "c", label: "Um tipo de instância EC2" },
    ],
    correctAnswerId: "b",
    explanation:
      "Security Groups definem regras de entrada e saída de tráfego para as instâncias EC2.",
  },
];

/** Lição AWS 2-2: Amazon S3 */
const AWS_2_2: Exercise[] = [
  {
    id: "aws-2-2-ex1",
    type: "multiple_choice",
    question: "Qual serviço AWS é usado para armazenamento de arquivos?",
    options: [
      { id: "a", label: "Amazon Route 53" },
      { id: "b", label: "AWS Lambda" },
      { id: "c", label: "Amazon S3" },
    ],
    correctAnswerId: "c",
    explanation:
      "O S3 (Simple Storage Service) armazena objetos (arquivos) com alta durabilidade e disponibilidade.",
  },
  {
    id: "aws-2-2-ex2",
    type: "multiple_choice",
    question: "Como se chama o container de arquivos no Amazon S3?",
    options: [
      { id: "a", label: "Folder" },
      { id: "b", label: "Bucket" },
      { id: "c", label: "Volume" },
    ],
    correctAnswerId: "b",
    explanation:
      "Buckets são os containers do S3 onde os objetos (arquivos) são armazenados.",
  },
  {
    id: "aws-2-2-ex3",
    type: "true_false",
    question: "O Amazon S3 pode ser usado para hospedar sites estáticos.",
    correctAnswerId: "true",
    explanation:
      "O S3 suporta hospedagem de sites estáticos (HTML, CSS, JS) com alta disponibilidade.",
  },
];

/** Lição AWS 2-3: AWS Lambda */
const AWS_2_3: Exercise[] = [
  {
    id: "aws-2-3-ex1",
    type: "multiple_choice",
    question: "Qual serviço permite executar código sem gerenciar servidores?",
    options: [
      { id: "a", label: "Amazon EC2" },
      { id: "b", label: "Amazon RDS" },
      { id: "c", label: "AWS Lambda" },
    ],
    correctAnswerId: "c",
    explanation:
      "O Lambda é serverless — você sobe o código e a AWS gerencia toda a infraestrutura.",
  },
  {
    id: "aws-2-3-ex2",
    type: "multiple_choice",
    question: "O Lambda cobra por:",
    options: [
      { id: "a", label: "Hora de servidor ligado" },
      { id: "b", label: "Número de execuções e tempo de execução" },
      { id: "c", label: "Tamanho do código enviado" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Lambda usa modelo pay-per-use: você paga pelo número de invocações e pelo tempo de execução.",
  },
  {
    id: "aws-2-3-ex3",
    type: "true_false",
    question: "Uma função Lambda pode ser acionada por eventos do API Gateway, S3 e DynamoDB.",
    correctAnswerId: "true",
    explanation:
      "O Lambda é orientado a eventos e pode ser integrado com dezenas de serviços AWS.",
  },
];

/** Lição AWS 2-4: API Gateway */
const AWS_2_4: Exercise[] = [
  {
    id: "aws-2-4-ex1",
    type: "multiple_choice",
    question: "O AWS API Gateway serve para:",
    options: [
      { id: "a", label: "Armazenar arquivos na nuvem" },
      { id: "b", label: "Criar, publicar e gerenciar APIs REST" },
      { id: "c", label: "Monitorar instâncias EC2" },
    ],
    correctAnswerId: "b",
    explanation:
      "O API Gateway é a porta de entrada das APIs, roteando requisições para funções Lambda.",
  },
  {
    id: "aws-2-4-ex2",
    type: "multiple_choice",
    question: "No projeto Dualingo, qual é a arquitetura de comunicação?",
    options: [
      { id: "a", label: "App → DynamoDB direto" },
      { id: "b", label: "App → API Gateway → Lambda → DynamoDB" },
      { id: "c", label: "App → EC2 → S3" },
    ],
    correctAnswerId: "b",
    explanation:
      "O app Expo chama o API Gateway, que aciona funções Lambda, que acessam o DynamoDB.",
  },
  {
    id: "aws-2-4-ex3",
    type: "true_false",
    question: "O API Gateway pode usar o Cognito Authorizer para validar tokens JWT automaticamente.",
    correctAnswerId: "true",
    explanation:
      "O Cognito Authorizer valida o token antes de passar a requisição para o Lambda.",
  },
];

/** Lição AWS 2-5: DynamoDB (mais difícil do módulo) */
const AWS_2_5: Exercise[] = [
  {
    id: "aws-2-5-ex1",
    type: "multiple_choice",
    question: "O Amazon DynamoDB é um banco de dados:",
    options: [
      { id: "a", label: "Relacional (SQL)" },
      { id: "b", label: "NoSQL gerenciado" },
      { id: "c", label: "Em memória apenas" },
    ],
    correctAnswerId: "b",
    explanation:
      "O DynamoDB é um banco NoSQL totalmente gerenciado, com performance de milissegundos.",
  },
  {
    id: "aws-2-5-ex2",
    type: "multiple_choice",
    question: "No DynamoDB, o que é a Partition Key (PK)?",
    options: [
      { id: "a", label: "Um índice secundário" },
      { id: "b", label: "O identificador principal que determina a partição onde o item é armazenado" },
      { id: "c", label: "Uma chave de criptografia" },
    ],
    correctAnswerId: "b",
    explanation:
      "A PK é obrigatória e determina em qual partição física o item será armazenado.",
  },
  {
    id: "aws-2-5-ex3",
    type: "true_false",
    question: "O Single Table Design no DynamoDB armazena múltiplas entidades em uma única tabela.",
    correctAnswerId: "true",
    explanation:
      "Essa técnica usa PK/SK compostos para representar diferentes entidades na mesma tabela, otimizando queries.",
  },
];

// ── Módulo 3: Serviços Principais ────────────────────────────────────────────

/** Lição AWS 3-1: Amazon RDS */
const AWS_3_1: Exercise[] = [
  {
    id: "aws-3-1-ex1",
    type: "multiple_choice",
    question: "Qual serviço é utilizado para bancos de dados relacionais na AWS?",
    options: [
      { id: "a", label: "Amazon S3" },
      { id: "b", label: "Amazon CloudFront" },
      { id: "c", label: "Amazon RDS" },
    ],
    correctAnswerId: "c",
    explanation:
      "O RDS (Relational Database Service) gerencia bancos SQL como MySQL, PostgreSQL e Aurora.",
  },
  {
    id: "aws-3-1-ex2",
    type: "multiple_choice",
    question: "Qual a diferença entre RDS e DynamoDB?",
    options: [
      { id: "a", label: "RDS é SQL (relacional); DynamoDB é NoSQL" },
      { id: "b", label: "RDS é mais barato que DynamoDB" },
      { id: "c", label: "DynamoDB só funciona com Python" },
    ],
    correctAnswerId: "a",
    explanation:
      "RDS é para dados estruturados com esquema fixo; DynamoDB é flexível e sem esquema rígido.",
  },
  {
    id: "aws-3-1-ex3",
    type: "true_false",
    question: "O Amazon RDS oferece backups automáticos e failover gerenciado.",
    correctAnswerId: "true",
    explanation:
      "O RDS automatiza backups, patches e failover, reduzindo a carga operacional.",
  },
];

/** Lição AWS 3-2: Amazon Cognito */
const AWS_3_2: Exercise[] = [
  {
    id: "aws-3-2-ex1",
    type: "multiple_choice",
    question: "O Amazon Cognito é usado para:",
    options: [
      { id: "a", label: "Armazenar arquivos de mídia" },
      { id: "b", label: "Autenticação e gerenciamento de usuários" },
      { id: "c", label: "Monitorar custos da AWS" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Cognito gerencia cadastro, login e tokens JWT para apps mobile e web.",
  },
  {
    id: "aws-3-2-ex2",
    type: "multiple_choice",
    question: "O que é um User Pool no Cognito?",
    options: [
      { id: "a", label: "Um grupo de instâncias EC2" },
      { id: "b", label: "Um diretório de usuários com autenticação" },
      { id: "c", label: "Um bucket S3 para avatares" },
    ],
    correctAnswerId: "b",
    explanation:
      "O User Pool armazena usuários e gerencia login, senha, MFA e tokens JWT.",
  },
  {
    id: "aws-3-2-ex3",
    type: "true_false",
    question: "O Cognito pode emitir tokens JWT usados para autenticar chamadas ao API Gateway.",
    correctAnswerId: "true",
    explanation:
      "Após o login, o Cognito emite tokens (ID, Access, Refresh) que o app usa nas requisições.",
  },
];

/** Lição AWS 3-3: Amazon CloudFront */
const AWS_3_3: Exercise[] = [
  {
    id: "aws-3-3-ex1",
    type: "multiple_choice",
    question: "O Amazon CloudFront é um serviço de:",
    options: [
      { id: "a", label: "Banco de dados" },
      { id: "b", label: "CDN (Content Delivery Network)" },
      { id: "c", label: "Computação serverless" },
    ],
    correctAnswerId: "b",
    explanation:
      "O CloudFront distribui conteúdo globalmente via edge locations, reduzindo latência.",
  },
  {
    id: "aws-3-3-ex2",
    type: "multiple_choice",
    question: "Qual é o benefício principal de usar CloudFront com S3?",
    options: [
      { id: "a", label: "Aumentar o custo de armazenamento" },
      { id: "b", label: "Entregar conteúdo mais rápido para usuários ao redor do mundo" },
      { id: "c", label: "Criptografar os arquivos no S3" },
    ],
    correctAnswerId: "b",
    explanation:
      "O CloudFront cacheia o conteúdo do S3 em edge locations próximas ao usuário.",
  },
  {
    id: "aws-3-3-ex3",
    type: "true_false",
    question: "O CloudFront pode ser usado para distribuir tanto conteúdo estático quanto dinâmico.",
    correctAnswerId: "true",
    explanation:
      "O CloudFront suporta cache de estáticos (imagens, JS) e proxy de APIs dinâmicas.",
  },
];

/** Lição AWS 3-4: Amazon SQS e SNS */
const AWS_3_4: Exercise[] = [
  {
    id: "aws-3-4-ex1",
    type: "multiple_choice",
    question: "O Amazon SQS é um serviço de:",
    options: [
      { id: "a", label: "Banco de dados em memória" },
      { id: "b", label: "Fila de mensagens gerenciada" },
      { id: "c", label: "Armazenamento de objetos" },
    ],
    correctAnswerId: "b",
    explanation:
      "O SQS (Simple Queue Service) desacopla componentes de sistemas distribuídos via filas.",
  },
  {
    id: "aws-3-4-ex2",
    type: "multiple_choice",
    question: "O Amazon SNS é usado para:",
    options: [
      { id: "a", label: "Enviar notificações e mensagens para múltiplos destinos" },
      { id: "b", label: "Criar bancos de dados" },
      { id: "c", label: "Gerenciar instâncias EC2" },
    ],
    correctAnswerId: "a",
    explanation:
      "O SNS (Simple Notification Service) publica mensagens para múltiplos assinantes (email, SMS, Lambda).",
  },
  {
    id: "aws-3-4-ex3",
    type: "true_false",
    question: "SQS e SNS podem ser combinados para criar arquiteturas de mensageria robustas.",
    correctAnswerId: "true",
    explanation:
      "O padrão SNS → SQS (fan-out) distribui mensagens para múltiplas filas de forma confiável.",
  },
];

/** Lição AWS 3-5: Amazon CloudWatch (mais difícil do módulo) */
const AWS_3_5: Exercise[] = [
  {
    id: "aws-3-5-ex1",
    type: "multiple_choice",
    question: "O Amazon CloudWatch serve para:",
    options: [
      { id: "a", label: "Armazenar backups" },
      { id: "b", label: "Monitorar métricas, logs e alarmes dos serviços AWS" },
      { id: "c", label: "Criar usuários IAM" },
    ],
    correctAnswerId: "b",
    explanation:
      "O CloudWatch coleta métricas, centraliza logs e dispara alarmes baseados em thresholds.",
  },
  {
    id: "aws-3-5-ex2",
    type: "multiple_choice",
    question: "O que são CloudWatch Logs?",
    options: [
      { id: "a", label: "Arquivos de configuração do EC2" },
      { id: "b", label: "Registros de execução de serviços como Lambda e EC2" },
      { id: "c", label: "Histórico de cobranças da AWS" },
    ],
    correctAnswerId: "b",
    explanation:
      "O CloudWatch Logs centraliza os logs de aplicações e serviços para análise e debugging.",
  },
  {
    id: "aws-3-5-ex3",
    type: "true_false",
    question: "É possível criar alarmes no CloudWatch para notificar quando o uso de CPU ultrapassa um limite.",
    correctAnswerId: "true",
    explanation:
      "Alarmes do CloudWatch podem acionar SNS, Lambda ou Auto Scaling baseados em métricas.",
  },
];

// ── Módulo 4: Segurança na AWS ───────────────────────────────────────────────

/** Lição AWS 4-1: IAM Avançado */
const AWS_4_1: Exercise[] = [
  {
    id: "aws-4-1-ex1",
    type: "multiple_choice",
    question: "O que é uma IAM Policy?",
    options: [
      { id: "a", label: "Um servidor virtual" },
      { id: "b", label: "Um documento JSON que define permissões de acesso" },
      { id: "c", label: "Um tipo de banco de dados" },
    ],
    correctAnswerId: "b",
    explanation:
      "Policies são documentos JSON que definem quais ações são permitidas ou negadas em quais recursos.",
  },
  {
    id: "aws-4-1-ex2",
    type: "multiple_choice",
    question: "O que é um IAM Role?",
    options: [
      { id: "a", label: "Uma senha de usuário" },
      { id: "b", label: "Um conjunto de permissões assumido temporariamente por serviços ou usuários" },
      { id: "c", label: "Um grupo de instâncias EC2" },
    ],
    correctAnswerId: "b",
    explanation:
      "Roles são assumidas por serviços (como Lambda) para acessar outros recursos sem credenciais fixas.",
  },
  {
    id: "aws-4-1-ex3",
    type: "true_false",
    question: "O princípio do menor privilégio recomenda dar apenas as permissões necessárias para cada tarefa.",
    correctAnswerId: "true",
    explanation:
      "Least privilege minimiza o impacto de credenciais comprometidas ou erros de configuração.",
  },
];

/** Lição AWS 4-2: Criptografia e KMS */
const AWS_4_2: Exercise[] = [
  {
    id: "aws-4-2-ex1",
    type: "multiple_choice",
    question: "O AWS KMS serve para:",
    options: [
      { id: "a", label: "Gerenciar chaves de criptografia" },
      { id: "b", label: "Criar instâncias EC2" },
      { id: "c", label: "Monitorar custos" },
    ],
    correctAnswerId: "a",
    explanation:
      "O KMS (Key Management Service) cria e gerencia chaves de criptografia para proteger dados.",
  },
  {
    id: "aws-4-2-ex2",
    type: "multiple_choice",
    question: "O que é criptografia em repouso (at rest)?",
    options: [
      { id: "a", label: "Criptografar dados enquanto são transmitidos pela rede" },
      { id: "b", label: "Criptografar dados armazenados em disco" },
      { id: "c", label: "Criptografar senhas de usuários" },
    ],
    correctAnswerId: "b",
    explanation:
      "Criptografia at rest protege dados armazenados em S3, DynamoDB, RDS, etc.",
  },
  {
    id: "aws-4-2-ex3",
    type: "true_false",
    question: "O HTTPS garante criptografia em trânsito (in transit) entre o cliente e o servidor.",
    correctAnswerId: "true",
    explanation:
      "O TLS/SSL do HTTPS criptografa os dados durante a transmissão pela rede.",
  },
];

/** Lição AWS 4-3: VPC e Redes */
const AWS_4_3: Exercise[] = [
  {
    id: "aws-4-3-ex1",
    type: "multiple_choice",
    question: "O que é uma VPC na AWS?",
    options: [
      { id: "a", label: "Virtual Private Cloud — rede virtual isolada na AWS" },
      { id: "b", label: "Very Powerful Computer" },
      { id: "c", label: "Um tipo de banco de dados" },
    ],
    correctAnswerId: "a",
    explanation:
      "A VPC permite criar uma rede virtual privada e isolada dentro da infraestrutura AWS.",
  },
  {
    id: "aws-4-3-ex2",
    type: "multiple_choice",
    question: "O que é uma subnet pública em uma VPC?",
    options: [
      { id: "a", label: "Uma subnet sem acesso à internet" },
      { id: "b", label: "Uma subnet com rota para um Internet Gateway" },
      { id: "c", label: "Uma subnet apenas para bancos de dados" },
    ],
    correctAnswerId: "b",
    explanation:
      "Subnets públicas têm rota para o Internet Gateway, permitindo acesso à internet.",
  },
  {
    id: "aws-4-3-ex3",
    type: "true_false",
    question: "Recursos em subnets privadas não têm acesso direto à internet.",
    correctAnswerId: "true",
    explanation:
      "Subnets privadas são usadas para bancos de dados e serviços internos que não devem ser expostos.",
  },
];

/** Lição AWS 4-4: AWS Shield e WAF */
const AWS_4_4: Exercise[] = [
  {
    id: "aws-4-4-ex1",
    type: "multiple_choice",
    question: "O AWS Shield protege contra:",
    options: [
      { id: "a", label: "Ataques DDoS (Distributed Denial of Service)" },
      { id: "b", label: "Erros de código na aplicação" },
      { id: "c", label: "Falhas de hardware" },
    ],
    correctAnswerId: "a",
    explanation:
      "O AWS Shield oferece proteção automática contra ataques DDoS para recursos AWS.",
  },
  {
    id: "aws-4-4-ex2",
    type: "multiple_choice",
    question: "O AWS WAF serve para:",
    options: [
      { id: "a", label: "Armazenar logs de acesso" },
      { id: "b", label: "Filtrar requisições HTTP maliciosas com regras personalizadas" },
      { id: "c", label: "Criar usuários IAM" },
    ],
    correctAnswerId: "b",
    explanation:
      "O WAF (Web Application Firewall) bloqueia SQL injection, XSS e outros ataques web.",
  },
  {
    id: "aws-4-4-ex3",
    type: "true_false",
    question: "O AWS Shield Standard é gratuito e protege automaticamente todos os recursos AWS.",
    correctAnswerId: "true",
    explanation:
      "O Shield Standard está incluído sem custo adicional e protege contra ataques DDoS comuns.",
  },
];

/** Lição AWS 4-5: Auditoria com CloudTrail (mais difícil do módulo) */
const AWS_4_5: Exercise[] = [
  {
    id: "aws-4-5-ex1",
    type: "multiple_choice",
    question: "O AWS CloudTrail serve para:",
    options: [
      { id: "a", label: "Monitorar métricas de performance" },
      { id: "b", label: "Registrar todas as chamadas de API feitas na conta AWS" },
      { id: "c", label: "Criar backups automáticos" },
    ],
    correctAnswerId: "b",
    explanation:
      "O CloudTrail registra quem fez o quê, quando e de onde na sua conta AWS — essencial para auditoria.",
  },
  {
    id: "aws-4-5-ex2",
    type: "multiple_choice",
    question: "Qual serviço combina CloudTrail + CloudWatch para detectar atividades suspeitas?",
    options: [
      { id: "a", label: "Amazon GuardDuty" },
      { id: "b", label: "Amazon Macie" },
      { id: "c", label: "AWS Config" },
    ],
    correctAnswerId: "a",
    explanation:
      "O GuardDuty usa ML para detectar ameaças analisando logs do CloudTrail, VPC Flow e DNS.",
  },
  {
    id: "aws-4-5-ex3",
    type: "true_false",
    question: "O AWS Config monitora e registra as configurações dos recursos AWS ao longo do tempo.",
    correctAnswerId: "true",
    explanation:
      "O Config permite ver o histórico de configurações e verificar conformidade com políticas.",
  },
];

// ── Módulo 5: Custos, Suporte e Boas Práticas ────────────────────────────────

/** Lição AWS 5-1: Modelo de Preços */
const AWS_5_1: Exercise[] = [
  {
    id: "aws-5-1-ex1",
    type: "multiple_choice",
    question: "O modelo Pay-as-you-go significa:",
    options: [
      { id: "a", label: "Pagar um valor fixo anual" },
      { id: "b", label: "Usar a AWS gratuitamente para sempre" },
      { id: "c", label: "Pagar apenas pelo que usar" },
    ],
    correctAnswerId: "c",
    explanation:
      "Pay-as-you-go elimina custos fixos — você paga somente pelos recursos consumidos.",
  },
  {
    id: "aws-5-1-ex2",
    type: "multiple_choice",
    question: "Qual ferramenta ajuda a estimar custos antes de usar serviços AWS?",
    options: [
      { id: "a", label: "AWS Shield" },
      { id: "b", label: "Amazon VPC" },
      { id: "c", label: "AWS Pricing Calculator" },
    ],
    correctAnswerId: "c",
    explanation:
      "O AWS Pricing Calculator estima o custo mensal com base nos serviços e configurações escolhidas.",
  },
  {
    id: "aws-5-1-ex3",
    type: "true_false",
    question: "Na AWS, é possível aumentar ou diminuir recursos conforme a necessidade do projeto.",
    correctAnswerId: "true",
    explanation:
      "Essa elasticidade é uma das principais vantagens da nuvem — escale para cima ou para baixo conforme a demanda.",
  },
];

/** Lição AWS 5-2: AWS Free Tier */
const AWS_5_2: Exercise[] = [
  {
    id: "aws-5-2-ex1",
    type: "multiple_choice",
    question: "O AWS Free Tier oferece:",
    options: [
      { id: "a", label: "Uso gratuito ilimitado de todos os serviços" },
      { id: "b", label: "Uso gratuito limitado de certos serviços por 12 meses ou sempre" },
      { id: "c", label: "Desconto de 50% em todos os serviços" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Free Tier inclui serviços gratuitos por 12 meses (como EC2 t2.micro) e outros sempre gratuitos (como Lambda até 1M invocações/mês).",
  },
  {
    id: "aws-5-2-ex2",
    type: "multiple_choice",
    question: "Qual serviço AWS tem 1 milhão de invocações gratuitas por mês no Free Tier?",
    options: [
      { id: "a", label: "Amazon EC2" },
      { id: "b", label: "AWS Lambda" },
      { id: "c", label: "Amazon RDS" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Lambda oferece 1M de invocações e 400.000 GB-segundos de computação gratuitos por mês.",
  },
  {
    id: "aws-5-2-ex3",
    type: "true_false",
    question: "O AWS Budgets permite criar alertas quando os gastos se aproximam de um limite definido.",
    correctAnswerId: "true",
    explanation:
      "O AWS Budgets envia notificações por email quando os custos reais ou previstos ultrapassam o orçamento.",
  },
];

/** Lição AWS 5-3: Well-Architected Framework */
const AWS_5_3: Exercise[] = [
  {
    id: "aws-5-3-ex1",
    type: "multiple_choice",
    question: "Quantos pilares tem o AWS Well-Architected Framework?",
    options: [
      { id: "a", label: "3" },
      { id: "b", label: "5" },
      { id: "c", label: "6" },
    ],
    correctAnswerId: "c",
    explanation:
      "Os 6 pilares são: Excelência Operacional, Segurança, Confiabilidade, Eficiência de Performance, Otimização de Custos e Sustentabilidade.",
  },
  {
    id: "aws-5-3-ex2",
    type: "multiple_choice",
    question: "Qual pilar do Well-Architected Framework trata de proteger dados e sistemas?",
    options: [
      { id: "a", label: "Confiabilidade" },
      { id: "b", label: "Segurança" },
      { id: "c", label: "Otimização de Custos" },
    ],
    correctAnswerId: "b",
    explanation:
      "O pilar de Segurança cobre IAM, criptografia, detecção de ameaças e proteção de dados.",
  },
  {
    id: "aws-5-3-ex3",
    type: "true_false",
    question: "O Well-Architected Framework ajuda a identificar riscos e melhorar arquiteturas na AWS.",
    correctAnswerId: "true",
    explanation:
      "A AWS oferece a ferramenta Well-Architected Tool para revisar arquiteturas com base nos 6 pilares.",
  },
];

/** Lição AWS 5-4: Serverless Framework */
const AWS_5_4: Exercise[] = [
  {
    id: "aws-5-4-ex1",
    type: "multiple_choice",
    question: "O Serverless Framework é usado para:",
    options: [
      { id: "a", label: "Criar interfaces gráficas" },
      { id: "b", label: "Deploy e gerenciamento de infraestrutura serverless como código" },
      { id: "c", label: "Monitorar instâncias EC2" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Serverless Framework define funções Lambda, API Gateway e outros recursos em serverless.yml.",
  },
  {
    id: "aws-5-4-ex2",
    type: "multiple_choice",
    question: "O que é Infrastructure as Code (IaC)?",
    options: [
      { id: "a", label: "Escrever código dentro de servidores físicos" },
      { id: "b", label: "Gerenciar infraestrutura usando arquivos de configuração versionáveis" },
      { id: "c", label: "Um tipo de banco de dados" },
    ],
    correctAnswerId: "b",
    explanation:
      "IaC permite versionar, revisar e replicar infraestrutura como se fosse código de aplicação.",
  },
  {
    id: "aws-5-4-ex3",
    type: "true_false",
    question: "O arquivo serverless.yml define as funções Lambda, eventos e recursos do projeto.",
    correctAnswerId: "true",
    explanation:
      "O serverless.yml é o coração do Serverless Framework, descrevendo toda a infraestrutura do projeto.",
  },
];

/** Lição AWS 5-5: Revisão Geral e Boas Práticas (mais difícil do módulo) */
const AWS_5_5: Exercise[] = [
  {
    id: "aws-5-5-ex1",
    type: "multiple_choice",
    question: "Qual é a melhor prática para armazenar credenciais de banco de dados em uma função Lambda?",
    options: [
      { id: "a", label: "Hardcodar no código da função" },
      { id: "b", label: "Usar AWS Secrets Manager ou variáveis de ambiente criptografadas" },
      { id: "c", label: "Salvar em um arquivo .txt no S3" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Secrets Manager rotaciona e protege credenciais automaticamente, sem expô-las no código.",
  },
  {
    id: "aws-5-5-ex2",
    type: "multiple_choice",
    question: "O que é Auto Scaling na AWS?",
    options: [
      { id: "a", label: "Aumentar o tamanho do disco automaticamente" },
      { id: "b", label: "Ajustar automaticamente a capacidade de recursos conforme a demanda" },
      { id: "c", label: "Fazer backup automático de bancos de dados" },
    ],
    correctAnswerId: "b",
    explanation:
      "O Auto Scaling adiciona ou remove instâncias EC2 automaticamente baseado em métricas como CPU.",
  },
  {
    id: "aws-5-5-ex3",
    type: "true_false",
    question: "Usar múltiplas Availability Zones aumenta a disponibilidade e tolerância a falhas da aplicação.",
    correctAnswerId: "true",
    explanation:
      "Se uma AZ falhar, as outras continuam operando — garantindo alta disponibilidade da aplicação.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAPA PRINCIPAL: lessonId → lista de exercícios
//
// A QuestionScreen usa esse mapa para carregar os exercícios corretos
// com base no lessonId recebido como parâmetro de navegação.
// ─────────────────────────────────────────────────────────────────────────────

export const EXERCISES_BY_LESSON: Record<string, Exercise[]> = {
  // ── Expo: Módulo 1 ──────────────────────────────────────────────────────
  "lesson-expo-1-1": EXPO_1_1,
  "lesson-expo-1-2": EXPO_1_2,
  "lesson-expo-1-3": EXPO_1_3,
  "lesson-expo-1-4": EXPO_1_4,
  "lesson-expo-1-5": EXPO_1_5,

  // ── Expo: Módulo 2 ──────────────────────────────────────────────────────
  "lesson-expo-2-1": EXPO_2_1,
  "lesson-expo-2-2": EXPO_2_2,
  "lesson-expo-2-3": EXPO_2_3,
  "lesson-expo-2-4": EXPO_2_4,
  "lesson-expo-2-5": EXPO_2_5,

  // ── Expo: Módulo 3 ──────────────────────────────────────────────────────
  "lesson-expo-3-1": EXPO_3_1,
  "lesson-expo-3-2": EXPO_3_2,
  "lesson-expo-3-3": EXPO_3_3,
  "lesson-expo-3-4": EXPO_3_4,
  "lesson-expo-3-5": EXPO_3_5,

  // ── Expo: Módulo 4 ──────────────────────────────────────────────────────
  "lesson-expo-4-1": EXPO_4_1,
  "lesson-expo-4-2": EXPO_4_2,
  "lesson-expo-4-3": EXPO_4_3,
  "lesson-expo-4-4": EXPO_4_4,
  "lesson-expo-4-5": EXPO_4_5,

  // ── Expo: Módulo 5 ──────────────────────────────────────────────────────
  "lesson-expo-5-1": EXPO_5_1,
  "lesson-expo-5-2": EXPO_5_2,
  "lesson-expo-5-3": EXPO_5_3,
  "lesson-expo-5-4": EXPO_5_4,
  "lesson-expo-5-5": EXPO_5_5,

  // ── AWS: Módulo 1 ───────────────────────────────────────────────────────
  "lesson-aws-1-1": AWS_1_1,
  "lesson-aws-1-2": AWS_1_2,
  "lesson-aws-1-3": AWS_1_3,
  "lesson-aws-1-4": AWS_1_4,
  "lesson-aws-1-5": AWS_1_5,

  // ── AWS: Módulo 2 ───────────────────────────────────────────────────────
  "lesson-aws-2-1": AWS_2_1,
  "lesson-aws-2-2": AWS_2_2,
  "lesson-aws-2-3": AWS_2_3,
  "lesson-aws-2-4": AWS_2_4,
  "lesson-aws-2-5": AWS_2_5,

  // ── AWS: Módulo 3 ───────────────────────────────────────────────────────
  "lesson-aws-3-1": AWS_3_1,
  "lesson-aws-3-2": AWS_3_2,
  "lesson-aws-3-3": AWS_3_3,
  "lesson-aws-3-4": AWS_3_4,
  "lesson-aws-3-5": AWS_3_5,

  // ── AWS: Módulo 4 ───────────────────────────────────────────────────────
  "lesson-aws-4-1": AWS_4_1,
  "lesson-aws-4-2": AWS_4_2,
  "lesson-aws-4-3": AWS_4_3,
  "lesson-aws-4-4": AWS_4_4,
  "lesson-aws-4-5": AWS_4_5,

  // ── AWS: Módulo 5 ───────────────────────────────────────────────────────
  "lesson-aws-5-1": AWS_5_1,
  "lesson-aws-5-2": AWS_5_2,
  "lesson-aws-5-3": AWS_5_3,
  "lesson-aws-5-4": AWS_5_4,
  "lesson-aws-5-5": AWS_5_5,
};

/**
 * Retorna os exercícios de uma lição pelo ID.
 * Se a lição não tiver exercícios cadastrados, retorna um array vazio.
 */
export function getExercisesByLesson(lessonId: string): Exercise[] {
  return EXERCISES_BY_LESSON[lessonId] ?? [];
}

/**
 * DEMO_EXERCISES — mantido para compatibilidade com código legado.
 * Aponta para a primeira lição do curso Expo.
 * @deprecated Use getExercisesByLesson(lessonId) no lugar.
 */
export const DEMO_EXERCISES: Exercise[] = EXPO_1_1;
