# User Stories – Plataforma de Aprendizado Gamificado

> Histórias de usuário com critérios de aceitação e tags para organização.

---

## Tags de Referência

| Tag | Significado |
|---|---|
| `#auth` | Autenticação e sessão |
| `#curso` | Cursos e trilhas |
| `#licao` | Lições e exercícios |
| `#gamificacao` | XP, níveis, streak, conquistas |
| `#progresso` | Progresso e histórico |
| `#revisao` | Revisão inteligente |
| `#admin` | Painel administrativo |
| `#infra` | Infraestrutura e deploy |
| `#ui` | Interface e design |
| `#mvp` | Obrigatório para o MVP |
| `#nice-to-have` | Desejável, mas não bloqueante |

---

## Épico 1 – Autenticação

---

### US-01 – Cadastro de usuário
`#auth` `#mvp`

**Como** um novo usuário,
**quero** criar uma conta na plataforma,
**para que** eu possa acessar os cursos e acompanhar meu progresso.

**Critérios de aceitação:**
- [ ] O formulário exige nome, email e senha
- [ ] A senha deve ter no mínimo 8 caracteres
- [ ] Se o email já estiver cadastrado, exibir mensagem de erro clara
- [ ] Após cadastro bem-sucedido, o usuário é redirecionado para a tela home
- [ ] O usuário recebe um email de verificação (via Cognito)

**Notas técnicas:**
- Criar usuário no Cognito + registro no DynamoDB
- Responsável: Membro 1 (backend) + Membro 5 (frontend)

---

### US-02 – Login
`#auth` `#mvp`

**Como** um usuário cadastrado,
**quero** fazer login com meu email e senha,
**para que** eu possa acessar minha conta e continuar de onde parei.

**Critérios de aceitação:**
- [ ] O formulário exige email e senha
- [ ] Credenciais inválidas exibem mensagem de erro
- [ ] Login bem-sucedido redireciona para a home
- [ ] O token de acesso é salvo de forma segura no dispositivo (SecureStore)
- [ ] O usuário permanece logado ao fechar e reabrir o app

**Notas técnicas:**
- Fluxo `USER_PASSWORD_AUTH` no Cognito
- Responsável: Membro 1 (backend) + Membro 5 (frontend)

---

### US-03 – Recuperação de senha
`#auth` `#mvp`

**Como** um usuário que esqueceu sua senha,
**quero** redefinir minha senha via email,
**para que** eu possa recuperar o acesso à minha conta.

**Critérios de aceitação:**
- [ ] O usuário informa o email cadastrado
- [ ] Um email com código/link de redefinição é enviado
- [ ] Após redefinir, o usuário consegue fazer login com a nova senha
- [ ] Email inválido ou não cadastrado exibe mensagem de erro

**Notas técnicas:**
- Fluxo de forgot password do Cognito
- Responsável: Membro 1 (backend) + Membro 5 (frontend)

---

### US-04 – Edição de perfil
`#auth` `#ui`

**Como** um usuário logado,
**quero** editar meu nome e foto de perfil,
**para que** minha conta reflita minha identidade.

**Critérios de aceitação:**
- [ ] O usuário pode alterar o nome
- [ ] O usuário pode fazer upload de uma foto (armazenada no S3)
- [ ] As alterações são salvas e refletidas imediatamente na interface
- [ ] Campos em branco não são aceitos

**Notas técnicas:**
- Upload de imagem para S3, URL salva no DynamoDB
- Responsável: Membro 1 (backend) + Membro 5 (frontend)

---

### US-05 – Logout
`#auth` `#mvp`

**Como** um usuário logado,
**quero** sair da minha conta,
**para que** meus dados fiquem protegidos em dispositivos compartilhados.

**Critérios de aceitação:**
- [ ] Botão de logout visível na tela de perfil
- [ ] Ao sair, o token é removido do dispositivo
- [ ] O usuário é redirecionado para a tela de login
- [ ] Não é possível acessar telas protegidas após o logout

**Responsável:** Membro 5 (frontend)

---

