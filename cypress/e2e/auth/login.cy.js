
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("document")) {
    return false;
  }
});

describe("Tela de Login", () => {

  beforeEach(() => {
    // Limpar cookies e sessão antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
    
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}/login`);
  });

  it("deve renderizar todos os elementos da tela", () => {
    cy.getByData('login-container').should("exist");
    cy.getByData('login-card').should("exist");
    cy.getByData('login-logo').should("exist");
    cy.getByData('login-title').should("contain", "Entrar");
    cy.getByData('login-subtitle').should("contain", "Acesse sua conta para continuar");
    cy.getByData('login-form').should("exist");

    cy.getByData('input-email').should("exist");
    cy.getByData('input-senha').should("exist");
    cy.getByData('checkbox-remember').should("exist");

    cy.getByData('btn-entrar').should("exist");
    cy.getByData('link-recuperar').should("exist");
  });

  it("deve navegar para a página de recuperação de senha", () => {
    cy.getByData('link-recuperar').click();
    cy.url({ timeout: 8000 }).should("include", "/recuperar_senha");
  });

  it("deve preencher email, senha e remember", () => {
    cy.getByData('input-email')
      .clear()
      .type("admin@admin.com")
      .should("have.value", "admin@admin.com");

    cy.getByData('input-senha')
      .clear()
      .type("admin")
      .should("have.value", "admin");

    cy.getByData('checkbox-remember')
      .check()
      .should("be.checked");
  });

  it("deve realizar o login com sucesso e redirecionar", () => {
    cy.getByData('input-email').clear().type("admin@admin.com");
    cy.getByData('input-senha').clear().type("SenhaSuperSegur@123");

    cy.getByData('btn-entrar').click();

    cy.url({ timeout: 10000 }).should("include", "/meus_eventos");

    // verificar que o usuário está autenticado (cookie varia conforme ambiente HTTP/HTTPS)
    cy.getCookie("next-auth.session-token").then((cookie) => {
      if (!cookie) {
        // Em HTTPS, o NextAuth usa prefixo __Secure-
        cy.getCookie("__Secure-next-auth.session-token").should("exist");
      } else {
        expect(cookie).to.exist;
      }
    });
  });

});
