# Plano de Teste

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

O IFRO Events é um sistema web para gerenciamento e divulgação de eventos institucionais. A principal finalidade é exibir esses eventos de forma interativa e automatizada em totens digitais espalhados pelo campus, além de oferecer um painel administrativo para gestão completa.

## 2 - Arquitetura

O sistema utiliza Next.js 15 com App Router como framework principal para o frontend, que possui uma arquitetura orientada a componentes com React 19. A aplicação implementa Server-Side Rendering (SSR) e Client-Side Rendering (CSR) conforme necessário.

**Stack Tecnológica:**
- **Frontend:** Next.js 15, React 19, TypeScript
- **Estilização:** TailwindCSS 4
- **Gerenciamento de Estado:** React Query (TanStack Query v5)
- **Validação de Formulários:** React Hook Form + Zod
- **Autenticação:** NextAuth.js v4
- **UI Components:** Radix UI
- **Notificações:** React Toastify
- **Testes E2E:** Cypress
- **Containerização:** Docker

Para o armazenamento, consulta e alteração de dados da aplicação, o sistema consome uma API REST (Node.js/Express) que disponibiliza endpoints para eventos, usuários e uploads. A comunicação é feita através de requisições HTTP com autenticação via Bearer Token (JWT), retornando dados em formato JSON. O armazenamento de arquivos é feito via MinIO e o banco de dados é MongoDB.

**Fluxo de Arquitetura:**
1. Cliente (Next.js App) → Requisição HTTP com Token JWT (Painel) ou Pública (Totem)
2. API REST → Processa, valida requisição e gerencia arquivos no MinIO
3. Retorna resposta JSON com dados paginados
4. Cliente atualiza estado e UI usando React Query

## 3 - Categorização dos Requisitos em Funcionais x Não Funcionais

Requisito Funcional    | Requisito Não Funcional |
-----------|--------|
RF001 – O sistema deve permitir o login de administradores via matrícula e senha. | NF001 – O sistema deve exibir mensagens de feedback (toast notifications) para ações de sucesso ou erro.
RF002 – O sistema deve permitir cadastrar eventos com título, descrição, datas, local e configurações de exibição (dias/horários). | NF002 – O sistema deve implementar proteção de rotas administrativas (middleware).
RF003 – O sistema deve permitir o upload de mídias (imagens e vídeos) para os eventos. | NF003 – O sistema deve ser responsivo e otimizado para telas de Totem (Full HD vertical/horizontal).
RF004 – O sistema deve gerar automaticamente um QR Code para o link de inscrição do evento. | NF004 – O tempo de resposta da API para listagem no Totem deve ser baixo para não travar a exibição.
RF005 – O sistema deve listar eventos no Totem filtrando apenas os ativos e dentro do período de exibição. | 
RF006 – O sistema deve permitir editar e excluir eventos existentes (apenas pelo dono ou admin).
RF007 – O sistema deve permitir visualizar um preview do evento antes de publicar.
RF008 – O sistema deve permitir filtrar eventos no painel por título, status e categoria.
RF009 – O sistema deve permitir o cadastro de novos usuários administrativos (apenas por admins), informando nome e e-mail.
RF010 – O sistema deve permitir alterar o status (ativo/inativo) e permissões de administrador de usuários existentes.
RF011 – O sistema deve permitir a exclusão de usuários mediante confirmação.

