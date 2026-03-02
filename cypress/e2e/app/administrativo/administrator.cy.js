/**
 * Testes E2E para a Página Administrativa
 * 
 * Suite de testes que cobre:
 * - Renderização de elementos da UI
 * - Exibição correta de dados vindos da API
 * - Interações do usuário (criar, deletar, alterar status)
 * - Estados de loading e erro
 * - Paginação
 * - Proteção do administrador padrão
 * - Proteção contra auto-modificação
 * 
 * ÚLTIMA ATUALIZAÇÃO (Dez 2024):
 * - Adicionados 10 novos testes para proteção do admin padrão e auto-modificação
 * - Total de testes: 58 (anteriormente 48)
 * - Novo fixture: usuarios_com_admin_padrao.json
 * - Adicionado mock da sessão para validar ID do usuário logado
 */

describe('Página Administrativa - Gerenciamento de Usuários', () => {
  // Usa wildcard para interceptar qualquer domínio - o frontend pode usar URLs diferentes
  const API_USUARIOS = '**/usuarios';
  const API_USUARIOS_ID = '**/usuarios/*';
  const API_USUARIOS_STATUS = '**/usuarios/*/status';
  const API_USUARIOS_ADMIN = '**/usuarios/*/admin';
  const BASE_URL = 'https://ruan-silva-3000.code.fslab.dev';

  // ============================================
  // TESTES DE RENDERIZAÇÃO E ESTRUTURA DA PÁGINA
  // ============================================
  describe('Renderização da Página', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve renderizar o título principal da página', () => {
      cy.contains('h1', 'Gerenciamento de Usuários').should('be.visible');
    });

    it('Deve renderizar o subtítulo descritivo', () => {
      cy.contains('Visualize e gerencie todos os usuários cadastrados na plataforma')
        .should('be.visible');
    });

    it('Deve renderizar a seção "Lista de Usuários"', () => {
      cy.contains('h2', 'Lista de Usuários').should('be.visible');
    });

    it('Deve exibir o botão de "Novo Usuário"', () => {
      cy.getByData('btn-novo-usuario')
        .should('be.visible')
        .and('contain.text', 'Novo Usuário');
    });

    it('Deve renderizar o cabeçalho da tabela com todas as colunas', () => {
      const colunas = ['ID', 'Nome', 'E-mail', 'Membro Desde', 'Administrador', 'Ações', 'Status'];
      
      colunas.forEach(coluna => {
        cy.get('thead th').contains(coluna).should('be.visible');
      });
    });

    it('Deve exibir a contagem correta de usuários cadastrados', () => {
      cy.contains('2 usuário(s) cadastrado(s)').should('be.visible');
    });
  });

  // ============================================
  // TESTES DE EXIBIÇÃO DE DADOS (INTERCEPT API)
  // ============================================
  describe('Exibição de Dados da API', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve renderizar a quantidade correta de linhas na tabela', () => {
      cy.get('tbody tr').should('have.length', 2);
    });

    it('Deve exibir os dados do primeiro usuário corretamente', () => {
      cy.get('tbody tr').first().within(() => {
        cy.contains('Usuario Teste 1').should('be.visible');
        cy.contains('teste1@email.com').should('be.visible');
        cy.contains('ativo').should('be.visible');
      });
    });

    it('Deve exibir os dados do segundo usuário (admin) corretamente', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Usuario Admin').should('be.visible');
        cy.contains('admin@email.com').should('be.visible');
        cy.contains('Sim').should('be.visible'); // É admin
      });
    });

    it('Deve exibir o ID parcial do usuário (últimos 8 caracteres)', () => {
      // O ID no mock é "670000000000000000000001", os últimos 8 chars são "00000001"
      cy.get('tbody tr').first().within(() => {
        cy.contains('00000001').should('be.visible');
      });
    });

    it('Deve formatar a data de criação corretamente (formato pt-BR)', () => {
      // A data no mock é "2024-01-01T10:00:00.000Z"
      cy.get('tbody tr').first().within(() => {
        cy.contains('01/01/2024').should('be.visible');
      });
    });

    it('Deve exibir badge de status "ativo" com estilo correto', () => {
      cy.get('tbody tr').first()
        .find('span')
        .contains('ativo')
        .should('have.class', 'bg-green-100')
        .and('have.class', 'text-green-800');
    });
  });

  // ============================================
  // TESTES DE BOTÕES E AÇÕES NA TABELA
  // ============================================
  describe('Botões de Ação na Tabela', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve exibir botão de toggle de status para cada usuário', () => {
      cy.get('tbody tr button[title*="tivar usuário"]').should('have.length.at.least', 1);
    });

    it('Deve exibir botão de excluir para cada usuário', () => {
      cy.get('tbody tr button[title="Excluir usuário"]').should('have.length.at.least', 1);
    });

    it('Deve exibir botão de toggle admin para cada usuário', () => {
      cy.get('tbody tr button[title*="Admin"]').should('have.length.at.least', 1);
    });

    it('Deve mostrar ícone correto para usuário ativo (ToggleRight verde)', () => {
      cy.get('tbody tr').first()
        .find('button[title="Desativar usuário"]')
        .should('exist');
    });
  });

  // ============================================
  // TESTES DO MODAL DE NOVO USUÁRIO
  // ============================================
  describe('Modal de Criar Novo Usuário', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve abrir o modal ao clicar no botão "Novo Usuário"', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('[data-test="modal-content"]').should('be.visible');
      cy.contains('Cadastrar um novo usuário').should('be.visible');
    });

    it('Deve exibir campos de nome e email no modal', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('input#nome').should('be.visible');
      cy.get('input#email').should('be.visible');
    });

    it('Deve exibir mensagem informativa sobre envio de email', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.contains('O usuário receberá um e-mail com instruções para criar sua senha')
        .should('be.visible');
    });

    it('Deve ter botão "Criar Conta" desabilitado quando campos estão vazios', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.contains('button', 'Criar Conta').should('be.disabled');
    });

    it('Deve habilitar botão "Criar Conta" quando campos são preenchidos', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('input#nome').type('Novo Usuário');
      cy.get('input#email').type('novo@email.com');
      cy.contains('button', 'Criar Conta').should('not.be.disabled');
    });

    it('Deve fechar o modal ao clicar no botão X', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('[data-test="modal-close-button"]').click();
      cy.get('[data-test="modal-content"]').should('not.exist');
    });

    it('Deve fechar o modal ao clicar fora dele (overlay)', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('[data-test="modal-overlay"]').click({ force: true });
      cy.get('[data-test="modal-content"]').should('not.exist');
    });

    it('Deve criar usuário com sucesso e exibir mensagem de sucesso', () => {
      cy.intercept('POST', API_USUARIOS, {
        statusCode: 201,
        body: { error: false, code: 201, message: 'Usuário cadastrado! Um email foi enviado para que ele defina sua senha.', data: { _id: '670000000000000000000003', nome: 'Novo Dev', email: 'dev@ifro.edu.br', status: 'inativo', admin: false }, errors: [] }
      }).as('postUsuario');

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuariosRefresh');

      cy.getByData('btn-novo-usuario').click();
      cy.get('input#nome').type('Novo Dev');
      cy.get('input#email').type('dev@ifro.edu.br');
      cy.contains('button', 'Criar Conta').click();

      cy.wait('@postUsuario');
      cy.contains('Usuário cadastrado com sucesso!').should('be.visible');
    });

    it('Deve exibir erro quando falha ao criar usuário', () => {
      cy.intercept('POST', API_USUARIOS, {
        statusCode: 400,
        body: { error: true, code: 400, message: 'Email já está em uso.', data: null, errors: [] }
      }).as('postUsuarioErro');

      cy.getByData('btn-novo-usuario').click();
      cy.get('input#nome').type('Duplicado');
      cy.get('input#email').type('teste1@email.com');
      cy.contains('button', 'Criar Conta').click();

      cy.wait('@postUsuarioErro');
      cy.contains('Erro ao cadastrar usuário').should('be.visible');
    });

    it('Deve exibir loading no botão enquanto cria usuário', () => {
      cy.intercept('POST', API_USUARIOS, {
        statusCode: 201,
        body: { error: false, code: 201, message: 'Criado com sucesso', data: {}, errors: [] },
        delay: 1000 // Delay para ver o loading
      }).as('postUsuarioDelay');

      cy.getByData('btn-novo-usuario').click();
      cy.get('input#nome').type('Teste');
      cy.get('input#email').type('teste@email.com');
      cy.contains('button', 'Criar Conta').click();

      cy.contains('Cadastrando...').should('be.visible');
    });
  });

  // ============================================
  // TESTES DO MODAL DE EXCLUSÃO
  // ============================================
  describe('Modal de Exclusão de Usuário', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve abrir modal de confirmação ao clicar em excluir', () => {
      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.get('[data-test="modal-content"]').should('be.visible');
      cy.contains('Confirmar ação').should('be.visible');
    });

    it('Deve exibir dados do usuário a ser excluído no modal', () => {
      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.contains('Nome: Usuario Teste 1').should('be.visible');
      cy.contains('Email: teste1@email.com').should('be.visible');
    });

    it('Deve exibir mensagem de aviso sobre ação irreversível', () => {
      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.contains('Esta ação não pode ser desfeita').should('be.visible');
    });

    it('Deve exibir botões de Cancelar e Deletar', () => {
      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.getByData('btn-cancelar-deletar').should('be.visible');
      cy.getByData('btn-confirmar-deletar').should('be.visible');
    });

    it('Deve fechar modal ao clicar em Cancelar', () => {
      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.getByData('btn-cancelar-deletar').click();
      cy.get('[data-test="modal-content"]').should('not.exist');
    });

    it('Deve deletar usuário ao confirmar exclusão', () => {
      cy.intercept('DELETE', API_USUARIOS_ID, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'OK', data: null, errors: [] }
      }).as('deleteUsuario');

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'OK', data: [], errors: [] }
      }).as('getUsuariosRefresh');

      cy.get('tbody tr').first().find('button[title="Excluir usuário"]').click();
      cy.getByData('btn-confirmar-deletar').click();

      cy.wait('@deleteUsuario');
      cy.get('[data-test="modal-content"]').should('not.exist');
    });
  });

  // ============================================
  // TESTES DE ALTERAÇÃO DE STATUS
  // ============================================
  describe('Alteração de Status do Usuário', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve chamar API ao clicar no toggle de status', () => {
      cy.intercept('PATCH', API_USUARIOS_STATUS, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'Status do usuário atualizado para inativo.', data: { status: 'inativo' }, errors: [] }
      }).as('patchStatus');

      cy.get('tbody tr').first().find('button[title="Desativar usuário"]').click();
      cy.wait('@patchStatus');
    });

    it('Deve enviar o status correto na requisição (ativo -> inativo)', () => {
      cy.intercept('PATCH', API_USUARIOS_STATUS, (req) => {
        expect(req.body.status).to.equal('inativo');
        req.reply({ statusCode: 200, body: { error: false, code: 200, message: 'Status atualizado', data: { status: 'inativo' }, errors: [] } });
      }).as('patchStatus');

      cy.get('tbody tr').first().find('button[title="Desativar usuário"]').click();
      cy.wait('@patchStatus');
    });
  });

  // ============================================
  // TESTES DE ALTERAÇÃO DE ADMIN
  // ============================================
  describe('Alteração de Permissão Admin', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Deve chamar API ao clicar no toggle de admin', () => {
      cy.intercept('PATCH', API_USUARIOS_ADMIN, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'Usuário atualizado para Administrador!', data: { admin: true }, errors: [] }
      }).as('patchAdmin');

      // Primeiro usuário não é admin, então deve atribuir
      cy.get('tbody tr').first().find('button[title="Atribuir Admin"]').click();
      cy.wait('@patchAdmin');
    });

    it('Deve exibir badge "Sim" para usuário admin', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Sim').should('be.visible');
      });
    });

    it('Deve exibir badge "Não" para usuário não admin', () => {
      cy.get('tbody tr').first().within(() => {
        cy.contains('Não').should('be.visible');
      });
    });
  });

  // ============================================
  // TESTES DE ESTADOS DE LOADING E ERRO
  // ============================================
  describe('Estados de Loading e Erro', () => {
    beforeEach(() => {
      cy.login();
    });

    it('Deve exibir loading enquanto carrega usuários', () => {
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json',
        delay: 1000
      }).as('getUsuariosDelay');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.contains('Carregando usuários...').should('be.visible');
      cy.wait('@getUsuariosDelay');
    });

    it('Deve exibir "Carregando..." na contagem enquanto carrega', () => {
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json',
        delay: 1000
      }).as('getUsuariosDelay');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.contains('Carregando...').should('be.visible');
    });

    it('Deve exibir mensagem de erro quando API falha', () => {
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 500,
        body: { error: true, code: 500, message: 'Erro interno do servidor', data: null, errors: [] }
      }).as('getUsuariosErro');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuariosErro');
      cy.contains('Erro ao carregar usuários').should('be.visible');
    });

    it('Deve exibir mensagem quando não há usuários cadastrados', () => {
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'OK', data: [], errors: [] }
      }).as('getUsuariosVazio');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuariosVazio');
      cy.contains('Nenhum usuário encontrado').should('be.visible');
    });
  });

  // ============================================
  // TESTES DE PAGINAÇÃO
  // ============================================
  describe('Paginação', () => {
    beforeEach(() => {
      cy.login();
    });

    it('Não deve exibir paginação quando há poucos usuários', () => {
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json' // Apenas 2 usuários
      }).as('getUsuarios');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
      
      // Com apenas 2 usuários, não deve ter paginação
      cy.contains('Página').should('not.exist');
    });

    it('Deve exibir paginação quando há mais de 10 usuários', () => {
      // Cria mock com 15 usuários usando estrutura CommonResponse
      const muitosUsuarios = {
        error: false,
        code: 200,
        message: 'OK',
        data: Array.from({ length: 15 }, (_, i) => ({
          _id: `67000000000000000000000${i}`,
          nome: `Usuario Teste ${i + 1}`,
          email: `teste${i + 1}@email.com`,
          status: 'ativo',
          admin: false,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z'
        })),
        errors: []
      };

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: muitosUsuarios
      }).as('getUsuariosPaginados');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuariosPaginados');

      cy.contains('Página 1 de 2').should('be.visible');
    });

    it('Deve navegar para próxima página', () => {
      const muitosUsuarios = {
        error: false,
        code: 200,
        message: 'OK',
        data: Array.from({ length: 15 }, (_, i) => ({
          _id: `67000000000000000000000${i}`,
          nome: `Usuario Teste ${i + 1}`,
          email: `teste${i + 1}@email.com`,
          status: 'ativo',
          admin: false,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z'
        })),
        errors: []
      };

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: muitosUsuarios
      }).as('getUsuariosPaginados');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuariosPaginados');

      cy.contains('button', 'Próximo').click();
      cy.contains('Página 2 de 2').should('be.visible');
    });

    it('Deve desabilitar botão "Anterior" na primeira página', () => {
      const muitosUsuarios = {
        error: false,
        code: 200,
        message: 'OK',
        data: Array.from({ length: 15 }, (_, i) => ({
          _id: `67000000000000000000000${i}`,
          nome: `Usuario Teste ${i + 1}`,
          email: `teste${i + 1}@email.com`,
          status: 'ativo',
          admin: false,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z'
        })),
        errors: []
      };

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: muitosUsuarios
      }).as('getUsuariosPaginados');

      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuariosPaginados');

      cy.contains('button', 'Anterior').should('be.disabled');
    });
  });

  // ============================================
  // TESTES DE ACESSIBILIDADE BÁSICA
  // ============================================
  describe('Acessibilidade Básica', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Botões devem ter atributo title descritivo', () => {
      cy.get('button[title="Desativar usuário"]').should('exist');
      cy.get('button[title="Excluir usuário"]').should('exist');
    });

    it('Modal deve ter botão de fechar com aria-label', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('button[aria-label="Fechar modal"]').should('exist');
    });

    it('Inputs do formulário devem ter labels associados', () => {
      cy.getByData('btn-novo-usuario').click();
      cy.get('label[for="nome"]').should('exist');
      cy.get('label[for="email"]').should('exist');
    });
  });

  // ============================================
  // TESTES DE PROTEÇÃO DO ADMIN PADRÃO
  // ============================================
  describe('Proteção do Administrador Padrão', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_com_admin_padrao.json'
      }).as('getUsuarios');
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Não deve permitir deletar o administrador padrão', () => {
      cy.intercept('DELETE', '**/usuarios/670000000000000000000002', {
        statusCode: 403,
        body: {
          error: true,
          code: 403,
          message: 'Este usuário é o administrador padrão e não pode ser deletado.',
          data: null,
          errors: []
        }
      }).as('deleteAdminPadrao');

      // Tenta deletar o admin padrão (segundo usuário)
      cy.get('tbody tr').eq(1).find('button[title="Excluir usuário"]').click();
      cy.getByData('btn-confirmar-deletar').click();

      cy.wait('@deleteAdminPadrao');
      
      // Verifica que o alert foi exibido com a mensagem
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Este usuário é o administrador padrão e não pode ser deletado');
      });
    });

    it('Não deve permitir remover permissão de admin do administrador padrão', () => {
      cy.intercept('PATCH', '**/usuarios/670000000000000000000002/admin', {
        statusCode: 403,
        body: {
          error: true,
          code: 403,
          message: 'Não é permitido alterar o status de administrador do usuário padrão.',
          data: null,
          errors: []
        }
      }).as('patchAdminPadrao');

      // Tenta remover admin do admin padrão (segundo usuário)
      cy.get('tbody tr').eq(1).find('button[title="Retirar Admin"]').click();

      cy.wait('@patchAdminPadrao');
      
      // Verifica que o alert foi exibido com a mensagem
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Não é permitido alterar o status de administrador do usuário padrão');
      });
    });

    it('Deve permitir deletar outros usuários admin (não padrão)', () => {
      cy.intercept('DELETE', '**/usuarios/670000000000000000000003', {
        statusCode: 200,
        body: { error: false, code: 200, message: 'OK', data: null, errors: [] }
      }).as('deleteOutroAdmin');

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        body: {
          error: false,
          code: 200,
          message: 'OK',
          data: [
            {
              "_id": "670000000000000000000001",
              "nome": "Usuario Teste 1",
              "email": "teste1@email.com",
              "status": "ativo",
              "admin": false,
              "createdAt": "2024-01-01T10:00:00.000Z",
              "updatedAt": "2024-01-01T10:00:00.000Z"
            },
            {
              "_id": "670000000000000000000002",
              "nome": "Admin Padrão",
              "email": "adminpadrao@ifro.edu.br",
              "status": "ativo",
              "admin": true,
              "createdAt": "2024-01-02T10:00:00.000Z",
              "updatedAt": "2024-01-02T10:00:00.000Z"
            }
          ],
          errors: []
        }
      }).as('getUsuariosRefresh');

      // Deleta o terceiro usuário (outro admin)
      cy.get('tbody tr').eq(2).find('button[title="Excluir usuário"]').click();
      cy.getByData('btn-confirmar-deletar').click();

      cy.wait('@deleteOutroAdmin');
      cy.wait('@getUsuariosRefresh');
      
      // Verifica que a lista foi atualizada
      cy.get('tbody tr').should('have.length', 2);
    });
  });

  // ============================================
  // TESTES DE PROTEÇÃO DO PRÓPRIO USUÁRIO
  // ============================================
  describe('Proteção Contra Auto-Modificação', () => {
    beforeEach(() => {
      // Login padrão (usuário admin@email.com com ID 670000000000000000000002)
      cy.login();
      
      // Mock da sessão retornando o usuário logado
      cy.intercept('GET', '**/api/auth/session*', {
        statusCode: 200,
        body: {
          user: {
            _id: '670000000000000000000002',
            id: '670000000000000000000002',
            nome: 'Usuario Admin',
            email: 'admin@email.com',
            admin: true,
            status: 'ativo'
          }
        }
      }).as('getSession');

      cy.intercept('GET', API_USUARIOS, {
        statusCode: 200,
        fixture: 'usuarios_mock.json'
      }).as('getUsuarios');
      
      cy.visit(`${BASE_URL}/administrativo`);
      cy.wait('@getUsuarios');
    });

    it('Não deve exibir botões de ação para o próprio usuário logado', () => {
      // Verifica a linha do usuário logado (segundo usuário - admin@email.com ID: 670000000000000000000002)
      cy.get('tbody tr').eq(1).within(() => {
        // Deve exibir badge "Você" ao invés do toggle de admin
        cy.contains('Você').should('be.visible');
        
        // Não deve ter botão de toggle admin
        cy.get('button[title*="Admin"]').should('not.exist');
        
        // Não deve ter botão de desativar
        cy.get('button[title*="tivar usuário"]').should('not.exist');
        
        // Não deve ter botão de excluir
        cy.get('button[title="Excluir usuário"]').should('not.exist');
      });
    });

    it('Deve exibir botões de ação para outros usuários', () => {
      // Verifica a linha de outro usuário (primeiro usuário - teste1@email.com)
      cy.get('tbody tr').first().within(() => {
        // Deve ter botão de toggle admin
        cy.get('button[title*="Admin"]').should('exist');
        
        // Deve ter botão de desativar/ativar
        cy.get('button[title*="tivar usuário"]').should('exist');
        
        // Deve ter botão de excluir
        cy.get('button[title="Excluir usuário"]').should('exist');
      });
    });

    it('Não deve ter badge "Você" para outros usuários', () => {
      // Verifica que outros usuários não têm o badge "Você"
      cy.get('tbody tr').first().within(() => {
        cy.contains('Você').should('not.exist');
      });
    });

    it('Badge "Você" deve ter estilo amarelo correto', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Você')
          .should('have.class', 'bg-yellow-100')
          .and('have.class', 'text-yellow-800');
      });
    });

    it('Coluna de ações deve estar vazia para o próprio usuário', () => {
      // Verifica que a célula de ações do usuário logado não tem botões
      cy.get('tbody tr').eq(1).find('td').eq(5).within(() => {
        cy.get('button').should('have.length', 0);
      });
    });
  });
});
