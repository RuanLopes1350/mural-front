/// <reference types="cypress" />

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("document")) {
    return false;
  }
});

describe("Tela de Recuperar Senha", () => {

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/recuperar_senha`);
  });

  it("deve renderizar todos os elementos da tela", () => {
    cy.getByData('recover-container').should("exist");
    cy.getByData('recover-card').should("exist");
    cy.getByData('recover-back').should("exist").and("contain", "Voltar para login");
    cy.getByData('recover-title').should("exist").and("contain", "Recuperar Senha");
    cy.getByData('input-email-recover').should("exist");
    cy.getByData('btn-enviar-recover').should("exist").and("contain", "Pedir Link de Recuperação");
  });

  it("deve navegar para a página de login ao clicar em voltar", () => {
    cy.getByData('recover-back').click();
    cy.url({ timeout: 8000 }).should("include", "/login");
  });

  it("deve solicitar email válido ao tentar enviar sem preencher", () => {
    cy.getByData('input-email-recover').should("have.value", "");
    cy.getByData('btn-enviar-recover').click();
    
    cy.getByData('input-email-recover').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });
  });

  it("deve solicitar email válido ao informar email inválido", () => {
    cy.getByData('input-email-recover').type("email-invalido");
    cy.getByData('btn-enviar-recover').click();
    
    // O campo type="email" valida formato automaticamente
    cy.getByData('input-email-recover').then(($input) => {
      expect($input[0].validity.valid).to.be.false;
    });
  });

});