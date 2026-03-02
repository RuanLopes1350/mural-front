// Comandos Customizados do Cypress

/**
 * @example
 * cy.getByData('input-email')
 */
Cypress.Commands.add('getByData', (seletor) => {
  return cy.get(`[data-test="${seletor}"], [data-teste="${seletor}"]`);
});

/**
 * @example
 * cy.login('admin@admin.com', 'SenhaSuperSegur@123')
 */
Cypress.Commands.add('login', (email, senha) => {
  cy.session([email, senha], () => {
    const baseUrl = Cypress.env('NEXTAUTH_URL');
    cy.visit(`${baseUrl}`);
    cy.getByData('input-email').clear().type(email);
    cy.getByData('input-senha').clear().type(senha);
    cy.getByData('btn-entrar').should('not.be.disabled').click();
    
    // Aguardar o redirecionamento (pode demorar por causa da API)
    cy.url({ timeout: 20000 }).should('include', '/meus_eventos');
  });
});

/**
 * @example
 * cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
