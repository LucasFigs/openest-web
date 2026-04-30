// cypress/e2e/L005-integracao.cy.js

describe('Testes de Integração Frontend/Backend - L005', () => {

  // ============================================
  // TESTE 1: Cadastro de novo usuário (completo)
  // ============================================
  it('Deve cadastrar um novo usuário com sucesso', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('CRIAR CONTA').click();
    
    // ETAPA 1 - Email e Senha
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('input[placeholder="******"]').first().type('123456');
    cy.get('input[placeholder="******"]').last().type('123456');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 2 - Nome, Data e Bio
    cy.get('input[placeholder="Seu nome"]').type('Usuario Teste Cypress');
    cy.get('input[type="date"]').type('2000-01-01');
    cy.get('textarea[placeholder="Um pouco sobre você..."]').type('Teste automatizado de cadastro');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 3 - Foto e Identificação
    cy.get('select').select('individual');
    cy.contains('FINALIZAR').click();  // Botão FINALIZAR em CAIXA ALTA
    
    // Verificar se foi redirecionado (para login ou discovery)
    cy.url().should('not.contain', '/register');
  });

  // ============================================
  // TESTE 2: Login com sucesso
  // ============================================
  it('Deve fazer login com sucesso e redirecionar', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    
    cy.get('input[placeholder="Digite seu email"]').type('teste3@email.com');
    cy.get('input[placeholder="********"]').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
  });

  // ============================================
  // TESTE 3: Persistência (recarregar mantém login)
  // ============================================
  it('Deve manter o usuário logado após recarregar a página', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    cy.get('input[placeholder="Digite seu email"]').type('teste3@email.com');
    cy.get('input[placeholder="********"]').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    cy.reload();
    cy.url().should('include', '/discovery');
  });

  // ============================================
  // TESTE 4: Logout (PENDENTE - Funcionalidade não implementada)
  // ============================================
  it('Deve fazer logout e redirecionar para a página inicial', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    cy.get('input[placeholder="Digite seu email"]').type('teste3@email.com');
    cy.get('input[placeholder="********"]').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    
    cy.get('button:contains("Sair"), button:contains("Logout")').click();
    cy.url().should('include', '/welcome');
  });

  // ============================================
  // TESTE 5: Rota protegida sem login
  // ============================================
  it('Deve redirecionar para login ao tentar acessar discovery sem token', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('http://localhost:5173/discovery');
    cy.url().should('include', '/welcome');
  });
});