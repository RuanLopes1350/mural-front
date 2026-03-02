/// <reference types="cypress" />
import { faker } from '@faker-js/faker/locale/pt_BR';

Cypress.on("uncaught:exception", () => false);

describe("Página Meus Eventos", () => {
  // Variáveis compartilhadas entre todos os testes
  let eventoData;
  let tituloEventoTeste;

  // Criar evento antes de todos os testes para usar nos testes de exclusão
  before(() => {
    const today = new Date();
    const todayFormatted = today.toISOString().slice(0, 16);
    
    tituloEventoTeste = 'CypressMeusEventos ' + Date.now();
    
    eventoData = {
      titulo: tituloEventoTeste,
      descricao: "Evento para testes de MEUS EVENTOS - " + todayFormatted,
      local: faker.location.streetAddress(),
      dataInicio: todayFormatted,
      dataFim: new Date(today.getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16),
      link: faker.internet.url(),
      tags: [faker.word.noun(), faker.word.adjective()],
      exibInicio: today.toISOString().split('T')[0],
      exibFim: faker.date.future().toISOString().split('T')[0],
    };

    // Salvar no Cypress.env para uso em outros hooks
    Cypress.env('tituloEventoTeste', tituloEventoTeste);

    cy.intercept('POST', '**/eventos').as('createEvento');

    // Login e criar evento
    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/criar_eventos`);
    cy.url().should('include', '/criar_eventos');
    cy.contains('Criar Novo Evento').should('be.visible');
    cy.getByData('input-titulo').should('be.visible');

    // Etapa 1
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

    // Etapa 2
    cy.getByData('drop-zone').should('be.visible');
    cy.getByData('file-input').selectFile('public/image-teste.png', { force: true });
    cy.get('img[alt="image-teste.png"]', { timeout: 10000 }).should('exist');
    cy.scrollTo('bottom');
    cy.contains('button', 'Continuar').click();

    // Etapa 3
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

    // Verificar criação
    cy.wait('@createEvento').then((interception) => {
      expect([200, 201]).to.include(interception.response.statusCode);
    });

    cy.get('.Toastify__toast', { timeout: 10000 }).should('be.visible');
    cy.url().should("include", "/meus_eventos");
  });

  beforeEach(() => {
    cy.intercept('GET', '**/api/auth/session*').as('getSession');
    cy.intercept('GET', '**/eventos/admin/**').as('getEventos');
    cy.intercept('DELETE', '**/eventos/*').as('deleteEvento');
    cy.intercept('PATCH', '**/eventos/*').as('toggleStatus');

    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/meus_eventos`);
  });

  describe("Integração com API", () => {
    it("deve carregar eventos da API com sucesso", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);
        
        const responseBody = interception.response.body;
        expect(responseBody).to.have.property('data');
        
        if (responseBody.data && responseBody.data.docs) {
          expect(responseBody.data).to.have.property('docs').that.is.an('array');
          expect(responseBody.data).to.have.property('totalPages');
          expect(responseBody.data).to.have.property('totalDocs');
          
          if (responseBody.data.docs.length > 0) {
            const primeiroEvento = responseBody.data.docs[0];
            expect(primeiroEvento).to.have.property('_id');
            expect(primeiroEvento).to.have.property('titulo');
            expect(primeiroEvento).to.have.property('status');
          }
        }
      });
    });

    it("deve validar parâmetros de paginação na requisição", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('page')).to.exist;
        expect(url.searchParams.get('limite')).to.exist;
      });
    });
  });

  describe("Renderização da página", () => {
    it("deve carregar todos os elementos principais", () => {
      cy.getByData('meus-eventos-page').should("exist");
      cy.getByData('hero-banner').should("exist");
      cy.getByData('hero-title').should("contain", "Facilidade para os professores");
      cy.getByData('hero-subtitle').should("exist");
      cy.getByData('btn-criar-evento').should("exist").and("be.visible");
    });

    it("deve renderizar eventos retornados pela API", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const eventos = interception.response.body?.data?.docs || [];
        
        cy.wait(1000);
        
        if (eventos.length > 0) {
          const primeiroEvento = eventos[0];
          
          if (primeiroEvento.titulo) {
            cy.get('body', { timeout: 10000 }).should('contain', primeiroEvento.titulo);
          }
        } else {
          cy.contains('Nenhum evento encontrado', { timeout: 8000 }).should('exist');
        }
      });
    });
  });

  describe("Navegação", () => {
    it("deve navegar para criar evento ao clicar no botão", () => {
      cy.getByData('btn-criar-evento').click();
      cy.url({ timeout: 5000 }).should("include", "/criar_eventos");
    });
  });

  describe("Paginação", () => {
    it("deve exibir informações de paginação quando houver múltiplas páginas", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const totalPages = interception.response.body?.data?.totalPages || 0;
        
        if (totalPages > 1) {
          cy.getByData('pagination-info', { timeout: 8000 }).should("exist");
          cy.getByData('btn-prev-page').should("exist");
          cy.getByData('btn-next-page').should("exist");
        }
      });
    });

    it("deve fazer requisição com página correta ao navegar", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const totalPages = interception.response.body?.data?.totalPages || 0;
        
        if (totalPages > 1) {
          cy.getByData('btn-next-page', { timeout: 8000 }).should("not.be.disabled").click();
          
          cy.wait('@getEventos', { timeout: 10000 }).then((secondInterception) => {
            const url = new URL(secondInterception.request.url);
            expect(url.searchParams.get('page')).to.equal('2');
          });
          
          cy.getByData('page-2', { timeout: 5000 }).should("have.class", "bg-indigo-600");
        }
      });
    });
  });

  describe("Modal de exclusão", () => {
    it("deve abrir modal ao clicar em excluir", () => {
      const tituloEvento = Cypress.env('tituloEventoTeste');
      
      cy.getByData('search-input').clear().type(tituloEvento.substring(0, 15));
      cy.wait(1000);
      
      cy.getByData('event-card').first().within(() => {
        cy.get('h3').should('contain', tituloEvento.substring(0, 10));
        cy.getByData('event-delete-button').click();
      });
      
      cy.get('.fixed.inset-0.z-50', { timeout: 5000 }).should('exist');
      cy.contains('Confirmar Exclusão').should('exist');
      
      cy.getByData('btn-cancel-delete').click();
      cy.get('.fixed.inset-0.z-50').should('not.exist');
    });

    it("deve fechar modal ao clicar em cancelar", () => {
      const tituloEvento = Cypress.env('tituloEventoTeste');
      
      cy.getByData('search-input').clear().type(tituloEvento.substring(0, 15));
      cy.wait(1000);
      
      cy.getByData('event-card').first().within(() => {
        cy.getByData('event-delete-button').click();
      });
      
      cy.get('.fixed.inset-0.z-50', { timeout: 5000 }).should('exist');
      cy.getByData('btn-cancel-delete').click();
      cy.get('.fixed.inset-0.z-50').should('not.exist');
    });
  });

  describe("Filtros e busca", () => {
    it("deve validar estrutura da resposta", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('page')).to.exist;
        expect(url.searchParams.get('limite')).to.exist;
        
        const responseBody = interception.response.body;
        expect(responseBody).to.have.property('data');
        
        const eventos = responseBody.data?.docs || [];
        
        if (eventos.length > 0) {
          const primeiroEvento = eventos[0];
          expect(primeiroEvento).to.have.property('_id');
          expect(primeiroEvento).to.have.property('titulo');
          expect(primeiroEvento).to.have.property('status');
          expect(primeiroEvento).to.have.property('categoria');
          
          cy.wait(1000);
          cy.get('body', { timeout: 8000 }).should('contain', primeiroEvento.titulo);
        }
      });
    });

    it("deve validar que eventos têm categoria", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const eventos = interception.response.body?.data?.docs || [];
        
        if (eventos.length > 0) {
          eventos.forEach(evento => {
            expect(evento).to.have.property('categoria');
            expect(evento.categoria).to.be.a('string');
          });
          
          cy.wait(1000);
          cy.get('body', { timeout: 8000 }).should('contain', eventos[0].titulo);
        }
      });
    });
  });

  describe("Toggle de Status", () => {
    it("deve validar card-container e toggle de status", () => {
      cy.wait('@getEventos', { timeout: 10000 }).then((interception) => {
        const eventos = interception.response.body?.data?.docs || [];
        
        if (eventos.length > 0) {
          const primeiroEvento = eventos[0];
          const statusInicial = primeiroEvento.status;
          const statusInicialTexto = statusInicial === 1 ? 'Ativo' : 'Inativo';
          
          cy.wait(1000);
          
          cy.get('.w-full.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-6', { timeout: 8000 })
            .should('exist')
            .within(() => {
              cy.get('h1.text-2xl.font-bold').should('contain', 'Meus Eventos');
              cy.get('.grid.grid-cols-1', { timeout: 8000 }).should('exist');
              
              cy.get('.bg-white.rounded-lg.shadow-sm.border.border-gray-200.overflow-hidden').first().within(() => {
                cy.get('img').should('exist');
                cy.get('h3.text-base.font-semibold').should('contain', primeiroEvento.titulo);
                cy.get('span.px-3.py-1.rounded-full').should('contain', statusInicialTexto);
                cy.get('button[title*="evento"]').first().should('exist').click();
              });
            });
          
          cy.wait('@toggleStatus', { timeout: 10000 }).then((statusInterception) => {
            expect(statusInterception.request.method).to.equal('PATCH');
            expect(statusInterception.request.url).to.include(primeiroEvento._id);
            expect(statusInterception.request.body).to.have.property('status');
            expect(statusInterception.request.body.status).to.not.equal(statusInicial);
          });
        }
      });
    });
  });

  describe("Filtros - Status e Categoria", () => {
    it("deve validar filtro de status - Ativo", () => {
      cy.wait('@getEventos', { timeout: 10000 });
      cy.wait(1000);
      
      cy.intercept('GET', '**/eventos/admin/**').as('getEventosFiltrados');
      
      cy.get('button[role="combobox"]').eq(0).click();
      cy.wait(300);
      cy.contains('[role="option"]', 'Ativo').click();
      
      cy.wait('@getEventosFiltrados', { timeout: 10000 }).then((interception) => {
        const eventos = interception.response.body?.data?.docs || [];
        
        if (eventos.length > 0) {
          eventos.forEach((evento) => {
            expect(evento.status).to.equal(1);
          });
          
          cy.wait(1000);
          cy.get('span.px-3.py-1.rounded-full').each(($badge) => {
            expect($badge.text()).to.contain('Ativo');
          });
        }
      });
    });

    it("deve validar filtro de status - Inativo", () => {
      cy.wait('@getEventos', { timeout: 10000 });
      cy.wait(1000);
      
      cy.intercept('GET', '**/eventos/admin/**').as('getEventosFiltrados');
      
      cy.get('button[role="combobox"]').eq(0).click();
      cy.wait(300);
      cy.contains('[role="option"]', 'Inativo').click();
      
      cy.wait('@getEventosFiltrados', { timeout: 10000 }).then((interception) => {
        const eventos = interception.response.body?.data?.docs || [];
        
        if (eventos.length > 0) {
          eventos.forEach((evento) => {
            expect(evento.status).to.equal(0);
          });
          
          cy.wait(1000);
          cy.get('span.px-3.py-1.rounded-full').each(($badge) => {
            expect($badge.text()).to.contain('Inativo');
          });
        }
      });
    });

    it("deve validar combinação de filtros - Status e Categoria", () => {
      cy.wait('@getEventos', { timeout: 10000 });
      cy.wait(1000);
      
      cy.intercept('GET', '**/eventos/admin/**').as('getEventosFiltrados');
      
      cy.get('button[role="combobox"]').eq(0).click();
      cy.wait(300);
      cy.contains('[role="option"]', 'Ativo').click();
      
      cy.wait('@getEventosFiltrados', { timeout: 10000 });
      cy.wait(500);
      
      cy.get('button[role="combobox"]').eq(1).click();
      cy.wait(300);
      cy.get('[role="option"]').eq(1).click();
      
      cy.wait('@getEventosFiltrados', { timeout: 10000 }).then((interception) => {
        const url = new URL(interception.request.url);
        expect(url.searchParams.get('status')).to.exist;
        expect(url.searchParams.get('categoria')).to.exist;
        
        const eventos = interception.response.body?.data?.docs || [];
        
        if (eventos.length > 0) {
          eventos.forEach((evento) => {
            expect(evento.status).to.equal(1);
          });
          
          cy.wait(1000);
          cy.get('span.px-3.py-1.rounded-full').each(($badge) => {
            expect($badge.text()).to.contain('Ativo');
          });
        }
      });
    });
  });

  describe("Exclusão do Evento (Limpeza)", () => {
    it("deve excluir o evento criado para os testes com sucesso", () => {
      const tituloEvento = Cypress.env('tituloEventoTeste');
      
      cy.getByData('search-input').clear().type(tituloEvento.substring(0, 15));
      cy.wait(1000);
      
      cy.getByData('event-card').first().within(() => {
        cy.getByData('event-delete-button').click();
      });
      
      cy.get('.fixed.inset-0.z-50', { timeout: 5000 }).should('exist');
      cy.contains('Confirmar Exclusão').should('exist');
      
      cy.getByData('btn-confirm-delete').click();
      
      cy.wait('@deleteEvento', { timeout: 10000 }).then((deleteInterception) => {
        expect(deleteInterception.request.method).to.equal('DELETE');
        expect(deleteInterception.response.statusCode).to.equal(200);
      });
      
      cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible');
      
      Cypress.env('eventoExcluido', true);
    });
  });

  after(() => {
    if (Cypress.env('eventoExcluido')) return;
    
    const tituloEvento = Cypress.env('tituloEventoTeste');
    if (!tituloEvento) return;
    
    cy.intercept('DELETE', '**/eventos/*').as('deleteEventoCleanup');
    
    cy.login('admin@admin.com', 'SenhaSuperSegur@123');
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/meus_eventos`);
    cy.url().should('include', '/meus_eventos');
    cy.getByData('card-container').should('be.visible');

    cy.getByData('search-input').clear().type(tituloEvento.substring(0, 15));
    cy.wait(1000);
    
    cy.get('body').then(($body) => {
      if ($body.find('[data-test="event-card"]').length > 0) {
        cy.getByData('event-card').first().within(() => {
          cy.getByData('event-delete-button').click();
        });
        
        cy.getByData('btn-confirm-delete').click();
        
        cy.wait('@deleteEventoCleanup').then((interception) => {
          expect([200, 204]).to.include(interception.response.statusCode);
        });
        
        cy.get('.Toastify__toast--success', { timeout: 10000 }).should('be.visible');
      }
    });
  });

});
