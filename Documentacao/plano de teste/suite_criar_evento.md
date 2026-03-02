# Suite de Teste - Tela Criar Evento

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

A tela "Criar Evento" permite ao usuário gerenciador cadastrar novos eventos na plataforma. O processo é dividido em três etapas: Informações Básicas, Upload de Imagens e Configurações de Exibição. Cada etapa possui validações específicas e o usuário pode navegar entre as etapas antes de finalizar o cadastro.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. O gerenciamento de formulário é realizado com React Hook Form e validação via Zod. O gerenciamento de estado e cache dos dados é feito pelo React Query (TanStack Query v5). A comunicação com o backend ocorre via API REST com autenticação JWT (NextAuth.js). A interface é construída com componentes reutilizáveis (Shadcn/UI / Radix UI) e estilizada com TailwindCSS 4.

**Fluxo de Dados:**
1. Usuário acessa a rota `/eventos/criar`.
2. Wizard renderiza a Etapa 1 (Informações Básicas).
3. Usuário preenche os campos e avança para a Etapa 2 (Upload de Imagens).
4. Usuário faz upload das imagens e avança para a Etapa 3 (Configurações de Exibição).
5. Usuário configura a exibição no totem e submete o formulário.
6. API valida o token, recebe os dados e cria o evento.
7. Usuário é redirecionado para a lista de eventos com toast de sucesso.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|-------------------------|
| RF001 – O sistema deve permitir o cadastro de título, descrição, local, categoria, datas e tags do evento. | NF001 – A validação dos campos deve ser em tempo real com feedback visual. |
| RF002 – O sistema deve validar campos obrigatórios antes de avançar para a próxima etapa. | NF002 – O upload de imagens deve suportar drag and drop. |
| RF003 – O sistema deve permitir upload de múltiplas imagens para o evento. | NF003 – As imagens devem exibir preview antes do envio. |
| RF004 – O sistema deve validar que pelo menos uma imagem foi adicionada. | NF004 – O wizard deve manter o estado ao navegar entre etapas. |
| RF005 – O sistema deve permitir configurar dias e horários de exibição no totem. | NF005 – A interface deve ser responsiva para dispositivos móveis. |
| RF006 – O sistema deve permitir selecionar cor de destaque para o evento. | NF006 – Deve exibir feedback visual (Toast) ao criar o evento. |
| RF007 – O sistema deve permitir cancelar o cadastro com confirmação. | |
| RF008 – O sistema deve permitir navegar entre as etapas do wizard. | |

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional de todas as etapas do wizard de criação de evento, incluindo validações de campos, upload de imagens, configurações de exibição e fluxo de navegação.

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação utilizando massa de dados controlada.

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface. |

### 4.2 Casos de Teste

#### Etapa 1 - Informações Básicas

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Etapa 1 | ● Ao acessar a tela, deve exibir o título "Informações Básicas". <br> ● Deve exibir todos os campos do formulário. | ● Exibição do título da etapa <br> ● Presença dos campos: título, descrição, local, categoria, data início, data fim, tags | ● Etapa renderizada corretamente. |
| Campo Título | ● Deve aceitar texto. <br> ● Deve ser obrigatório. | ● Validação de campo vazio <br> ● Aceitação de caracteres especiais | ● Título preenchido corretamente. |
| Campo Descrição | ● Deve aceitar texto longo. <br> ● Deve ser obrigatório. | ● Validação de campo vazio <br> ● Suporte a múltiplas linhas | ● Descrição preenchida corretamente. |
| Campo Local | ● Deve aceitar texto. <br> ● Deve ser obrigatório. | ● Validação de campo vazio | ● Local preenchido corretamente. |
| Campo Categoria | ● Deve exibir dropdown com opções. <br> ● Deve ser obrigatório. | ● Abertura do dropdown <br> ● Seleção de opção <br> ● Validação de campo vazio | ● Categoria selecionada corretamente. |
| Campo Data Início | ● Deve aceitar data/hora. <br> ● Deve ser obrigatório. | ● Validação de formato <br> ● Validação de campo vazio | ● Data de início válida. |
| Campo Data Fim | ● Deve aceitar data/hora. <br> ● Deve ser obrigatório. <br> ● Deve ser posterior à data de início. | ● Validação de formato <br> ● Validação de campo vazio <br> ● Validação de data fim > data início | ● Data de fim válida e posterior à data de início. |
| Campo Tags | ● Deve permitir adicionar múltiplas tags. <br> ● Deve adicionar tag ao pressionar Enter. | ● Adição de tags <br> ● Exibição visual das tags adicionadas | ● Tags adicionadas corretamente. |
| Validação de Campos Obrigatórios | ● Ao tentar avançar sem preencher campos obrigatórios, deve exibir mensagens de erro. | ● Exibição de toast de erro <br> ● Mensagem indicando campos faltantes | ● Formulário não avança sem campos obrigatórios. |
| Botão Continuar | ● Deve avançar para a Etapa 2 quando todos os campos estiverem válidos. | ● Transição para próxima etapa <br> ● Exibição do título "Upload de Imagens" | ● Navegação para Etapa 2 com sucesso. |
| Botão Cancelar | ● Deve exibir modal de confirmação ao clicar. | ● Abertura do modal <br> ● Opções de confirmar/voltar | ● Modal de confirmação exibido. |

