// cypress/e2e/auth.cy.js

describe('Testes de Autenticação - L003', () => {

  // Antes de cada teste, visitar a página inicial e clicar em "JÁ TENHO UMA CONTA"
  beforeEach(() => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    // Agora está na página de login
  });

  // Teste 1: Login com dados válidos
  it('Deve fazer login com sucesso', () => {
    cy.get('input[type="email"]').type('teste3@email.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    
    // Verificar se redirecionou para alguma página (não está mais no login)
    cy.url().should('not.include', '/login');
  });

  // Teste 2: Login com senha errada (capturando o alert)
  it('Deve mostrar erro ao tentar login com senha errada', () => {
    // Escuta o alert antes de clicar no botão
    cy.on('window:alert', (textoDoAlert) => {
      expect(textoDoAlert).to.contain('Falha no login');
    });
    
    cy.get('input[type="email"]').type('teste3@email.com');
    cy.get('input[type="password"]').type('senhaerrada123');
    cy.get('button[type="submit"]').click();
  });

  // Teste 3: Login com email não existente (capturando o alert)
  it('Deve mostrar erro ao tentar login com email inexistente', () => {
    // Escuta o alert antes de clicar no botão
    cy.on('window:alert', (textoDoAlert) => {
      expect(textoDoAlert).to.contain('Falha no login');
    });
    
    cy.get('input[type="email"]').type('naoexiste@email.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
  });
});