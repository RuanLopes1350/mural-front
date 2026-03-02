/// <reference types="cypress" />
import { faker } from '@faker-js/faker/locale/pt_BR';

Cypress.on("uncaught:exception", () => false);

describe("Editar Evento", () => {
  let tituloOriginal;
  let eventoData;
  let eventoEditado;

  before(() => {
    const today = new Date();
    const todayFormatted = today.toISOString().slice(0, 16);
    
    tituloOriginal = 'CypressEdit ' + faker.music.songName().substring(0, 15) + ' ' + Date.now();
    
    eventoData = {
      titulo: tituloOriginal,
      descricao: "Evento para testes de EDIÇÃO - " + todayFormatted,
      local: faker.location.streetAddress(),
      dataInicio: todayFormatted,
      dataFim: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16),
      link: faker.internet.url(),
      tags: [faker.word.noun(), faker.word.adjective()],
      exibInicio: today.toISOString().split('T')[0],
      exibFim: faker.date.future().toISOString().split('T')[0],
    };

    eventoEditado = {
      titulo: "EDITADO " + Date.now(),
      descricao: "Descrição EDITADA - " + todayFormatted,
      local: "Local EDITADO - " + faker.location.city(),
    };

    Cypress.env('tituloOriginal', tituloOriginal);
    Cypress.env('eventoEditado', eventoEditado);

    cy.intercept('POST', '**/eventos').as('createEvento');

    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/criar_eventos`);
    cy.url().should('include', '/criar_eventos');
    cy.contains('Criar Novo Evento').should('be.visible');
    cy.getByData('input-titulo').should('be.visible');

    cy.getByData('input-titulo').type(eventoData.titulo);
    cy.getByData('input-descricao').type(eventoData.descricao);
    cy.getByData('input-local').type(eventoData.local);
    cy.getByData('select-categoria').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').last().click();
    cy.getByData('input-data-inicio').type(eventoData.dataInicio);
    cy.getByData('input-data-fim').type(eventoData.dataFim);
    cy.getByData('input-link').type(eventoData.link);
    eventoData.tags.forEach((tag) => {
      cy.getByData('input-tag').type(`${tag}{enter}`);
    });
    cy.scrollTo('bottom');
    cy.contains('button', 'Continuar').click();

    cy.getByData('drop-zone').should('be.visible');
    cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
    cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
    cy.scrollTo('bottom');
    cy.contains('button', 'Continuar').click();

    cy.contains("Configurações de Exibição", { timeout: 5000 }).should("exist");
    cy.getByData('checkbox-todos-dias').check({ force: true });
    cy.getByData('checkbox-manha').check({ force: true });
    cy.getByData('checkbox-tarde').check({ force: true });
    cy.getByData('checkbox-noite').check({ force: true });
    cy.getByData('input-exib-inicio').type(eventoData.exibInicio);
    cy.getByData('input-exib-fim').type(eventoData.exibFim);
    cy.getByData('select-cor').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.get('[role="listbox"]').should('not.exist');
    cy.getByData('select-animacao').click();
    cy.get('[role="listbox"]', { timeout: 5000 }).should('be.visible');
    cy.get('[role="option"]').first().click();
    cy.scrollTo('bottom');
    cy.contains('button', 'Finalizar').click();

    cy.wait('@createEvento').then((interception) => {
      expect([200, 201]).to.include(interception.response.statusCode);
    });

    cy.get('.Toastify__toast', { timeout: 10000 }).should('be.visible');
    cy.url().should("include", "/meus_eventos");
  });

  beforeEach(() => {
    cy.intercept('PATCH', '**/eventos/*').as('updateEvento');
    cy.intercept('GET', '**/eventos/*').as('getEvento');

    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/meus_eventos`);
    cy.url().should('include', '/meus_eventos');
    cy.getByData('card-container').should('be.visible');
  });

  const navegarParaEdicao = (busca) => {
    cy.getByData('search-input').clear().type(busca);
    cy.wait(1000);
    cy.getByData('event-card').first().within(() => {
      cy.getByData('event-edit-button').click();
    });
    cy.url().should('include', '/editar_eventos/');
    cy.contains('Editar Evento', { timeout: 10000 }).should('be.visible');
  };

  const salvarAlteracoes = () => {
    cy.scrollTo('bottom');
    cy.getByData('btn-salvar').click();
    cy.wait('@updateEvento');
    cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible');
    cy.get('.Toastify__toast--success').should('contain.text', 'atualizado com sucesso');
    cy.url().should("include", "/meus_eventos");
  };

  const salvarAlteracoesComImagem = () => {
    cy.scrollTo('bottom');
    cy.getByData('btn-salvar').click();
    cy.wait('@updateEvento');
    cy.get('.Toastify__toast--success', { timeout: 15000 }).should('be.visible');
    cy.get('.Toastify__toast--success').should('contain.text', 'atualizados com sucesso');
    cy.url().should("include", "/meus_eventos");
  };

  const avancarParaEtapa3 = () => {
    cy.scrollTo('bottom');
    cy.getByData('btn-continuar').should('be.visible').click();
    cy.wait(500);
    // Verifica se a Etapa 2 carregou - procura pelo título ou pelo drop-zone
    cy.contains("Imagens do Evento", { timeout: 10000 }).should("be.visible");
    
    cy.scrollTo('bottom');
    cy.getByData('btn-continuar').should('be.visible').click();
    cy.wait(500);
    cy.contains("Configurações de Exibição", { timeout: 10000 }).should("exist");
  };

  describe("Acesso à Edição via Meus Eventos", () => {
    it("deve navegar para edição ao clicar no botão editar do card", () => {
      const titulo = Cypress.env('tituloOriginal');
      navegarParaEdicao(titulo.substring(0, 15));
    });
  });

  describe("Etapa 1 - Edição de Informações Básicas", () => {
    it("deve carregar dados existentes nos campos", () => {
      const titulo = Cypress.env('tituloOriginal');
      navegarParaEdicao(titulo.substring(0, 15));
      
      cy.getByData('input-titulo').should('not.have.value', '');
      cy.getByData('input-descricao').should('not.have.value', '');
      cy.getByData('input-local').should('not.have.value', '');
    });

    it("deve editar o título e salvar com sucesso", () => {
      const titulo = Cypress.env('tituloOriginal');
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(titulo.substring(0, 15));
      
      cy.getByData('input-titulo').clear().type(editado.titulo);
      avancarParaEtapa3();
      salvarAlteracoes();
    });

    it("deve editar a descrição e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.getByData('input-descricao').clear().type(editado.descricao);
      avancarParaEtapa3();
      salvarAlteracoes();
    });

    it("deve editar o local e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.getByData('input-local').clear().type(editado.local);
      avancarParaEtapa3();
      salvarAlteracoes();
    });

    it("deve alterar a categoria e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.getByData('select-categoria').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').first().click();
      avancarParaEtapa3();
      salvarAlteracoes();
    });
  });

  describe("Etapa 2 - Edição de Imagens", () => {
    it("deve exibir área de upload", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.scrollTo('bottom');
      cy.getByData('btn-continuar').should('be.visible').click();
      cy.contains("Imagens do Evento", { timeout: 10000 }).should("be.visible");
      cy.getByData('drop-zone').should('be.visible');
    });

    it("deve adicionar nova imagem e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.scrollTo('bottom');
      cy.getByData('btn-continuar').should('be.visible').click();
      cy.contains("Imagens do Evento", { timeout: 10000 }).should("be.visible");
      
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
      
      cy.scrollTo('bottom');
      cy.getByData('btn-continuar').should('be.visible').click();
      cy.contains("Configurações de Exibição", { timeout: 10000 }).should("exist");
      salvarAlteracoesComImagem();
    });
  });

  describe("Etapa 3 - Edição de Configurações", () => {
    it("deve exibir configurações de exibição", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      avancarParaEtapa3();
      
      cy.contains("Configurações de Exibição no Totem").should("exist");
      cy.contains("Segunda-feira").should("exist");
      cy.contains("Manhã").should("exist");
    });

    it("deve alterar dias de exibição e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      avancarParaEtapa3();
      
      cy.getByData('checkbox-todos-dias').uncheck({ force: true });
      cy.getByData('checkbox-todos-dias').check({ force: true });
      salvarAlteracoes();
    });

    it("deve alterar turnos de exibição e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      avancarParaEtapa3();
      
      cy.getByData('checkbox-manha').check({ force: true });
      cy.getByData('checkbox-tarde').check({ force: true });
      salvarAlteracoes();
    });

    it("deve alterar cor do card e salvar com sucesso", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      avancarParaEtapa3();
      
      cy.getByData('select-cor').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').eq(1).click({ force: true });
      cy.get('[role="listbox"]').should('not.exist');
      salvarAlteracoes();
    });
  });

  describe("Compartilhar Permissões", () => {

    it("deve validar email inválido", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.scrollTo('bottom');
      cy.get('#compartilhar-email').type('email-invalido{enter}');
      cy.contains('e-mail válido', { timeout: 5000 }).should('be.visible');
    });

    it("deve impedir compartilhar consigo mesmo", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.scrollTo('bottom');
      cy.get('#compartilhar-email').type('admin@admin.com{enter}');
      cy.contains('não pode compartilhar o evento consigo mesmo', { timeout: 5000 }).should('be.visible');
    });
  });

  describe("Comportamento do Botão Cancelar", () => {
    it("deve redirecionar para meus_eventos ao clicar em cancelar", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.scrollTo('bottom');
      cy.getByData('btn-cancelar').click();
      cy.url().should("include", "/meus_eventos");
    });

    it("deve descartar alterações ao cancelar", () => {
      const editado = Cypress.env('eventoEditado');
      navegarParaEdicao(editado.titulo.substring(0, 10));
      
      cy.getByData('input-titulo').clear().type("Alteração que será descartada");
      cy.scrollTo('bottom');
      cy.getByData('btn-cancelar').click();
      cy.url().should("include", "/meus_eventos");
      
      cy.getByData('search-input').clear().type(editado.titulo.substring(0, 10));
      cy.wait(1000);
      cy.getByData('event-card').first().within(() => {
        cy.getByData('event-edit-button').click();
      });
      cy.getByData('input-titulo').should('have.value', editado.titulo);
    });
  });

  after(() => {
    cy.intercept('DELETE', '**/eventos/*').as('deleteEvento');
    
    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/meus_eventos`);
    cy.url().should('include', '/meus_eventos');
    cy.getByData('card-container').should('be.visible');

    const editado = Cypress.env('eventoEditado');
    cy.getByData('search-input').clear().type(editado.titulo.substring(0, 10));
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="event-card"]').length > 0) {
        cy.getByData('event-card').first().within(() => {
          cy.getByData('event-delete-button').click();
        });
        
        cy.getByData('btn-confirm-delete').click();
        
        cy.wait('@deleteEvento').then((interception) => {
          expect([200, 204]).to.include(interception.response.statusCode);
        });
        
        cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible');
      }
    });
  });
});