### Casos de Teste

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
| :--- | :--- | :--- | :--- |
| **Login Administrativo** | ● Ao digitar email e senha corretos, o usuário deve acessar o painel administrativo.<br>● Ao falhar, deve exibir mensagem de erro. | ● Login com credenciais válidas<br>● Login com senha incorreta<br>● Tentativa de acesso a rota protegida sem login | ● Redirecionamento para `/administrativo` após sucesso.<br>● Bloqueio de acesso sem token válido. |
| **Criar Evento** | ● O usuário deve preencher o formulário em 3 etapas (Dados, Mídia, Configuração).<br>● Deve validar datas (Início < Fim) e campos obrigatórios. | ● Preenchimento completo com sucesso<br>● Validação de campos obrigatórios (Zod)<br>● Validação de datas inconsistentes<br>● Upload de imagem/vídeo válido | ● Evento criado e listado em "Meus Eventos".<br>● Feedback visual de sucesso. |
| **Editar Evento** | ● O usuário deve conseguir alterar os dados de um evento existente.<br>● O formulário deve vir preenchido com os dados atuais.<br>● Deve validar as alterações conforme as regras de criação. | ● Carregamento dos dados corretos no formulário<br>● Edição de campos obrigatórios e opcionais<br>● Validação de datas na edição<br>● Substituição de mídia (imagem/vídeo) | ● Alterações salvas e refletidas na listagem e no totem.<br>● Feedback visual de sucesso após salvar. |
| **Listagem de Eventos** | ● O painel deve listar os eventos com paginação.<br>● Deve permitir filtrar por título ou status. | ● Carregamento da lista inicial<br>● Funcionamento da paginação<br>● Filtro por título retornando resultados corretos | ● Exibição correta dos cards de evento.<br>● Navegação fluida entre páginas. |
| **Totem de Exibição** | ● A rota `/totem` deve exibir apenas eventos ativos e válidos para o momento.<br>● Deve alternar entre os eventos automaticamente (se houver carrossel/animação). | ● Acesso à rota pública `/totem`<br>● Verificar se eventos inativos aparecem (não devem)<br>● Exibição de QR Code se houver link | ● Interface limpa sem controles administrativos.<br>● Loop de exibição funcionando. |
| **Gerenciamento de Usuários** | ● O admin deve conseguir cadastrar novos usuários (Nome/Email).<br>● O admin deve conseguir alternar status (Ativo/Inativo) e permissão de Admin.<br>● O admin deve conseguir excluir usuários. | ● Cadastro de usuário com email válido<br>● Tentativa de cadastro com email duplicado<br>● Toggle de status (Ativo/Inativo)<br>● Toggle de permissão Admin<br>● Exclusão com modal de confirmação | ● Novo usuário listado após cadastro.<br>● Alterações de status/admin refletidas na tabela.<br>● Usuário removido da lista após exclusão. |

## 4 - Estratégia de Teste

●	Escopo de Testes

O plano de testes abrange as funcionalidades de gestão de eventos (CRUD), autenticação administrativa e visualização no Totem.

Serão executados testes em todos os níveis conforme a descrição abaixo.

Testes Unitários: Focados nas regras de negócio do Backend (Services/Models) e validações do Frontend (Schemas Zod).
Testes de Integração: Testes dos endpoints da API (Controllers/Routes) garantindo a comunicação correta com o Banco de Dados e MinIO.
Testes Automatizados (E2E): Fluxos críticos no Frontend (Login -> Criar Evento -> Visualizar no Totem) usando Cypress.
Testes Manuais: Validação de UX/UI, responsividade do Totem e casos de borda não cobertos por automação.

●	Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação (Dockerizado).

As seguintes ferramentas serão utilizadas no teste:

Ferramenta | 	Time |	Descrição 
-----------|--------|--------
Jest | Desenvolvimento | Framework para testes unitários e de integração (Backend).
Cypress | Qualidade/Dev | Ferramenta para testes End-to-End (Frontend).
Postman | Qualidade | Ferramenta para testes manuais de API.
React Testing Library | Desenvolvimento | Testes de componentes React (se aplicável).

## 5 - Classificação de Bugs

Os Bugs serão classificados com as seguintes severidades:

ID 	|Nivel de Severidade |	Descrição 
-----------|--------|--------
1	|Blocker |	●	Bug que impede o funcionamento do Totem ou Login. <br>●	Crash da aplicação. <br>●	Perda de dados.
2	|Grave |	●	Funcionalidade principal com erro (ex: não salva evento, QR Code errado).
3	|Moderada |	●	Falha em validações não críticas, filtros não funcionando perfeitamente.
4	|Pequena |	●	Erros ortográficos, alinhamento visual, melhorias de UX.

### 6 - 	Definição de Pronto 
Será considerada pronta as funcionalidades que passarem pelas verificações e testes descritas nestes planos de testes, não apresentarem bugs com a severidade acima de Minor, e passarem por uma validação de negócio de responsabilidade do time de produto.


