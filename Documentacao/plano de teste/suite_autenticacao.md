# Suite de Teste - Autenticação (Login e Recuperação de Senha)

**IFRO Events - Plataforma de Divulgação de Eventos**

## 1 - Introdução

O módulo de autenticação permite ao usuário acessar a plataforma através da tela de Login e recuperar sua senha através da tela de Recuperação de Senha. O sistema utiliza NextAuth.js para gerenciamento de sessão e autenticação via credenciais (email/senha).

## 2 - Arquitetura

A autenticação utiliza Next.js 15 com App Router e React 19. O gerenciamento de sessão é realizado com NextAuth.js v4. A comunicação com o backend ocorre via API REST com autenticação JWT. A interface é construída com componentes reutilizáveis e estilizada com TailwindCSS 4.

**Fluxo de Login:**
1. Usuário acessa a rota `/login`.
2. Usuário preenche email e senha.
3. Usuário clica em "Entrar".
4. Sistema valida credenciais via API.
5. Sessão é criada e cookie é armazenado.
6. Usuário é redirecionado para `/meus_eventos`.

**Fluxo de Recuperação de Senha:**
1. Usuário acessa a rota `/recuperar_senha`.
2. Usuário informa seu e-mail.
3. Usuário clica em "Pedir Link de Recuperação".
4. Sistema envia e-mail com link de redefinição.
5. Usuário recebe feedback de sucesso/erro.

## 3 - Categorização dos Requisitos

| Requisito Funcional | Requisito Não Funcional |
|---------------------|-------------------------|
| RF001 – O sistema deve permitir login com email e senha. | NF001 – A validação dos campos deve ser em tempo real. |
| RF002 – O sistema deve validar campos obrigatórios antes do login. | NF002 – O feedback visual deve ser claro (Toast). |
| RF003 – O sistema deve manter a sessão do usuário (Remember me). | NF003 – A sessão deve ser segura (cookie HttpOnly). |
| RF004 – O sistema deve permitir recuperação de senha via e-mail. | NF004 – A interface deve ser responsiva. |
| RF005 – O sistema deve validar formato de e-mail. | NF005 – O tempo de resposta do login deve ser < 3s. |
| RF006 – O sistema deve redirecionar após login bem-sucedido. | |
| RF007 – O sistema deve exibir mensagem de erro para credenciais inválidas. | |

## 4 - Estratégia de Teste

### Escopo de Testes

O escopo abrange a validação funcional das telas de Login e Recuperação de Senha, incluindo renderização de elementos, validações de campos, navegação entre telas e fluxo de autenticação.

### 4.1 Ambiente e Ferramentas

Os testes serão executados em ambiente de desenvolvimento/homologação utilizando massa de dados controlada.

| Ferramenta | Time | Descrição |
|------------|------|-----------|
| Cypress | Qualidade | Testes E2E automatizados dos fluxos de interface. |

### 4.2 Casos de Teste

#### Tela de Login

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Tela | ● Ao acessar `/login`, deve exibir todos os elementos da tela. | ● Container principal visível <br> ● Logo exibido <br> ● Título "Entrar" <br> ● Subtítulo "Acesse sua conta para continuar" <br> ● Campos email e senha <br> ● Checkbox "Lembrar de mim" <br> ● Botão "Entrar" <br> ● Link "Esqueceu a senha?" | ● Tela renderizada corretamente. |
| Campo E-mail | ● Deve aceitar texto em formato de e-mail. <br> ● Deve ser obrigatório. | ● Validação de campo vazio <br> ● Validação de formato de e-mail | ● Campo preenchido corretamente. |
| Campo Senha | ● Deve aceitar texto. <br> ● Deve mascarar os caracteres. <br> ● Deve ser obrigatório. | ● Validação de campo vazio <br> ● Caracteres mascarados | ● Campo preenchido corretamente. |
| Checkbox Lembrar de Mim | ● Deve permitir marcar/desmarcar. <br> ● Deve manter sessão por mais tempo quando marcado. | ● Estado do checkbox alterável | ● Checkbox funcional. |
| Link Recuperar Senha | ● Ao clicar, deve navegar para `/recuperar_senha`. | ● Redirecionamento correto | ● Navegação bem-sucedida. |
| Login com Sucesso | ● Ao informar credenciais válidas, deve autenticar. <br> ● Deve criar cookie de sessão. <br> ● Deve redirecionar para `/meus_eventos`. | ● Chamada à API de login <br> ● Cookie de sessão criado <br> ● Redirecionamento | ● Usuário autenticado com sucesso. |
| Login com Credenciais Inválidas | ● Ao informar credenciais inválidas, deve exibir erro. | ● Toast de erro exibido <br> ● Usuário permanece na tela de login | ● Mensagem de erro exibida. |

#### Tela de Recuperação de Senha

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Renderização da Tela | ● Ao acessar `/recuperar_senha`, deve exibir todos os elementos. | ● Container principal visível <br> ● Link "Voltar para login" <br> ● Título "Recuperar Senha" <br> ● Campo de e-mail <br> ● Botão "Pedir Link de Recuperação" | ● Tela renderizada corretamente. |
| Link Voltar para Login | ● Ao clicar, deve navegar para `/login`. | ● Redirecionamento correto | ● Navegação bem-sucedida. |
| Campo E-mail | ● Deve aceitar texto em formato de e-mail. <br> ● Deve ser obrigatório. | ● Validação de campo vazio <br> ● Validação de formato de e-mail | ● Campo validado corretamente. |
| Envio sem E-mail | ● Ao tentar enviar sem preencher, deve exibir validação. | ● Mensagem de validação do navegador | ● Campo obrigatório validado. |
| Envio com E-mail Inválido | ● Ao tentar enviar com formato inválido, deve exibir erro. | ● Validação de formato de e-mail | ● Formato de e-mail validado. |

#### Navegação entre Telas

| Funcionalidades | Comportamento Esperado | Verificações | Critérios de Aceite |
|-----------------|------------------------|--------------|---------------------|
| Login → Recuperar Senha | ● Clicar em "Esqueceu a senha?" deve navegar para recuperação. | ● URL inclui `/recuperar_senha` | ● Navegação correta. |
| Recuperar Senha → Login | ● Clicar em "Voltar para login" deve navegar para login. | ● URL inclui `/login` | ● Navegação correta. |

## 5 - Classificação de Bugs

| ID | Nível de Severidade | Descrição |
|----|---------------------|-----------|
| 1 | Blocker | ● Login não funciona (erro 500/400). <br> ● Sessão não é criada após login. <br> ● Redirecionamento não ocorre. |
| 2 | Grave | ● Validações não funcionam. <br> ● Cookie de sessão não persiste. <br> ● E-mail de recuperação não é enviado. |
| 3 | Moderada | ● Toast de feedback não aparece. <br> ● Link de navegação não funciona. |
| 4 | Pequena | ● Erros de alinhamento ou texto. <br> ● Labels com texto incorreto. |

## 6 - Definição de Pronto

O módulo de autenticação estará pronto quando todos os casos de teste acima forem executados com sucesso no ambiente de homologação e os critérios de aceite forem atendidos.
