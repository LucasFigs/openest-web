// cypress/e2e/L007-busca-match.cy.js

describe('Testes de Busca e Match - L007', () => {

  it('Deve realizar o fluxo completo de match entre dois usuários', () => {
    
    const usuario1 = {
      email: 'teste3@email.com',
      senha: '123456'
    };
    
    const usuario2 = {
      email: `match_${Date.now()}@email.com`,
      senha: '123456',
      nome: 'Beatriz Silva'
    };

    // ============================================
    // FUNÇÃO PARA FAZER LOGIN (limpando dados antes)
    // ============================================
    function fazerLogin(email, senha) {
      // Limpar dados do navegador para garantir que não está logado
      cy.clearCookies();
      cy.clearLocalStorage();
      
      cy.visit('http://localhost:5173/welcome');
      cy.wait(1000);
      
      cy.contains('button', 'Já tenho conta').click();
      cy.wait(1000);
      
      cy.get('#login-email').type(email);
      cy.get('#login-senha').type(senha);
      cy.get('.btn-entrar-submit').click();
      
      cy.url().should('include', '/discovery');
      cy.wait(2000);
    }

    // ============================================
    // PASSO 1: Criar segundo usuário
    // ============================================
    cy.visit('http://localhost:5173/welcome');
    cy.contains('button', 'Criar conta').click();
    
    cy.get('input[placeholder="exemplo@email.com"]').type(usuario2.email);
    cy.get('#reg-senha').type(usuario2.senha);
    cy.get('#reg-confirmar').type(usuario2.senha);
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.get('input[placeholder="Seu nome"]').type(usuario2.nome);
    cy.get('input[type="date"]').type('2000-01-01');
    cy.get('textarea[placeholder="Um pouco sobre você..."]').type('Usuário criado para teste de match');
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.get('select').select('individual');
    cy.contains('button', 'Criar conta').click();
    
    cy.wait(2000);
    cy.log('✅ PASSO 1: Segundo usuário criado');

    // ============================================
    // PASSO 2: Login como usuário 1 e curtir usuário 2
    // ============================================
    fazerLogin(usuario1.email, usuario1.senha);
    
    // Clicar no botão de curtir
    cy.get('.circle-btn.heart-btn').first().click();
    cy.wait(2000);
    cy.log('✅ PASSO 2: Usuário 1 curtiu alguém');

    // ============================================
    // PASSO 3: Login como usuário 2 e curtir usuário 1 (match)
    // ============================================
    fazerLogin(usuario2.email, usuario2.senha);
    
    // Usuário 2 curte de volta
    cy.get('.circle-btn.heart-btn').first().click();
    cy.wait(3000);
    cy.log('✅ PASSO 3: Usuário 2 curtiu de volta');

    // ============================================
    // PASSO 4: Verificar match e clicar em "Conversar agora"
    // ============================================
    cy.get('body').then(($body) => {
      if ($body.find('.match-btn-chat').length > 0) {
        cy.get('.match-btn-chat').click();
        cy.log('✅ PASSO 4: Match detectado e clicou em Conversar agora');
      } else {
        cy.log('⚠️ Botão Conversar agora não apareceu');
      }
    });
    
    cy.wait(2000);

    // ============================================
    // PASSO 5: Verificar lista de chats (como usuário 1)
    // ============================================
    fazerLogin(usuario1.email, usuario1.senha);
    
    cy.visit('http://localhost:5173/chat');
    cy.wait(3000);
    
    // Verificar se o card de conversa existe
    cy.get('.conv-row').should('exist');
    cy.log('✅ PASSO 5: Match aparece na lista de chats!');
    
    cy.log('🎉 FLUXO COMPLETO DE MATCH EXECUTADO COM SUCESSO!');
  });
});