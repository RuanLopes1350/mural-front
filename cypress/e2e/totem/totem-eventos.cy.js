/// <reference types="cypress" />

const BASE_URL = 'https://ruan-silva-3000.code.fslab.dev';
const API_TOTEM_EVENTOS = '**/totem/eventos';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'SenhaSuperSegur@123';

describe('Totem de Eventos', () => {
  const visitTotem = () => {
    cy.visit(`${BASE_URL}/totem`, { failOnStatusCode: false });
  };

  context('Estados iniciais', () => {
    it('mostra o estado de carregamento enquanto busca os eventos', () => {
      cy.intercept('GET', API_TOTEM_EVENTOS, {
        fixture: 'totem_eventos.json',
        delay: 1200,
      }).as('getEventosTotemDelay');

      visitTotem();

      cy.contains('Carregando eventos...').should('be.visible');
      cy.wait('@getEventosTotemDelay');
    });

    it('exibe a mensagem de erro quando a API falha', () => {
      cy.intercept('GET', API_TOTEM_EVENTOS, {
        statusCode: 500,
        body: {
          error: true,
          code: 500,
          message: 'Erro interno do servidor',
          data: [],
          errors: [],
        },
      }).as('getEventosTotemErro');

      visitTotem();
      cy.wait('@getEventosTotemErro');

      cy.contains('Erro ao carregar eventos', { timeout: 10000 }).should('be.visible');
    });

    it('informa quando nao existem eventos disponiveis', () => {
      cy.intercept('GET', API_TOTEM_EVENTOS, {
        statusCode: 200,
        body: { error: false, code: 200, message: 'OK', data: [], errors: [] },
      }).as('getEventosTotemVazio');

      visitTotem();
      cy.wait('@getEventosTotemVazio');

      cy.contains('Nenhum evento disponível').should('be.visible');
    });
  });

  context('Visualizacao de eventos', () => {
    const carregarTotem = () => {
      visitTotem();
      cy.wait('@getEventosTotem');
    };

    beforeEach(() => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);

      cy.intercept('GET', API_TOTEM_EVENTOS, {
        fixture: 'totem_eventos.json',
      }).as('getEventosTotem');
    });

    it('exibe os dados principais do evento retornado pela API', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
      }).as('getQrCode');

      carregarTotem();
      cy.wait('@getQrCode');

      cy.origin(BASE_URL, () => {
        cy.get('[data-test="evento-titulo"]').should('contain', 'Mostra de Robotica');
        cy.get('[data-test="evento-local"]').should('contain', 'Hall Principal');
        cy.get('[data-test="evento-data"]').should('contain', 'DEZ');
        cy.get('[data-test="evento-horario"]').should('contain', '-');
      });
    });

    it('mostra categoria em caixa alta e tags em minusculo', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
      }).as('getQrCodeTags');

      carregarTotem();
      cy.wait('@getQrCodeTags');

      cy.get('[data-test="evento-categoria"]').should('have.text', 'TECNOLOGIA');
      cy.get('[data-test="evento-tags"]').within(() => {
        cy.get('[data-test="evento-tag"]').first().should('have.text', 'robotica');
      });
    });

    it('usa a quantidade correta de indicadores e atualiza a barra de loops', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
      }).as('getQrCodeIndicadores');

      carregarTotem();
      cy.wait('@getQrCodeIndicadores');

      cy.get('[data-test="indicadores-imagens"]').children().should('have.length', 2);
      cy.get('[data-test="loop-progress-bar"]').should('have.attr', 'style').and('include', '50%');
    });

    it('aplica a cor e a animacao configuradas no evento', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
      }).as('getQrCodeVisual');

      carregarTotem();
      cy.wait('@getQrCodeVisual');

      cy.get('[data-test="barra-lateral"]').should('have.class', 'bg-blue-900/90');
      cy.get('[data-test="fundo-animado"]').should('have.class', 'animate__fadeInUp');
    });

    it('renderiza o QR code quando o evento possui link', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
      }).as('getQrCodeImagem');

      carregarTotem();
      cy.wait('@getQrCodeImagem');

      cy.get('[data-test="qr-image"]').should('be.visible');
      cy.get('[data-test="qr-image"]').should('have.attr', 'src').and('include', 'UElDS1NF');
    });

    it('mostra o loader enquanto o QR code nao terminou de carregar', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        fixture: 'totem_qrcode.json',
        delay: 1200,
      }).as('getQrCodeDelay');

      carregarTotem();
      cy.get('[data-test="qr-loader"]').should('be.visible');
      cy.wait('@getQrCodeDelay');
    });

    it('mostra mensagem quando o QR code nao esta disponivel', () => {
      cy.intercept('GET', '**/eventos/evt-001/qrcode', {
        statusCode: 500,
        body: {},
      }).as('getQrCodeErro');

      carregarTotem();
      cy.wait('@getQrCodeErro');

      cy.get('[data-test="qr-fallback"]').should('contain', 'QR Code não disponível');
    });
  });

  context('Evento sem link', () => {
    it('nao renderiza o quadro de QR code', () => {
      cy.login(ADMIN_EMAIL, ADMIN_PASSWORD);
      cy.intercept('GET', API_TOTEM_EVENTOS, {
        fixture: 'totem_evento_sem_link.json',
      }).as('getEventosSemLink');

      visitTotem();
      cy.wait('@getEventosSemLink');

      cy.get('[data-test="qr-container"]').should('not.exist');
    });
  });
});
