# Suite de Teste - Tela Editar Evento

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

A tela "Editar Evento" permite ao usuário gerenciador modificar eventos já cadastrados na plataforma. O processo de edição mantém a mesma estrutura do wizard de criação, dividido em três etapas: Informações Básicas, Upload de Imagens e Configurações de Exibição. Além disso, permite compartilhar permissões de edição com outros usuários. Cada etapa possui validações específicas e o usuário pode navegar entre as etapas antes de salvar as alterações.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. O gerenciamento de formulário é realizado com React Hook Form e validação via Zod. O gerenciamento de estado e cache dos dados é feito pelo React Query (TanStack Query v5). A comunicação com o backend ocorre via API REST com autenticação JWT (NextAuth.js). A interface é construída com componentes reutilizáveis (Shadcn/UI / Radix UI) e estilizada com TailwindCSS 4.

**Fluxo de Dados:**
1. Usuário acessa a rota `/meus_eventos` e clica no botão de editar de um evento.
2. Sistema redireciona para `/editar_eventos/:id`.
3. API retorna os dados do evento existente.
4. Wizard renderiza a Etapa 1 (Informações Básicas) com os dados carregados.
5. Usuário edita os campos e navega entre as etapas.
6. Usuário submete o formulário com as alterações.
7. API valida o token, recebe os dados e atualiza o evento.
8. Usuário é redirecionado para a lista de eventos com toast de sucesso.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|-------------------------|
| RF001 – O sistema deve carregar os dados existentes do evento nos campos do formulário. | NF001 – A validação dos campos deve ser em tempo real com feedback visual. |
| RF002 – O sistema deve permitir editar título, descrição, local, categoria, datas e tags do evento. | NF002 – O carregamento dos dados deve exibir feedback de loading. |
| RF003 – O sistema deve validar campos obrigatórios antes de salvar. | NF003 – As imagens existentes devem ser exibidas com preview. |
| RF004 – O sistema deve permitir adicionar e remover imagens do evento. | NF004 – O wizard deve manter o estado ao navegar entre etapas. |
| RF005 – O sistema deve permitir alterar configurações de exibição no totem. | NF005 – A interface deve ser responsiva para dispositivos móveis. |
| RF006 – O sistema deve permitir compartilhar permissões de edição com outros usuários. | NF006 – Deve exibir feedback visual (Toast) ao salvar alterações. |
| RF007 – O sistema deve permitir cancelar a edição e voltar para a lista de eventos. | |
| RF008 – O sistema deve descartar alterações não salvas ao cancelar. | |
| RF009 – O sistema deve validar email ao compartilhar permissões. | |

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional de todas as etapas do wizard de edição de evento, incluindo carregamento de dados existentes, validações de campos, edição de imagens, configurações de exibição, compartilhamento de permissões e comportamento do botão cancelar.

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação utilizando massa de dados controlada.

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface. |

### 4.2 Casos de Teste

#### Acesso à Edição via Meus Eventos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Navegação para Edição | ● Ao clicar no botão editar do card de evento, deve redirecionar para a página de edição. <br> ● Deve exibir o título "Editar Evento". | ● Redirecionamento para `/editar_eventos/:id` <br> ● Exibição do título da página | ● Navegação ocorre corretamente. |

#### Etapa 1 - Edição de Informações Básicas

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Carregamento de Dados Existentes | ● Ao acessar a edição, os campos devem estar preenchidos com os dados do evento. | ● Campo título não vazio <br> ● Campo descrição não vazio <br> ● Campo local não vazio | ● Dados carregados corretamente nos campos. |
| Edição do Título | ● Deve permitir limpar e digitar novo título. <br> ● Deve salvar a alteração com sucesso. | ● Limpeza do campo <br> ● Digitação do novo valor <br> ● Submissão e toast de sucesso | ● Título editado e salvo com sucesso. |
| Edição da Descrição | ● Deve permitir limpar e digitar nova descrição. <br> ● Deve salvar a alteração com sucesso. | ● Limpeza do campo <br> ● Digitação do novo valor <br> ● Submissão e toast de sucesso | ● Descrição editada e salva com sucesso. |
| Edição do Local | ● Deve permitir limpar e digitar novo local. <br> ● Deve salvar a alteração com sucesso. | ● Limpeza do campo <br> ● Digitação do novo valor <br> ● Submissão e toast de sucesso | ● Local editado e salvo com sucesso. |
| Alteração da Categoria | ● Deve permitir selecionar nova categoria no dropdown. <br> ● Deve salvar a alteração com sucesso. | ● Abertura do dropdown <br> ● Seleção de nova opção <br> ● Submissão e toast de sucesso | ● Categoria alterada e salva com sucesso. |