## Épico 2 – Cursos e Trilhas

---

### US-06 – Visualizar cursos disponíveis
`#curso` `#mvp`

**Como** um usuário logado,
**quero** ver os cursos disponíveis na plataforma,
**para que** eu possa escolher o que quero aprender.

**Critérios de aceitação:**
- [ ] A home exibe os cursos: Expo (React Native) e AWS Nuvem
- [ ] Cada curso mostra nome, descrição e ícone
- [ ] Cursos já iniciados mostram o percentual de progresso
- [ ] Cursos não iniciados mostram botão "Começar"

**Responsável:** Membro 2 (backend) + Membro 6 (frontend)

---

### US-07 – Iniciar um curso
`#curso` `#mvp`

**Como** um usuário,
**quero** iniciar um curso,
**para que** meu progresso seja registrado e a trilha seja liberada.

**Critérios de aceitação:**
- [ ] Ao iniciar, um registro de progresso é criado no banco
- [ ] A primeira lição do curso é desbloqueada automaticamente
- [ ] O usuário é levado para a tela de trilha do curso
- [ ] O usuário pode iniciar os dois cursos simultaneamente

**Responsável:** Membro 2 (backend) + Membro 6 (frontend)

---

### US-08 – Visualizar trilha do curso
`#curso` `#mvp` `#ui`

**Como** um usuário,
**quero** visualizar a trilha de aprendizado do curso,
**para que** eu entenda meu progresso e saiba o que vem a seguir.

**Critérios de aceitação:**
- [ ] A trilha exibe todos os módulos e lições em ordem
- [ ] Lições concluídas aparecem com ícone de check
- [ ] Lições liberadas (não concluídas) são clicáveis
- [ ] Lições bloqueadas aparecem em cinza e não são clicáveis
- [ ] O progresso geral do curso (%) é exibido no topo

**Responsável:** Membro 2 (backend) + Membro 6 (frontend)

---

### US-09 – Desbloqueio progressivo de conteúdo
`#curso` `#mvp`

**Como** um usuário,
**quero** desbloquear novas lições conforme avanço,
**para que** o aprendizado seja gradual e estruturado.

**Critérios de aceitação:**
- [ ] Uma lição só é liberada após a anterior ser concluída
- [ ] Um módulo só é liberado após todas as lições do módulo anterior serem concluídas
- [ ] Tentar acessar lição bloqueada exibe mensagem explicativa
- [ ] O desbloqueio é refletido visualmente na trilha em tempo real

**Responsável:** Membro 2 (backend) + Membro 6 (frontend)

---

## Épico 3 – Lições e Exercícios

---

### US-10 – Iniciar uma lição
`#licao` `#mvp`

**Como** um usuário,
**quero** iniciar uma lição desbloqueada,
**para que** eu possa aprender o conteúdo e realizar os exercícios.

**Critérios de aceitação:**
- [ ] A lição carrega com uma breve explicação do conteúdo
- [ ] Os exercícios são exibidos um por vez
- [ ] Uma barra de progresso mostra quantos exercícios restam
- [ ] O usuário não pode pular exercícios sem responder

**Responsável:** Membro 2 (backend) + Membro 7 (frontend)

---

### US-11 – Responder exercício de múltipla escolha
`#licao` `#mvp`

**Como** um usuário,
**quero** responder exercícios de múltipla escolha,
**para que** eu possa testar meu conhecimento de forma interativa.

**Critérios de aceitação:**
- [ ] São exibidas 4 opções de resposta
- [ ] O usuário seleciona uma opção e confirma
- [ ] Após confirmar, não é possível alterar a resposta
- [ ] A opção correta é destacada em verde
- [ ] A opção errada selecionada é destacada em vermelho

**Responsável:** Membro 7 (frontend)

---

### US-12 – Responder exercício de Verdadeiro ou Falso
`#licao` `#mvp`

**Como** um usuário,
**quero** responder exercícios de verdadeiro ou falso,
**para que** eu possa validar meu entendimento sobre afirmações do conteúdo.

