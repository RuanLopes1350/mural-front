# IFRO Events - Plataforma de Divulgação de Eventos

Plataforma web para divulgação e gerenciamento de eventos do IFRO (Instituto Federal de Rondônia). O sistema conta com uma interface administrativa para cadastro e gerenciamento de eventos, além de um modo totem para exibição pública em telas de divulgação.

## 🎯 Natureza do Projeto

Sistema de gestão de eventos que permite:
- Cadastro e edição de eventos
- Visualização de eventos em formato totem (slideshow)
- Personalização de cores e animações por evento
- Upload de imagens e QR codes
- Categorização e tags para organização

## 🚀 Stack Tecnológica

### Core
- **Next.js 15.5** - Framework React com App Router
- **React 19** - Biblioteca Node.Js para interfaces
- **TypeScript 5** - Superset JavaScript com tipagem estática

### Estilização
- **Tailwind CSS 4** - Framework CSS utility-first
- **Animate.css** - Biblioteca de animações CSS

### UI Components
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Ícones

### Gerenciamento de Estado
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono e cache
- **React Toastify** - Notificações toast

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS & Autoprefixer** - Processamento de CSS

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start
```

## 🖥️ Rotas Principais

- `/login` - Autenticação de usuários
- `/cadastro` - Cadastro de novos usuários
- `/criar_eventos` - Criar novo evento
- `/editar_eventos` - Editar evento existente
- `/meus_eventos` - Gerenciar eventos do usuário
- `/totem` - Modo totem para exibição pública

---

**Desenvolvido por:** Alunos do curso de Análise e Desenvolvimento de Sistemas  
**Instituição:** IFRO - Instituto Federal de Rondônia | Campus Vilhena
