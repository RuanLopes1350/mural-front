# Suite de Teste - Totem de Eventos

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

A tela "Totem" é a interface pública de visualização automática de eventos institucionais. Exibe os eventos ativos em modo carrossel/slideshow, alternando entre imagens e eventos de forma automática e contínua. É projetada para funcionar em totens digitais (monitores verticais ou horizontais) espalhados pelo campus, sem necessidade de interação do usuário.

## 2 - Arquitetura

A tela utiliza Next.js 15 com App Router e React 19. O gerenciamento de estado e cache dos dados é realizado pelo React Query (TanStack Query v5). A comunicação com o backend ocorre via API REST pública (sem autenticação para visualização). A interface é construída com componentes reutilizáveis e estilizada com TailwindCSS 4, utilizando animações CSS (Animate.css).

**Fluxo de Dados:**
1. Aplicação acessa a rota `/totem` (pública, sem autenticação).
2. React Query solicita os eventos ativos ao endpoint `/totem/eventos`.
3. API retorna apenas eventos válidos (status ativo, dentro do período de exibição).
4. Interface renderiza o evento atual com suas imagens, informações e configurações visuais.
5. Sistema alterna automaticamente entre imagens e eventos conforme configurado (duração, loops).
6. Para eventos com link de inscrição, busca e exibe o QR Code via `/eventos/:id/qrcode`.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|-------------------------|
| RF001 – O sistema deve exibir apenas eventos ativos e dentro do período de exibição configurado. | NF001 – A interface deve ser responsiva e otimizada para telas Full HD (1920x1080) verticais e horizontais. |
| RF002 – O sistema deve alternar automaticamente entre as imagens de cada evento conforme a duração configurada. | NF002 – As transições entre imagens e eventos devem ser fluidas e com animações configuráveis. |
| RF003 – O sistema deve repetir o ciclo de imagens de cada evento conforme o número de loops configurado. | NF003 – O carregamento dos eventos deve ser rápido para não causar telas brancas no totem. |
| RF004 – O sistema deve aplicar a cor de fundo lateral configurada para cada evento. | NF004 – O QR Code deve carregar de forma assíncrona sem bloquear a exibição do evento. |
| RF005 – O sistema deve aplicar a animação de transição configurada para cada evento. | NF005 – Deve exibir feedback visual em estados de loading, erro e lista vazia. |
| RF006 – O sistema deve exibir as informações do evento: Título, Datas, Horário, Local, Categoria, Tags, Descrição. | |
| RF007 – O sistema deve formatar datas no padrão "DD MMM AAAA" (ex: 20 DEZ 2025). | |
| RF008 – O sistema deve exibir a categoria em MAIÚSCULAS e as tags em minúsculas. | |
| RF009 – O sistema deve exibir indicadores visuais (dots) para representar as imagens do evento. | |
| RF010 – O sistema deve exibir uma barra de progresso indicando o loop atual do evento. | |
| RF011 – O sistema deve buscar e exibir o QR Code se o evento possuir link de inscrição. | |
| RF012 – O sistema deve exibir mensagem "QR Code não disponível" se a busca falhar. | |
| RF013 – O sistema deve ocultar completamente o bloco de QR Code se o evento não tiver link. | |
| RF014 – O sistema deve exibir mensagem de erro amigável quando a API falhar. | |
| RF015 – O sistema deve exibir mensagem informativa quando não houver eventos disponíveis. | |

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional da exibição automática de eventos, transições, animações, indicadores visuais, QR Code e estados de erro/loading/vazio.

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação (QA) utilizando massa de dados controlada (fixtures).

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface e intercepts de API. |

### 4.2 Casos de Teste

#### Estados Iniciais

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Estado de Carregamento | ● Enquanto busca os eventos, deve exibir tela de loading com: <br> - Spinner animado <br> - Mensagem "Carregando eventos..." <br> - Gradiente de fundo (indigo-950 to purple-900). | ● Mensagem de loading visível <br> ● Spinner presente <br> ● Gradiente de fundo aplicado | ● Feedback visual claro durante carregamento. |
| Estado de Erro | ● Se a API retornar erro (500), deve exibir: <br> - Emoji ❌ <br> - Mensagem "Erro ao carregar eventos" <br> - Submensagem "Por favor, verifique a conexão com o servidor." <br> - Gradiente de fundo vermelho (red-950 to red-800). | ● Mensagem de erro visível <br> ● Texto secundário presente <br> ● Gradiente de erro aplicado | ● Erro comunicado de forma clara e amigável. |
| Lista Vazia | ● Se não houver eventos disponíveis, deve exibir: <br> - Emoji 📅 <br> - Mensagem "Nenhum evento disponível" <br> - Submensagem "Não há eventos programados para exibição no momento." <br> - Gradiente de fundo (indigo-950 to purple-900). | ● Mensagem de lista vazia visível <br> ● Texto secundário presente <br> ● Gradiente de fundo aplicado | ● Estado vazio tratado adequadamente. |

