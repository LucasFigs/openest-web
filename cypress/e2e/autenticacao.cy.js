// cypress/e2e/autenticacao.cy.js — login de verdade.
// Precisa da API rodando e da conta de teste teste3@email.com / 123456.

describe('Testes de Autenticação - L003', () => {

  // Antes de cada teste: página inicial → "Já tenho conta" → tela de login.
  beforeEach(() => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Já tenho conta').click();
    cy.url().should('include', '/login');
  });

  it('Deve fazer login com sucesso', () => {
    cy.get('#login-email').type('teste3@email.com');
    cy.get('#login-senha').type('123456');
    cy.get('button[type="submit"]').click();

    // Saiu do login (vai para a Descoberta).
    cy.url().should('not.include', '/login');
  });

  // O erro agora aparece na própria tela (antes era um alert do navegador).
  it('Deve mostrar erro ao tentar login com senha errada', () => {
    cy.get('#login-email').type('teste3@email.com');
    cy.get('#login-senha').type('senhaerrada123');
    cy.get('button[type="submit"]').click();

    cy.get('.login-error').should('be.visible').and('contain', 'E-mail ou senha incorretos');
    cy.url().should('include', '/login');
  });

  it('Deve mostrar erro ao tentar login com email inexistente', () => {
    cy.get('#login-email').type('naoexiste@email.com');
    cy.get('#login-senha').type('123456');
    cy.get('button[type="submit"]').click();

    cy.get('.login-error').should('be.visible').and('contain', 'E-mail ou senha incorretos');
    cy.url().should('include', '/login');
  });
});
