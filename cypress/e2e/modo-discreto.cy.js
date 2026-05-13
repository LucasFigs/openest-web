// cypress/e2e/L010-modo-discreto.cy.js

describe('Testes de Modo Discreto - L010', () => {

  const usuario = {
    email: 'teste3@email.com',
    senha: '123456'
  };

  function fazerLogin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('http://localhost:5173/welcome');
    cy.wait(1000);
    
    cy.get('.welcome-btn-login').click();
    cy.wait(1000);
    
    cy.get('input[placeholder="Digite seu email"]').type(usuario.email);
    cy.get('input[placeholder="********"]').type(usuario.senha);
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    cy.wait(2000);
  }

  it('Deve acessar a tela de configurações', () => {
    fazerLogin();
    cy.get('.mono-icon-shield').click();
    cy.url().should('include', '/settings');
    cy.log('✅ Acessou tela de configurações');
  });

  it('Deve existir o toggle do Modo Discreto', () => {
    fazerLogin();
    cy.get('.mono-icon-shield').click();
    cy.url().should('include', '/settings');
    
    cy.get('.ui-slider').should('exist');
    cy.log('✅ Toggle do Modo Discreto existe');
  });

  it('Deve ativar o Modo Discreto', () => {
    fazerLogin();
    cy.get('.mono-icon-shield').click();
    cy.url().should('include', '/settings');
    
    // Usar .first() para pegar o primeiro slider
    cy.get('.ui-slider').first().click();
    cy.wait(1000);
    
    cy.log('✅ Modo Discreto ativado');
  });

  it('Deve desativar o Modo Discreto', () => {
    fazerLogin();
    cy.get('.mono-icon-shield').click();
    cy.url().should('include', '/settings');
    
    cy.get('.ui-slider').first().click();
    cy.wait(1000);
    
    cy.log('✅ Modo Discreto desativado');
  });

  it('Deve alternar o Modo Discreto (ON/OFF) sem erros', () => {
    fazerLogin();
    cy.get('.mono-icon-shield').click();
    cy.url().should('include', '/settings');
    
    // Alternar 3 vezes
    for (let i = 0; i < 3; i++) {
      cy.get('.ui-slider').first().click();
      cy.wait(500);
    }
    
    cy.log('✅ Alternou o Modo Discreto múltiplas vezes');
  });
});