**Critérios de aceitação:**
- [ ] São exibidos dois botões: "Verdadeiro" e "Falso"
- [ ] Após selecionar, o feedback é exibido imediatamente
- [ ] A resposta correta é sempre indicada visualmente

**Responsável:** Membro 7 (frontend)

---

### US-13 – Receber feedback imediato
`#licao` `#mvp`

**Como** um usuário,
**quero** saber imediatamente se acertei ou errei,
**para que** eu possa aprender com os erros na hora.

**Critérios de aceitação:**
- [ ] Após confirmar a resposta, exibir "Correto!" ou "Incorreto!"
- [ ] Em caso de erro, exibir a resposta correta e uma breve explicação
- [ ] O feedback é visualmente distinto (verde para acerto, vermelho para erro)
- [ ] O usuário avança para o próximo exercício após ver o feedback

**Responsável:** Membro 7 (frontend)

---

### US-14 – Concluir uma lição
`#licao` `#mvp`

**Como** um usuário,
**quero** concluir uma lição ao terminar todos os exercícios,
**para que** meu progresso seja salvo e a próxima lição seja desbloqueada.

**Critérios de aceitação:**
- [ ] A lição é concluída apenas se o acerto for ≥ 70%
- [ ] Se o acerto for < 70%, a lição não é marcada como concluída
- [ ] Ao concluir, exibir tela de resultado com: XP ganho, acertos, erros
- [ ] O progresso é atualizado no banco de dados
- [ ] A próxima lição é desbloqueada automaticamente

**Responsável:** Membro 3 (backend) + Membro 7 (frontend)

---

### US-15 – Repetir uma lição
`#licao`

**Como** um usuário,
**quero** repetir uma lição já realizada,
**para que** eu possa reforçar o aprendizado ou melhorar minha pontuação.

**Critérios de aceitação:**
- [ ] Qualquer lição concluída pode ser repetida
- [ ] A repetição não remove o progresso já registrado
- [ ] XP adicional pode ser ganho ao repetir (limitado por dia)

**Responsável:** Membro 2 (backend) + Membro 7 (frontend)

---

## Épico 4 – Gamificação

---

### US-16 – Ganhar XP ao concluir lição
`#gamificacao` `#mvp`

**Como** um usuário,
**quero** ganhar pontos de experiência (XP) ao concluir lições,
**para que** eu sinta progresso e motivação para continuar.

**Critérios de aceitação:**
- [ ] Ao concluir uma lição, o usuário recebe 10 XP base
- [ ] Acerto acima de 90% concede +5 XP de bônus
- [ ] O XP ganho é exibido na tela de resultado da lição
- [ ] O XP total do usuário é atualizado imediatamente

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

### US-17 – Subir de nível
`#gamificacao` `#mvp`

**Como** um usuário,
**quero** subir de nível conforme acumulo XP,
**para que** eu tenha uma sensação de evolução e conquista.

**Critérios de aceitação:**
- [ ] O nível é calculado automaticamente com base no XP total
- [ ] Tabela: N1 (0-100 XP), N2 (101-250), N3 (251-500), N4 (501-1000), N5 (1001+)
- [ ] Ao subir de nível, exibir uma animação/notificação de parabéns
- [ ] O nível atual é visível na tela de perfil e progresso

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

### US-18 – Manter streak diário
`#gamificacao` `#mvp`

**Como** um usuário,
**quero** manter uma sequência de dias estudando,
**para que** eu seja incentivado a estudar todos os dias.

**Critérios de aceitação:**
- [ ] O streak incrementa ao completar ao menos 1 lição por dia
- [ ] O streak é resetado para 0 se o usuário não estudar em um dia
- [ ] O streak atual é exibido na home e na tela de progresso
- [ ] A cada 7 dias de streak, o usuário recebe +10 XP de bônus

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

### US-19 – Receber conquistas
`#gamificacao` `#nice-to-have`

**Como** um usuário,
**quero** receber medalhas por marcos alcançados,
**para que** eu me sinta recompensado pelo meu esforço.