#### Etapa 2 - Upload de Imagens

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Etapa 2 | ● Deve exibir o título "Upload de Imagens". <br> ● Deve exibir a área de drop zone. | ● Exibição do título da etapa <br> ● Presença da área de upload | ● Etapa renderizada corretamente. |
| Área de Upload (Drop Zone) | ● Deve permitir arrastar e soltar imagens. <br> ● Deve permitir clique para selecionar arquivos. | ● Funcionalidade de drag and drop <br> ● Seleção via input file | ● Upload funcional por ambos os métodos. |
| Preview de Imagens | ● Deve exibir preview das imagens após upload. <br> ● Deve exibir nome do arquivo. | ● Renderização da thumbnail <br> ● Exibição da seção "Novas Imagens" | ● Preview exibido corretamente. |
| Remoção de Imagens | ● Deve permitir remover imagens adicionadas. <br> ● Deve atualizar a lista após remoção. | ● Clique no botão de remover <br> ● Imagem removida da lista | ● Imagem removida com sucesso. |
| Validação de Imagem Obrigatória | ● Ao tentar avançar sem imagens, deve exibir erro. | ● Exibição de toast de erro <br> ● Mensagem "Adicione pelo menos 1 imagem" | ● Formulário não avança sem imagem. |
| Botão Voltar | ● Deve retornar para a Etapa 1. <br> ● Deve manter os dados preenchidos. | ● Transição para etapa anterior <br> ● Persistência dos dados | ● Navegação para Etapa 1 sem perda de dados. |
| Botão Continuar | ● Deve avançar para a Etapa 3 quando houver imagem. | ● Transição para próxima etapa <br> ● Exibição do título "Configurações de Exibição" | ● Navegação para Etapa 3 com sucesso. |

#### Etapa 3 - Configurações de Exibição

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Etapa 3 | ● Deve exibir o título "Configurações de Exibição". <br> ● Deve exibir campos de configuração do totem. | ● Exibição do título da etapa <br> ● Presença dos campos de configuração | ● Etapa renderizada corretamente. |
| Seleção de Dias | ● Deve exibir checkboxes para cada dia da semana. <br> ● Deve permitir selecionar múltiplos dias. <br> ● Deve ter opção "Todos os dias". | ● Renderização dos checkboxes <br> ● Seleção individual de dias <br> ● Seleção de todos os dias | ● Dias selecionados corretamente. |
| Seleção de Turnos | ● Deve exibir opções: Manhã, Tarde, Noite. <br> ● Deve permitir selecionar múltiplos turnos. | ● Renderização das opções <br> ● Seleção de turnos | ● Turnos selecionados corretamente. |
| Período de Exibição | ● Deve permitir definir data de início e fim de exibição. | ● Campos de data funcionais <br> ● Validação de formato | ● Período de exibição definido. |
| Seleção de Cor | ● Deve exibir dropdown com opções de cores. <br> ● Deve permitir selecionar uma cor de destaque. | ● Abertura do dropdown <br> ● Seleção de cor | ● Cor selecionada corretamente. |
| Botão Voltar | ● Deve retornar para a Etapa 2. <br> ● Deve manter os dados preenchidos. | ● Transição para etapa anterior <br> ● Persistência dos dados | ● Navegação para Etapa 2 sem perda de dados. |
| Botão Criar Evento | ● Deve submeter o formulário à API. <br> ● Deve exibir toast de sucesso. <br> ● Deve redirecionar para lista de eventos. | ● Chamada à API de criação <br> ● Exibição de feedback <br> ● Redirecionamento | ● Evento criado com sucesso. |

#### Modal de Cancelamento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Abertura do Modal | ● Ao clicar em "Cancelar", deve abrir modal de confirmação. | ● Modal visível <br> ● Título e mensagem exibidos | ● Modal aberto corretamente. |
| Botão Voltar (Modal) | ● Deve fechar o modal e retornar ao formulário. <br> ● Deve manter os dados preenchidos. | ● Modal fechado <br> ● Formulário preservado | ● Retorno ao formulário sem perda de dados. |
| Botão Confirmar Cancelar | ● Deve redirecionar para a lista de eventos. <br> ● Deve descartar os dados do formulário. | ● Redirecionamento <br> ● Dados descartados | ● Cancelamento realizado com sucesso. |

#### Fluxo Completo

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Criação de Evento E2E | ● Preencher todas as etapas e criar evento com sucesso. | ● Preenchimento da Etapa 1 <br> ● Upload na Etapa 2 <br> ● Configuração na Etapa 3 <br> ● Submissão do formulário <br> ● Toast de sucesso <br> ● Redirecionamento | ● Evento criado e listado na tela "Meus Eventos". |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Formulário não submete (erro 500/400). <br> ● Upload de imagens não funciona. <br> ● Wizard não avança entre etapas. |
| 2 | Grave | ● Validações não funcionam. <br> ● Dados perdidos ao navegar entre etapas. <br> ● Modal de cancelamento não aparece. |
| 3 | Moderada | ● Preview de imagem não renderiza. <br> ● Feedback visual (Toast) ausente. <br> ● Dropdown não abre. |
| 4 | Pequena | ● Erros de alinhamento ou texto. <br> ● Labels com texto incorreto. |

## 6 - Definição de Pronto

A funcionalidade "Criar Evento" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
