/// <reference types="cypress" />
import { faker } from '@faker-js/faker/locale/pt_BR';

Cypress.on("uncaught:exception", () => false);

describe("Criar Evento", () => {
  let eventoData;
  let tituloEventoCriado = null;

  beforeEach(() => {
    const today = new Date();
    const todayFormatted = today.toISOString().slice(0, 16);
    
    eventoData = {
      titulo: faker.music.songName() + ' ' + faker.date.future().getFullYear(),
      descricao: "Evento Gerado pelo Cypress para testes E2E. " + todayFormatted,
      local: faker.location.streetAddress(),
      dataInicio: todayFormatted,
      dataFim: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16),
      link: faker.internet.url(),
      tags: [faker.word.noun(), faker.word.adjective(), faker.word.verb()],
      exibInicio: today.toISOString().split('T')[0],
      exibFim: faker.date.future().toISOString().split('T')[0],
    };

    cy.intercept('POST', '**/eventos').as('createEvento');
    cy.intercept('GET', '**/api/auth/session*').as('getSession');

    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/criar_eventos`);
    
    cy.url().should('include', '/criar_eventos');
    cy.contains('Criar Novo Evento').should('be.visible');
    cy.get('form').should('be.visible');
    cy.getByData('input-titulo').should('be.visible');
  });

  // ETAPA 1 - Informações Básicas
  describe("Etapa 1 - Informações Básicas", () => {
    it("deve renderizar todos os campos da etapa 1", () => {
      cy.contains("Informações Básicas").should("be.visible");
      cy.getByData('input-titulo').should("be.visible");
      cy.getByData('input-descricao').should("be.visible");
      cy.getByData('input-local').should("be.visible");
      cy.getByData('select-categoria').should("be.visible");
      cy.getByData('input-data-inicio').should("be.visible");
      cy.getByData('input-data-fim').should("be.visible");
      cy.getByData('input-link').should("be.visible");

      cy.scrollTo('bottom');
      cy.contains('button', 'Cancelar').should("be.visible");
      cy.contains('button', 'Continuar').should("be.visible");
    });

    it("deve validar campos obrigatórios e exibir toast", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.get('.Toastify__toast--error').should('contain', 'Complete todos os campos obrigatórios da Etapa 1');
    });

    it("deve validar tamanho mínimo dos campos", () => {
      cy.getByData('input-titulo').type("ab");
      cy.getByData('input-descricao').type("desc");
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();

      cy.get('.Toastify__toast--error').should('be.visible');
      cy.contains("O título deve ter ao menos 3 caracteres").should("exist");
      cy.contains("A descrição deve ter ao menos 10 caracteres").should("exist");
    });

    it("deve preencher campos e avançar para etapa 2", () => {
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
      cy.contains("Imagens do Evento").should("exist");
    });

    it("deve validar datas (data fim não pode ser antes da data início)", () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 5);
      const dataPassadaStr = dataPassada.toISOString().slice(0, 16);

      cy.getByData('input-titulo').type(eventoData.titulo);
      cy.getByData('input-descricao').type(eventoData.descricao);
      cy.getByData('input-local').type(eventoData.local);
      
      cy.getByData('select-categoria').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').last().click();
      
      cy.getByData('input-data-inicio').type(eventoData.dataInicio);
      cy.getByData('input-data-fim').type(dataPassadaStr);
      cy.getByData('input-tag').type(`${eventoData.tags[0]}{enter}`);

      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.contains("A data de fim não pode ser anterior à data de início").should("exist");
    });
  });

  // ETAPA 2 - Upload de Imagens
  describe("Etapa 2 - Upload de Imagens", () => {
    beforeEach(() => {
      // Preencher etapa 1 e avançar
      cy.getByData('input-titulo').type(eventoData.titulo);
      cy.getByData('input-descricao').type(eventoData.descricao);
      cy.getByData('input-local').type(eventoData.local);
      
      cy.getByData('select-categoria').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').last().click();
      
      cy.getByData('input-data-inicio').type(eventoData.dataInicio);
      cy.getByData('input-data-fim').type(eventoData.dataFim);
      
      eventoData.tags.forEach((tag) => {
        cy.getByData('input-tag').type(`${tag}{enter}`);
      });
      
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.getByData('drop-zone').should('be.visible');
    });

    it("deve renderizar área de upload", () => {
      cy.contains("Imagens do Evento").should("be.visible");
      cy.getByData('drop-zone').should("be.visible");
      cy.getByData('file-input').should("exist");
      cy.contains("Arraste e solte suas imagens").should("be.visible");

      cy.scrollTo('bottom');
      cy.contains('button', 'Voltar').should("exist");
      cy.contains('button', 'Continuar').should("exist");
    });

    it("deve validar que pelo menos 1 imagem é necessária", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.get('.Toastify__toast--error').should('be.visible');
      cy.contains("Adicione pelo menos 1 imagem antes de continuar").should("be.visible");
    });

    it("deve fazer upload de imagem válida", () => {
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]').should('exist');
      cy.contains('Novas Imagens').should('be.visible');
    });

    it("deve permitir remover imagens adicionadas", () => {
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]').should('exist');
      cy.get('button[title="Remover imagem"]').first().click({ force: true });
      cy.get('img[alt="image-teste.png"]').should('not.exist');
    });

    it("deve voltar para etapa 1 ao clicar em voltar", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Voltar').click();
      cy.contains("Informações Básicas").should("exist");
      cy.getByData('input-titulo').should("have.value", eventoData.titulo);
    });

    it("deve avançar para etapa 3 com imagens", () => {
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.contains("Configurações", { timeout: 5000 }).should("exist");
    });
  });

  // ETAPA 3 - Configurações de Exibição
  describe("Etapa 3 - Configurações de Exibição", () => {
    beforeEach(() => {
      // Preencher etapa 1
      cy.getByData('input-titulo').type(eventoData.titulo);
      cy.getByData('input-descricao').type(eventoData.descricao);
      cy.getByData('input-local').type(eventoData.local);
      cy.getByData('select-categoria').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').last().click();
      cy.getByData('input-data-inicio').type(eventoData.dataInicio);
      cy.getByData('input-data-fim').type(eventoData.dataFim);
      eventoData.tags.forEach((tag) => {
        cy.getByData('input-tag').type(`${tag}{enter}`);
      });
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();

      // Preencher etapa 2
      cy.getByData('drop-zone').should('be.visible');
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();
      cy.contains("Configurações de Exibição", { timeout: 5000 }).should("exist");
    });

    it("deve renderizar campos de configuração", () => {
      cy.contains("Configurações de Exibição no Totem").should("exist");
      
      cy.contains("Segunda-feira").should("exist");
      cy.contains("Terça-feira").should("exist");
      cy.contains("Quarta-feira").should("exist");
      cy.contains("Quinta-feira").should("exist");
      cy.contains("Sexta-feira").should("exist");
      
      cy.contains("Manhã").should("exist");
      cy.contains("Tarde").should("exist");
      cy.contains("Noite").should("exist");
      
      cy.getByData('input-exib-inicio').should("exist");
      cy.getByData('input-exib-fim').should("exist");
      
      cy.getByData('select-cor').should("exist");
      cy.getByData('select-animacao').should("exist");
      
      cy.scrollTo('bottom');
      cy.contains('button', 'Voltar', { timeout: 5000 }).should("exist");
      cy.contains('button', 'Preview', { timeout: 5000 }).should("exist");
      cy.contains('button', 'Finalizar', { timeout: 5000 }).should("exist");
    });

    it("deve selecionar todos os dias da semana", () => {
      cy.getByData('checkbox-todos-dias').check({ force: true });
      cy.getByData('checkbox-todos-dias').should('be.checked');
    });

    it("deve selecionar todos os períodos do dia", () => {
      cy.getByData('checkbox-manha').check({ force: true });
      cy.getByData('checkbox-tarde').check({ force: true });
      cy.getByData('checkbox-noite').check({ force: true });
      
      cy.getByData('checkbox-manha').should('be.checked');
      cy.getByData('checkbox-tarde').should('be.checked');
      cy.getByData('checkbox-noite').should('be.checked');
    });

    it("deve selecionar cor do card", () => {
      cy.getByData('select-cor').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').first().click();
    });

    it("deve selecionar animação", () => {
      cy.getByData('select-animacao').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').first().click();
    });

    it("deve voltar para etapa 2 ao clicar em voltar", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Voltar').click();
      cy.contains("Imagens do Evento").should("exist");
    });
  });

  // FLUXO COMPLETO - Criação de evento
  describe("Fluxo Completo", () => {
    it("deve criar evento completo com sucesso", () => {
      // Gerar título único para poder excluir depois
      const tituloUnico = 'CypressCriar ' + Date.now();
      Cypress.env('tituloEventoCriado', tituloUnico);
      
      // ETAPA 1 - Informações Básicas
      cy.getByData('input-titulo').type(tituloUnico);
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

      // ETAPA 2 - Upload de Imagens
      cy.getByData('drop-zone').should('be.visible');
      cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
      cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
      cy.scrollTo('bottom');
      cy.contains('button', 'Continuar').click();

      // ETAPA 3 - Configurações de Exibição
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
      cy.getByData('select-animacao').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.get('[role="option"]').first().click();
      cy.scrollTo('bottom');
      cy.contains('button', 'Finalizar').click();

      // Verificar criação do evento
      cy.wait('@createEvento').then((interception) => {
        expect(interception.request.method).to.equal('POST');
        expect([200, 201]).to.include(interception.response.statusCode);
      });

      cy.get('.Toastify__toast--success').should('be.visible');
      cy.contains("Evento e imagens criados com sucesso!").should("be.visible");
      cy.url().should("include", "/meus_eventos");
    });
  });

  // MODAL DE CANCELAMENTO
  describe("Modal de Cancelamento", () => {
    it("deve abrir modal ao clicar em cancelar", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Cancelar').click();
      cy.contains("Cancelar criação do evento?").should("exist");
      cy.contains("Os dados preenchidos serão perdidos").should("exist");
    });

    it("deve fechar modal ao clicar em voltar", () => {
      cy.scrollTo('bottom');
      cy.contains('button', 'Cancelar').click();
      cy.contains("Cancelar criação do evento?").should("exist");
      cy.getByData('modal-btn-voltar').click();
      cy.contains("Cancelar criação do evento?").should("not.exist");
    });

    it("deve redirecionar ao confirmar cancelamento", () => {
      cy.getByData('input-titulo').type(eventoData.titulo);
      cy.scrollTo('bottom');
      cy.contains('button', 'Cancelar').click();
      cy.getByData('modal-btn-confirmar-cancelar').click();
      cy.url().should("include", "/meus_eventos");
    });
  });

  // Limpeza: excluir o evento criado no teste de fluxo completo
  after(() => {
    const tituloEvento = Cypress.env('tituloEventoCriado');
    
    // Só executa se um evento foi criado no fluxo completo
    if (!tituloEvento) return;
    
    cy.intercept('DELETE', '**/eventos/*').as('deleteEvento');
    
    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/meus_eventos`);
    cy.url().should('include', '/meus_eventos');
    cy.getByData('card-container').should('be.visible');

    cy.getByData('search-input').clear().type(tituloEvento.substring(0, 15));
    cy.wait(1000);
    
    // Verificar se encontrou o evento e excluí-lo
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="event-card"]').length > 0) {
        cy.getByData('event-card').first().within(() => {
          cy.getByData('event-delete-button').click();
        });
        
        // Confirmar exclusão no modal
        cy.getByData('btn-confirm-delete').click();
        
        cy.wait('@deleteEvento').then((interception) => {
          expect([200, 204]).to.include(interception.response.statusCode);
        });
        
        cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible');
      }
    });
  });
});