**Critérios de aceitação:**
- [ ] "Primeira lição" — ao concluir a primeira lição
- [ ] "Semana perfeita" — ao atingir 7 dias de streak
- [ ] "Módulo completo" — ao concluir todos as lições de um módulo
- [ ] "Curso completo" — ao concluir um curso inteiro
- [ ] "Nota máxima" — ao acertar 100% em uma lição
- [ ] Conquistas são exibidas na tela de progresso
- [ ] Conquistas bloqueadas aparecem em cinza com descrição do que falta

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

## Épico 5 – Progresso

---

### US-20 – Visualizar painel de progresso
`#progresso` `#mvp`

**Como** um usuário,
**quero** ver um painel com minha evolução geral,
**para que** eu entenda onde estou e o quanto já aprendi.

**Critérios de aceitação:**
- [ ] Exibir XP total e barra de progresso para o próximo nível
- [ ] Exibir streak atual com ícone de fogo
- [ ] Exibir progresso por curso (% concluído)
- [ ] Exibir lista de conquistas obtidas

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

### US-21 – Ver histórico de lições
`#progresso`

**Como** um usuário,
**quero** ver o histórico das lições que já realizei,
**para que** eu acompanhe minha jornada de aprendizado.

**Critérios de aceitação:**
- [ ] Listar lições realizadas em ordem cronológica (mais recente primeiro)
- [ ] Cada item exibe: nome da lição, data, acertos, erros e XP ganho
- [ ] Filtrar por curso (opcional)

**Responsável:** Membro 3 (backend) + Membro 8 (frontend)

---

## Épico 6 – Revisão Inteligente

---

### US-22 – Receber sugestões de revisão
`#revisao` `#mvp`

**Como** um usuário,
**quero** receber sugestões de conteúdos para revisar,
**para que** eu possa reforçar os tópicos onde tenho mais dificuldade.

**Critérios de aceitação:**
- [ ] O sistema identifica exercícios com taxa de erro > 50%
- [ ] A tela de revisão exibe a lista de conteúdos frágeis
- [ ] Cada item mostra o nome da lição e a taxa de erro
- [ ] Os itens são ordenados do mais problemático para o menos

**Responsável:** Membro 3 (backend) + Membro 9 (frontend)

---

### US-23 – Realizar exercícios de revisão
`#revisao` `#nice-to-have`

**Como** um usuário,
**quero** refazer exercícios baseados nos meus erros anteriores,
**para que** eu possa superar minhas dificuldades de forma direcionada.

**Critérios de aceitação:**
- [ ] O sistema gera uma sessão de revisão com exercícios dos tópicos frágeis
- [ ] Os exercícios priorizados são os com maior número de erros
- [ ] Ao concluir a revisão, o progresso é atualizado
- [ ] Exercícios acertados na revisão reduzem a taxa de erro registrada

**Responsável:** Membro 3 (backend) + Membro 9 (frontend)

---

## Épico 7 – Administração

---

### US-24 – Criar e gerenciar cursos
`#admin` `#mvp`

**Como** um administrador,
**quero** criar, editar e excluir cursos,
**para que** o conteúdo da plataforma esteja sempre atualizado.

**Critérios de aceitação:**
- [ ] Criar curso com nome, descrição e ícone
- [ ] Editar informações de um curso existente
- [ ] Excluir curso sem apagar o progresso dos usuários
- [ ] Apenas usuários com role de admin podem acessar essas rotas

**Responsável:** Membro 4 (backend)

---

### US-25 – Criar e gerenciar módulos
`#admin` `#mvp`

**Como** um administrador,
**quero** criar e organizar módulos dentro de um curso,
**para que** o conteúdo seja estruturado de forma progressiva.

**Critérios de aceitação:**
- [ ] Criar módulo vinculado a um curso com nome e ordem
- [ ] Reordenar módulos dentro do curso
- [ ] Editar e excluir módulos existentes

**Responsável:** Membro 4 (backend)

---

### US-26 – Criar e gerenciar lições e exercícios
`#admin` `#mvp`

