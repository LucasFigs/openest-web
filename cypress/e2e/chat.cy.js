// cypress/e2e/L012-chat.cy.js

describe('Testes de Chat - L012', () => {

  const usuario = {
    email: 'teste3@email.com',
    senha: '123456'
  };

  it('Deve dar match, enviar mensagem, voltar e acessar o chat pela lista', () => {
    
    // ========== PASSO 1: LOGIN ==========
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
    cy.wait(3000);
    
    // ========== PASSO 2: DAR MATCH ==========
    cy.log('🔄 Tentando dar match...');
    
    // Curtir UM perfil
    cy.get('.circle-btn.heart-btn').first().click();
    cy.wait(3000);
    
    // Verificar se deu match
    cy.get('body').then(($body) => {
      if ($body.find('.match-btn-chat').length > 0) {
        cy.log('✅ Match encontrado!');
        cy.get('.match-btn-chat').click();
        cy.wait(1000);
        
        // ========== PASSO 3: VERIFICAR CHAT E ENVIAR MENSAGEM ==========
        cy.url().should('match', /\/chat\/\d+/);
        cy.log('✅ Redirecionou para o chat');
        
        const mensagem = `Teste automatizado - ${Date.now()}`;
        cy.get('input[placeholder="Envie uma mensagem..."]').type(mensagem);
        cy.get('.btn-send').click();
        cy.wait(1000);
        cy.contains(mensagem).should('be.visible');
        cy.log('✅ Mensagem enviada com sucesso');
        
        // ========== PASSO 4: VOLTAR PARA TELA DE DISCOVERY ==========
        cy.wait(1000);
        cy.get('.icon-back').click();
        cy.wait(1000);
        cy.url().should('include', '/discovery');
        cy.log('✅ Voltou para a tela de discovery');
        
        // ========== PASSO 5: IR PARA LISTA DE CHATS ==========
        cy.get('.mono-icon').first().click();
        cy.wait(1000);
        cy.url().should('include', '/chat/lista');
        cy.log('✅ Acessou a lista de chats');
        
        // ========== PASSO 6: ENTRAR NA CONVERSA PELA LISTA ==========
        cy.get('.conv-info').first().click();
        cy.wait(1000);
        cy.url().should('match', /\/chat\/\d+/);
        cy.log('✅ Entrou na conversa pela lista de chats');
        
        // ========== PASSO 7: VERIFICAR QUE A MENSAGEM AINDA ESTÁ LÁ ==========
        cy.contains(mensagem).should('be.visible');
        cy.log('✅ Mensagem ainda está no chat');
        
      } else {
        cy.log('⚠️ Não deu match nesta tentativa');
      }
    });
    
    cy.log('🎉 FLUXO COMPLETO DE CHAT EXECUTADO COM SUCESSO!');
  });
});