#### Visualização de Eventos

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Exibição dos Dados Principais | ● Deve exibir as informações do evento retornado pela API: <br> - Título do evento <br> - Local <br> - Datas formatadas (DD MMM AAAA) <br> - Horário (HH:MM - HH:MM). | ● Título visível e correto <br> ● Local visível <br> ● Datas formatadas (ex: "20 DEZ 2025") <br> ● Horário formatado (ex: "12:00 - 15:00") | ● Dados principais exibidos corretamente. |
| Categoria em Maiúsculas | ● A categoria do evento deve ser exibida em CAIXA ALTA. <br> ● Ex: "tecnologia" → "TECNOLOGIA". | ● Texto da categoria em maiúsculas | ● Formatação de categoria correta. |
| Tags em Minúsculas | ● As tags do evento devem ser exibidas em minúsculas. <br> ● Ex: "Robotica" → "robotica". | ● Texto das tags em minúsculas | ● Formatação de tags correta. |
| Indicadores de Imagens (Dots) | ● Deve exibir círculos (dots) representando cada imagem do evento. <br> ● O dot da imagem atual deve estar preenchido (branco). <br> ● Os demais dots devem estar semi-transparentes (branco/30). | ● Quantidade de dots = quantidade de imagens <br> ● Dot ativo preenchido <br> ● Demais dots semi-transparentes | ● Indicadores visuais corretos. |
| Barra de Progresso de Loops | ● Deve exibir uma barra de progresso horizontal. <br> ● A largura da barra deve representar o progresso dos loops. <br> ● Ex: Loop 1 de 2 = 50% de largura. | ● Barra de progresso visível <br> ● Largura calculada corretamente ((loop atual + 1) / total loops * 100%) | ● Progresso visual correto. |
| Aplicação da Cor de Fundo | ● A barra lateral de informações deve aplicar a classe CSS correspondente à cor configurada no evento. <br> ● Ex: cor = 4 → `bg-blue-900/90`. | ● Barra lateral com classe CSS correta <br> ● Cor visual correspondente ao mock | ● Cor de tema aplicada corretamente. |
| Aplicação da Animação | ● O wrapper de fundo animado deve aplicar a classe CSS correspondente à animação configurada. <br> ● Ex: animacao = 2 → `animate__fadeInUp`. | ● Elemento de fundo com classe CSS correta <br> ● Animação visual correspondente ao mock | ● Animação de transição aplicada. |

#### QR Code

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização do QR Code | ● Se o evento possui link, deve exibir o QR Code na barra lateral. <br> ● Imagem do QR Code deve ser renderizada após busca na API. | ● Bloco de QR Code visível <br> ● Imagem carregada <br> ● Src da imagem contém o base64 retornado pela API | ● QR Code exibido corretamente. |
| Loader durante Carregamento | ● Enquanto busca o QR Code, deve exibir um spinner de loading. | ● Spinner visível antes do QR Code carregar <br> ● Spinner desaparece após sucesso | ● Feedback visual durante carregamento. |
| Mensagem de QR Code Indisponível | ● Se a busca do QR Code falhar (erro 500), deve exibir: "QR Code não disponível". | ● Mensagem de fallback visível <br> ● Imagem de QR Code não renderizada | ● Erro de QR Code tratado. |
| Ausência do Bloco de QR Code | ● Se o evento não possui link, o bloco de QR Code não deve ser renderizado. | ● Elemento `[data-test="qr-container"]` não existe no DOM | ● Layout adaptado para eventos sem link. |

#### Animações e Transições

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Animação de Entrada | ● Ao trocar de imagem, deve aplicar a animação configurada (ex: `animate__fadeInUp`). | ● Classe Animate.css aplicada ao wrapper | ● Transição visual suave. |
| Animação de Zoom da Imagem | ● A imagem de fundo deve ter animação de zoom+deslize (`animate-zoomInSlide`). | ● Classe CSS aplicada ao elemento `<img>` | ● Efeito visual Ken Burns aplicado. |
| Cor de Fundo Variável | ● A barra lateral deve mudar de cor a cada evento conforme configuração. | ● Classes CSS dinâmicas aplicadas | ● Variedade visual mantida. |

#### Responsividade (Observacional)

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Layout em Telas Grandes (Full HD) | ● Em 1920x1080, a barra lateral deve ocupar ~50% da largura. <br> ● Textos devem estar legíveis. | ● Barra lateral proporcional <br> ● Fonte adequada | ● Interface otimizada para totem. |
| Layout em Dispositivos Móveis | ● Em telas menores, a barra lateral deve ocupar mais espaço (85-100%). | ● Responsividade das classes Tailwind <br> ● Textos ainda legíveis | ● Visualização funcional em mobile. |