#### Etapa 2 - Edição de Imagens

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Exibição da Área de Upload | ● Ao avançar para a Etapa 2, deve exibir o título "Imagens do Evento". <br> ● Deve exibir a área de drop zone. | ● Exibição do título da etapa <br> ● Presença da área de upload | ● Etapa renderizada corretamente. |
| Adicionar Nova Imagem | ● Deve permitir adicionar nova imagem via input file. <br> ● Deve exibir preview da imagem adicionada. <br> ● Deve salvar com sucesso. | ● Seleção de arquivo <br> ● Renderização do preview <br> ● Submissão e toast de sucesso | ● Imagem adicionada e salva com sucesso. |

#### Etapa 3 - Edição de Configurações

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Exibição das Configurações | ● Ao avançar para a Etapa 3, deve exibir "Configurações de Exibição no Totem". <br> ● Deve exibir opções de dias e turnos. | ● Exibição do título da etapa <br> ● Presença de "Segunda-feira" <br> ● Presença de "Manhã" | ● Etapa renderizada corretamente. |
| Alteração de Dias de Exibição | ● Deve permitir marcar/desmarcar dias da semana. <br> ● Deve ter opção "Todos os dias". <br> ● Deve salvar com sucesso. | ● Desmarcação de checkbox <br> ● Marcação de checkbox <br> ● Submissão e toast de sucesso | ● Dias alterados e salvos com sucesso. |
| Alteração de Turnos de Exibição | ● Deve permitir marcar/desmarcar turnos (Manhã, Tarde, Noite). <br> ● Deve salvar com sucesso. | ● Marcação de turnos <br> ● Submissão e toast de sucesso | ● Turnos alterados e salvos com sucesso. |
| Alteração de Cor do Card | ● Deve permitir selecionar nova cor no dropdown. <br> ● Deve salvar com sucesso. | ● Abertura do dropdown <br> ● Seleção de cor <br> ● Submissão e toast de sucesso | ● Cor alterada e salva com sucesso. |

#### Compartilhar Permissões

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Validação de Email Inválido | ● Ao digitar email inválido, deve exibir mensagem de erro. | ● Digitação de email inválido <br> ● Exibição de mensagem "e-mail válido" | ● Validação de email funcionando. |
| Impedir Compartilhar Consigo Mesmo | ● Ao digitar o próprio email do usuário logado, deve exibir mensagem de erro. | ● Digitação do próprio email <br> ● Exibição de mensagem "não pode compartilhar o evento consigo mesmo" | ● Validação de auto-compartilhamento funcionando. |

#### Comportamento do Botão Cancelar

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Redirecionamento ao Cancelar | ● Ao clicar em "Cancelar", deve redirecionar para a lista de eventos. | ● Clique no botão Cancelar <br> ● Redirecionamento para `/meus_eventos` | ● Redirecionamento ocorre corretamente. |
| Descarte de Alterações | ● Ao cancelar, as alterações não salvas devem ser descartadas. <br> ● Ao retornar à edição, os dados originais devem estar preservados. | ● Edição de campo <br> ● Cancelamento <br> ● Verificação de dados originais | ● Alterações descartadas corretamente. |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Dados do evento não carregam. <br> ● Formulário não submete (erro 500/400). <br> ● Wizard não avança entre etapas. |
| 2 | Grave | ● Alterações não são salvas. <br> ● Dados perdidos ao navegar entre etapas. <br> ● Compartilhamento de permissões não funciona. |
| 3 | Moderada | ● Preview de imagem não renderiza. <br> ● Feedback visual (Toast) ausente. <br> ● Validações não funcionam. |
| 4 | Pequena | ● Erros de alinhamento ou texto. <br> ● Labels com texto incorreto. |

## 6 - Definição de Pronto

A funcionalidade "Editar Evento" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
