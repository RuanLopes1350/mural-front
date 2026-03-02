# Suite de Teste - Tela Meus Eventos

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

A tela "Meus Eventos" é a área administrativa onde o usuário gerenciador pode visualizar e controlar os eventos que cadastrou. Permite listar, buscar, filtrar, editar e excluir eventos, além de iniciar o processo de criação de um novo evento. É o ponto central de operação para os organizadores de eventos.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. O gerenciamento de estado e cache dos dados é realizado pelo React Query (TanStack Query v5). A comunicação com o backend ocorre via API REST com autenticação JWT (NextAuth.js). A interface é construída com componentes reutilizáveis (Shadcn/UI / Radix UI) e estilizada com TailwindCSS 4.

**Fluxo de Dados:**
1. Usuário acessa a rota `/meus-eventos`.
2. React Query solicita a lista de eventos do usuário à API.
3. API valida o token e retorna os eventos paginados.
4. Interface renderiza a tabela/cards de eventos.
5. Ações de CRUD (Excluir, Editar) invalidam o cache e atualizam a lista automaticamente.

## 3 - Categorização dos Requisitos

Requisito Funcional | Requisito Não Funcional
-----------|--------
RF001 – O sistema deve listar apenas os eventos criados pelo usuário logado (ou todos se for admin, dependendo da regra). | NF001 – O carregamento da lista deve ser rápido e exibir feedback de loading (skeleton).
RF002 – O sistema deve permitir buscar eventos pelo título. | NF002 – As ações de exclusão e edição devem ter feedback visual imediato (Toast).
RF003 – O sistema deve permitir filtrar eventos por status (Ativo, Inativo). | NF003 – A interface deve ser responsiva para dispositivos móveis.
RF004 – O sistema deve permitir a exclusão de um evento, solicitando confirmação. | 
RF005 – O sistema deve permitir o redirecionamento para a edição de um evento.
RF006 – O sistema deve permitir o redirecionamento para a criação de um novo evento.
RF007 – O sistema deve exibir a paginação quando houver muitos registros.

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional da listagem, filtros, busca e ações de gerenciamento (Editar, Excluir) na tela "Meus Eventos".

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação utilizando massa de dados controlada.

Ferramenta | Time | Descrição
-----------|------|----------
Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface.

### 4.2 Casos de Teste

#### Funcionalidades da Tela Meus Eventos

---
Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite
-----------|--------|--------|--------
Listagem de Eventos | ● Ao acessar a tela, deve listar os eventos cadastrados com: Título, Data, Local, Status e Ações. <br> ● Deve exibir um estado de "vazio" caso não existam eventos. | ● Carregamento da lista via API <br> ● Exibição correta dos dados nas colunas/cards <br> ● Tratamento de lista vazia | ● Lista renderizada corretamente. <br> ● Dados consistentes com o banco.
Pesquisa por Título | ● Ao digitar no campo de busca, a lista deve ser filtrada em tempo real (ou via debounce). <br> ● Deve exibir mensagem caso nenhum evento seja encontrado. | ● Filtragem correta por termo parcial <br> ● Reset da lista ao limpar a busca <br> ● Mensagem de "Nenhum resultado" | ● Busca retorna os eventos esperados.
Filtros de Status | ● Deve permitir filtrar por: Ativo, Inativo, Agendado. <br> ● Ao selecionar um filtro, a lista deve atualizar. | ● Aplicação do filtro na query da API ou localmente <br> ● Atualização visual da lista <br> ● Combinação com a busca por texto | ● Apenas eventos do status selecionado são exibidos.
Botão Novo Evento | ● Ao clicar em "Novo Evento", deve redirecionar para a rota de criação (Wizard). | ● Redirecionamento para `/eventos/criar` (ou rota equivalente) | ● Navegação ocorre sem erros.
Ação de Editar | ● Ao clicar no botão/ícone de editar, deve redirecionar para o formulário de edição com o ID do evento. | ● Redirecionamento para `/eventos/editar/:id` <br> ● Formulário carrega os dados (validado no teste de edição) | ● Redirecionamento correto.
Ação de Excluir | ● Ao clicar em excluir, deve exibir um modal de confirmação. <br> ● Ao confirmar, o evento deve ser removido e a lista atualizada. <br> ● Deve exibir toast de sucesso. | ● Abertura do modal <br> ● Cancelamento da ação <br> ● Confirmação e chamada à API de delete <br> ● Remoção do item da interface | ● Evento removido do banco e da tela. <br> ● Feedback visual exibido.
Paginação | ● Deve exibir controles de paginação se o número de eventos exceder o limite por página. <br> ● Deve permitir navegar entre as páginas. | ● Exibição dos controles <br> ● Navegação Próxima/Anterior <br> ● Atualização da lista ao mudar de página | ● Navegação funcional e correta.
Status Visual | ● O status do evento deve ter indicação visual (cor/badge). <br> ● Ex: Verde para Ativo, Vermelho para Inativo. | ● Verificação das classes CSS ou componentes de Badge correspondentes ao status | ● Identificação visual clara do status.

## 5 - Classificação de Bugs

ID | Nivel de Severidade | Descrição
-----------|--------|--------
1 | Blocker | ● Lista não carrega (erro 500/400). <br> ● Botão de criar evento não funciona.
2 | Grave | ● Exclusão não funciona ou exclui item errado. <br> ● Filtros retornam dados incorretos.
3 | Moderada | ● Paginação com contagem errada. <br> ● Feedback visual (Toast) ausente.
4 | Pequena | ● Erros de alinhamento ou texto.

## 6 - Definição de Pronto

A funcionalidade "Meus Eventos" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
