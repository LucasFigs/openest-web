// cypress/e2e/L013-admin.cy.js

describe('Testes de Admin - L013', () => {

  const admin = {
    email: 'admin@openest.com',
    senha: '123456'
  };

  it('Deve realizar fluxo completo no admin', () => {
    
    // ========== LOGIN ADMIN ==========
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('http://localhost:5173/welcome');
    cy.wait(1000);
    cy.get('.welcome-btn-login').click();
    cy.wait(1000);
    
    cy.get('input[placeholder="Digite seu email"]').type(admin.email);
    cy.get('input[placeholder="********"]').type(admin.senha);
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/admin');
    cy.log('✅ Login admin realizado');
    cy.wait(3000);
    
    // ========== VERIFICAR DASHBOARD ==========
    cy.url().should('eq', 'http://localhost:5173/admin');
    cy.log('✅ Dashboard admin acessado');
    
    // ========== VERIFICAR BOTÕES ==========
    cy.contains('Usuários & Matches').should('exist');
    cy.log('✅ Botão Usuários & Matches encontrado');
    
    cy.contains('Status de Denúncias').should('exist');
    cy.log('✅ Botão Status de Denúncias encontrado');
    
    // ========== CLICAR EM STATUS DE DENÚNCIAS (COM FORCE) ==========
    cy.contains('Status de Denúncias').click({ force: true });
    cy.wait(1000);
    cy.log('✅ Alternou para gráfico de Status de Denúncias');
    
    // Verificar se apareceu o conteúdo de denúncias
    cy.contains('Distribuição de Denúncias').should('be.visible');
    cy.log('✅ Gráfico de Denúncias visível');
    
    // ========== VOLTAR PARA USUÁRIOS & MATCHES ==========
    cy.contains('Usuários & Matches').click({ force: true });
    cy.wait(1000);
    cy.log('✅ Voltou para gráfico de Usuários e Matches');
    
    // Verificar se apareceu o conteúdo de usuários
    cy.contains('Crescimento (Últimos 7 dias)').should('be.visible');
    cy.log('✅ Gráfico de Usuários visível');
    
    cy.log('🎉 TESTE DE ADMIN CONCLUÍDO COM SUCESSO!');
  });
});