**Como** um administrador,
**quero** criar lições e exercícios para os módulos,
**para que** os usuários tenham conteúdo para estudar.

**Critérios de aceitação:**
- [ ] Criar lição vinculada a um módulo com nome, ordem e XP de recompensa
- [ ] Criar exercícios do tipo múltipla escolha e V/F
- [ ] Definir a resposta correta e uma explicação para cada exercício
- [ ] Editar e excluir lições e exercícios existentes

**Responsável:** Membro 4 (backend)

---

### US-27 – Visualizar relatórios de uso
`#admin` `#nice-to-have`

**Como** um administrador,
**quero** visualizar métricas de uso da plataforma,
**para que** eu possa entender o engajamento dos usuários e melhorar o conteúdo.

**Critérios de aceitação:**
- [ ] Total de usuários cadastrados
- [ ] Lições mais e menos concluídas
- [ ] Taxa de acerto média por exercício
- [ ] Usuários com maior streak ativo

**Responsável:** Membro 4 (backend)

---

## Épico 8 – Infraestrutura e Deploy

---

### US-28 – API disponível e segura na AWS
`#infra` `#mvp`

**Como** desenvolvedor do projeto,
**quero** que a API esteja deployada na AWS com autenticação,
**para que** o app mobile consiga se comunicar com o backend de forma segura.

**Critérios de aceitação:**
- [ ] Todas as Lambdas deployadas via Serverless Framework
- [ ] API Gateway configurado com CORS
- [ ] Rotas protegidas exigem token JWT válido (Cognito Authorizer)
- [ ] Credenciais AWS não estão expostas no código
- [ ] Logs disponíveis no CloudWatch

**Responsável:** Membro 1

---

### US-29 – Dados persistidos no DynamoDB
`#infra` `#mvp`

**Como** usuário da plataforma,
**quero** que meu progresso seja salvo permanentemente,
**para que** eu não perca meu histórico ao fechar o app.

**Critérios de aceitação:**
- [ ] Progresso, XP, streak e conquistas são salvos no DynamoDB
- [ ] Dados são recuperados corretamente ao fazer login em outro dispositivo
- [ ] Nenhum dado de progresso é perdido ao atualizar conteúdo do curso

**Responsável:** Membro 1 (infra) + Membros 2, 3 (backend)

---

## Resumo por Responsável

| US | Título | Backend | Frontend |
|---|---|---|---|
| US-01 | Cadastro | M1 | M5 |
| US-02 | Login | M1 | M5 |
| US-03 | Recuperação de senha | M1 | M5 |
| US-04 | Edição de perfil | M1 | M5 |
| US-05 | Logout | — | M5 |
| US-06 | Visualizar cursos | M2 | M6 |
| US-07 | Iniciar curso | M2 | M6 |
| US-08 | Visualizar trilha | M2 | M6 |
| US-09 | Desbloqueio progressivo | M2 | M6 |
| US-10 | Iniciar lição | M2 | M7 |
| US-11 | Múltipla escolha | — | M7 |
| US-12 | Verdadeiro ou Falso | — | M7 |
| US-13 | Feedback imediato | — | M7 |
| US-14 | Concluir lição | M3 | M7 |
| US-15 | Repetir lição | M2 | M7 |
| US-16 | Ganhar XP | M3 | M8 |
| US-17 | Subir de nível | M3 | M8 |
| US-18 | Streak diário | M3 | M8 |
| US-19 | Conquistas | M3 | M8 |
| US-20 | Painel de progresso | M3 | M8 |
| US-21 | Histórico de lições | M3 | M8 |
| US-22 | Sugestões de revisão | M3 | M9 |
| US-23 | Exercícios de revisão | M3 | M9 |
| US-24 | CRUD cursos | M4 | — |
| US-25 | CRUD módulos | M4 | — |
| US-26 | CRUD lições/exercícios | M4 | — |
| US-27 | Relatórios | M4 | — |
| US-28 | API na AWS | M1 | — |
| US-29 | Dados no DynamoDB | M1/M2/M3 | — |

---

*M1 = Membro 1, M2 = Membro 2, etc.*
