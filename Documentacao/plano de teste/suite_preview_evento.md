# Suite de Teste - Tela Preview de Evento

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

A tela "Preview de Evento" permite ao usuário visualizar como o evento será exibido no totem antes de finalizar o cadastro ou edição. O preview renderiza em tempo real os dados preenchidos no formulário, incluindo título, descrição, local, categoria, tags, imagens, cores e animações. Esta funcionalidade é essencial para que o usuário valide a aparência do evento antes da publicação.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. Os dados do preview são armazenados temporariamente no localStorage para permitir a visualização em uma nova janela. A comunicação entre a tela de criação/edição e o preview ocorre via localStorage. A interface reproduz fielmente o layout do totem com suporte a animações CSS (Animate.css) e cores personalizáveis.

**Fluxo de Dados:**
1. Usuário preenche o formulário de criação/edição de evento.
2. Dados são salvos automaticamente no localStorage (`criar_evento_draft`).
3. URLs das imagens (blob) são salvos no localStorage (`preview-evento-blobs`).
4. Usuário clica no botão de preview.
5. Nova janela/aba abre na rota `/preview-evento`.
6. Preview carrega dados do localStorage e renderiza o evento.
7. Usuário pode atualizar o preview após fazer alterações no formulário.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|-------------------------|
| RF001 – O sistema deve exibir o título do evento no preview. | NF001 – O preview deve carregar em menos de 3 segundos. |
| RF002 – O sistema deve exibir o local do evento no preview. | NF002 – As animações devem ser suaves e não impactar a performance. |
| RF003 – O sistema deve exibir a categoria formatada em maiúsculas. | NF003 – O layout deve ser responsivo e se adaptar ao formato do totem. |
| RF004 – O sistema deve exibir a descrição do evento. | NF004 – As imagens devem ser exibidas em tela cheia como background. |
| RF005 – O sistema deve exibir as tags do evento. | |
| RF006 – O sistema deve exibir QR Code quando há link cadastrado. | |
| RF007 – O sistema deve ocultar QR Code quando não há link. | |
| RF008 – O sistema deve exibir a imagem de fundo do evento. | |
| RF009 – O sistema deve aplicar a cor selecionada corretamente. | |
| RF010 – O sistema deve aplicar a animação selecionada. | |
| RF011 – O sistema deve exibir data e horário formatados. | |
| RF012 – O sistema deve redirecionar para criação quando não há dados. | |
| RF013 – O sistema deve permitir atualizar o preview. | |

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional da renderização do preview, incluindo exibição de todos os dados do evento, comportamento do QR Code, aplicação de cores e animações, e tratamento de cenários sem dados.

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação utilizando massa de dados controlada.

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface. |

### 4.2 Casos de Teste

#### Preview via Criação de Evento

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Fluxo Completo de Preview | ● Preencher formulário completo (Etapas 1, 2 e 3). <br> ● Verificar dados salvos no localStorage. <br> ● Abrir preview e validar dados exibidos. | ● Preenchimento de todas as etapas <br> ● Verificação do localStorage <br> ● Exibição correta no preview | ● Preview exibe todos os dados preenchidos. |
| Verificação do Título no Preview | ● O título digitado deve aparecer no preview. | ● Exibição do título <br> ● Texto visível | ● Título exibido corretamente. |
| Verificação do Local no Preview | ● O local digitado deve aparecer no preview. | ● Exibição do local <br> ● Texto visível | ● Local exibido corretamente. |
| Verificação da Categoria no Preview | ● A categoria deve aparecer formatada em maiúsculas. | ● Exibição de "PALESTRA" (exemplo) <br> ● Texto visível | ● Categoria exibida corretamente. |
| Verificação das Tags no Preview | ● Todas as tags adicionadas devem aparecer no preview. | ● Exibição de cada tag <br> ● Tags em lowercase | ● Tags exibidas corretamente. |
| Verificação do QR Code no Preview | ● Quando há link, o QR Code deve ser exibido. | ● Presença da imagem com alt "QR Code do evento" | ● QR Code exibido quando há link. |