#### Testes Específicos de Intercept e Mock

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Mock de Eventos com Link | ● Ao interceptar `/totem/eventos` com fixture contendo eventos com link, deve buscar e exibir QR Code. | ● Intercept de eventos <br> ● Intercept de QR Code <br> ● QR Code renderizado | ● Integração API funcionando. |
| Mock de Eventos sem Link | ● Ao interceptar `/totem/eventos` com fixture contendo eventos sem link, não deve renderizar bloco de QR Code. | ● Intercept de eventos <br> ● Ausência do bloco de QR Code | ● Lógica condicional correta. |
| Mock de QR Code com Delay | ● Ao configurar delay no intercept do QR Code, deve exibir loader e depois a imagem. | ● Loader visível durante delay <br> ● Imagem aparece após delay | ● Assincronicidade tratada. |
| Mock de QR Code com Erro | ● Ao retornar erro 500 no intercept do QR Code, deve exibir mensagem de fallback. | ● Intercept com statusCode 500 <br> ● Mensagem "QR Code não disponível" visível | ● Erro de QR Code tratado. |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Totem não carrega eventos (erro 500/400). <br> ● Slideshow não alterna entre eventos/imagens. <br> ● Interface trava ou congela. |
| 2 | Grave | ● Animações não funcionam. <br> ● Cor de fundo não muda conforme configuração. <br> ● QR Code não carrega mesmo com link válido. <br> ● Barra de progresso não atualiza. |
| 3 | Moderada | ● Formatação de data incorreta. <br> ● Tags ou categoria com formatação errada (maiúsculas/minúsculas trocadas). <br> ● Indicadores (dots) não refletem imagem atual. <br> ● QR Code não centralizado. |
| 4 | Pequena | ● Erros de alinhamento ou espaçamento. <br> ● Textos truncados desnecessariamente. <br> ● Logo IFRO EVENTS desalinhado. |

## 6 - Definição de Pronto

A funcionalidade "Totem de Eventos" estará pronta quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.

---

## Anexo: Resumo dos Testes Automatizados (Cypress)

**Total de Testes Implementados:** 11

### Categorias Cobertas:

1. **Estados Iniciais** (3 testes)
   - Loading, erro ao carregar, lista vazia.

2. **Visualização de Eventos** (7 testes)
   - Dados principais (título, local, data, horário).
   - Categoria em maiúsculas e tags em minúsculas.
   - Indicadores de imagens e barra de progresso de loops.
   - Aplicação de cor e animação configuradas.
   - Renderização do QR Code quando o evento possui link.
   - Loader do QR Code durante carregamento.
   - Mensagem de fallback quando QR Code não está disponível.

3. **Evento sem Link** (1 teste)
   - Não renderização do bloco de QR Code.

**Ambiente de Execução:** QA (https://ruan-silva-3000.code.fslab.dev)

**Fixtures Utilizadas:**
- `totem_eventos.json` - Eventos com link e múltiplas imagens.
- `totem_evento_sem_link.json` - Evento sem link de inscrição.
- `totem_qrcode.json` - Resposta da API de QR Code com base64.

**Status:** ✅ Todos os 11 testes passando

---

## Anexo: Mapeamento de Cores e Animações

### Cores Configuráveis (Barra Lateral)

| Código | Classe CSS | Cor Visual |
|--------|-----------|------------|
| 1 | `bg-gray-900/90` | Cinza |
| 2 | `bg-pink-900/90` | Rosa |
| 3 | `bg-purple-900/90` | Roxo |
| 4 | `bg-blue-900/90` | Azul |
| 5 | `bg-green-900/90` | Verde |
| 6 | `bg-yellow-900/90` | Amarelo |
| 7 | `bg-orange-900/90` | Laranja |
| 8 | `bg-red-900/90` | Vermelho |
| 9 | `bg-transparent` | Transparente |

### Animações Configuráveis (Animate.css)

| Código | Classe CSS | Efeito |
|--------|-----------|--------|
| 1 | `animate__fadeIn` | Fade simples |
| 2 | `animate__fadeInUp` | Fade subindo |
| 3 | `animate__fadeInDown` | Fade descendo |
| 4 | `animate__slideInLeft` | Deslizar da esquerda |
| 5 | `animate__slideInRight` | Deslizar da direita |
| 6 | `animate__zoomIn` | Zoom de entrada |
| 7 | `animate__flipInX` | Flip horizontal |
| 8 | `animate__bounceIn` | Entrada com bounce |
| 9 | `animate__backInDown` | Back down |
| 10 | `animate__backInUp` | Back up |
