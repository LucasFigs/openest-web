// cypress/e2e/L005-integracao.cy.js

describe('Testes de Integração Frontend/Backend - L005', () => {

  // ============================================
  // TESTE 1: Cadastro de novo usuário (completo)
  // ============================================
  it('Deve cadastrar um novo usuário com sucesso', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Criar conta').click();
    
    // ETAPA 1 - Email e Senha
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('#reg-senha').type('123456');
    cy.get('#reg-confirmar').type('123456');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 2 - Nome, Data e Bio
    cy.get('input[placeholder="Seu nome"]').type('Usuario Teste Cypress');
    cy.get('input[type="date"]').type('2000-01-01');
    cy.get('textarea[placeholder="Um pouco sobre você..."]').type('Teste automatizado de cadastro');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 3 - Foto e Identificação
    cy.get('select').select('individual');
    cy.contains('button', 'Criar conta').click();
    
    // Verificar se foi redirecionado (para login ou discovery)
    cy.url().should('not.contain', '/register');
  });

  // ============================================
  // TESTE 2: Login com sucesso
  // ============================================
  it('Deve fazer login com sucesso e redirecionar', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Já tenho conta').click();
    
    cy.get('#login-email').type('teste3@email.com');
    cy.get('#login-senha').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
  });

  // ============================================
  // TESTE 3: Persistência (recarregar mantém login)
  // ============================================
  it('Deve manter o usuário logado após recarregar a página', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Já tenho conta').click();
    cy.get('#login-email').type('teste3@email.com');
    cy.get('#login-senha').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    cy.reload();
    cy.url().should('include', '/discovery');
  });

  // ============================================
  // TESTE 4: Logout (Configurações → Sair da conta)
  // ============================================
  it('Deve fazer logout e redirecionar para a página inicial', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Já tenho conta').click();
    cy.get('#login-email').type('teste3@email.com');
    cy.get('#login-senha').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    
    cy.get('[aria-label="Configurações"]').click();
    cy.contains('button', 'Sair da conta').click();
    cy.get('.m-btn-danger').contains('Sair').click();
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