#### Preview Direto com Dados Mockados

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Exibição do Título | ● O preview deve exibir o título do evento mockado. | ● Texto do título visível <br> ● Timeout de 10 segundos | ● Título renderizado corretamente. |
| Exibição do Local | ● O preview deve exibir o local do evento mockado. | ● Texto do local visível <br> ● Timeout de 10 segundos | ● Local renderizado corretamente. |
| Exibição da Categoria Formatada | ● A categoria deve aparecer em maiúsculas (ex: "PALESTRA"). | ● Texto "PALESTRA" visível | ● Categoria formatada corretamente. |
| Exibição da Descrição | ● O preview deve exibir a descrição do evento. | ● Parte inicial da descrição visível | ● Descrição renderizada corretamente. |
| Exibição das Tags | ● Todas as tags do evento devem ser exibidas. | ● Cada tag visível em lowercase | ● Tags renderizadas corretamente. |
| Exibição do QR Code | ● O QR Code deve ser exibido quando há link. | ● Imagem com alt "QR Code do evento" visível | ● QR Code renderizado corretamente. |
| Exibição da Imagem de Fundo | ● A imagem de fundo do evento deve ser exibida. | ● Imagem com alt "Imagem de fundo do evento" existe <br> ● Atributo src contém o nome da imagem | ● Imagem de fundo renderizada corretamente. |
| Exibição do Botão Atualizar Preview | ● Deve exibir botão para atualizar o preview. | ● Botão com title "Atualizar preview" visível | ● Botão de atualização presente. |
| Exibição de Data e Horário | ● Deve exibir ícones de calendário e relógio. | ● Imagem com alt "Calendário" visível <br> ● Imagem com alt "Relógio" visível | ● Data e horário exibidos corretamente. |

#### Preview sem Dados

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Redirecionamento sem Dados | ● Ao acessar o preview sem dados no localStorage, deve redirecionar para a página de criação. | ● Remoção de dados do localStorage <br> ● Acesso ao preview <br> ● Redirecionamento para `/criar_eventos` | ● Redirecionamento ocorre corretamente. |

#### Preview sem Link (QR Code)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Ocultação do QR Code | ● Quando não há link cadastrado, o QR Code não deve ser exibido. | ● Dados mockados sem link <br> ● Título visível (preview carregou) <br> ● QR Code não existe no DOM | ● QR Code oculto quando não há link. |

#### Cores e Animações

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Aplicação da Cor Cinza Escuro | ● Ao selecionar cor "1", deve aplicar estilo correspondente. | ● Dados com cor "1" <br> ● Título visível (preview carregou) | ● Cor aplicada corretamente. |
| Aplicação da Cor Rosa | ● Ao selecionar cor "2", deve aplicar estilo correspondente. | ● Dados com cor "2" <br> ● Título visível (preview carregou) | ● Cor aplicada corretamente. |
| Aplicação da Cor Roxo | ● Ao selecionar cor "3", deve aplicar estilo correspondente. | ● Dados com cor "3" <br> ● Título visível (preview carregou) | ● Cor aplicada corretamente. |
| Aplicação da Cor Azul | ● Ao selecionar cor "4", deve aplicar estilo correspondente. | ● Dados com cor "4" <br> ● Título visível (preview carregou) | ● Cor aplicada corretamente. |
| Aplicação da Cor Verde | ● Ao selecionar cor "5", deve aplicar estilo correspondente. | ● Dados com cor "5" <br> ● Título visível (preview carregou) | ● Cor aplicada corretamente. |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Preview não carrega. <br> ● Dados do localStorage não são lidos. <br> ● Redirecionamento incorreto. |
| 2 | Grave | ● Título, local ou categoria não exibidos. <br> ● Imagem de fundo não renderiza. <br> ● QR Code exibido incorretamente. |
| 3 | Moderada | ● Cores não aplicadas corretamente. <br> ● Animações não funcionam. <br> ● Tags não exibidas. |
| 4 | Pequena | ● Erros de formatação de texto. <br> ● Ícones desalinhados. |

## 6 - Definição de Pronto

A funcionalidade "Preview de Evento" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
