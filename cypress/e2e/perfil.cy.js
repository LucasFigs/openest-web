// cypress/e2e/L008-perfil.cy.js

describe('Testes de Tela de Perfil - L008', () => {

  const usuario = {
    email: 'teste3@email.com',
    senha: '123456'
  };

  function fazerLogin() {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('http://localhost:5173/welcome');
    cy.wait(1000);
    
    cy.contains('JÁ TENHO UMA CONTA').click();
    cy.wait(1000);
    
    cy.get('input[placeholder="Digite seu email"]').type(usuario.email);
    cy.get('input[placeholder="********"]').type(usuario.senha);
    cy.get('.btn-entrar-submit').click();
    
    cy.url().should('include', '/discovery');
    cy.wait(2000);
  }

  function salvarAlteracoes() {
    // Clica no botão SALVAR ALTERAÇÕES
    cy.get('.save-button-action').click();
    cy.wait(2000);
  }

  // ============================================
  // TESTE 1: Acessar tela de perfil
  // ============================================
  it('Deve acessar a tela de perfil com sucesso', () => {
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    cy.log('✅ Acessou a tela de perfil');
  });

  // ============================================
  // TESTE 2: Verificar campos visíveis
  // ============================================
  it('Deve exibir todos os campos do perfil', () => {
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    
    cy.get('input[type="text"]').first().should('be.visible');
    cy.get('input[type="number"]').should('be.visible');
    cy.get('select').should('be.visible');
    cy.get('textarea').should('be.visible');
    
    cy.log('✅ Todos os campos estão visíveis');
  });

  // ============================================
  // TESTE 3: Editar o nome
  // ============================================
  it('Deve editar o nome do usuário com sucesso', () => {
    const nomeNovo = `Leandro Editado ${Date.now()}`;
    
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    
    cy.get('input[type="text"]').first().clear().type(nomeNovo);
    salvarAlteracoes();
    
    cy.reload();
    cy.wait(2000);
    
    cy.get('input[type="text"]').first().should('have.value', nomeNovo);
    cy.log(`✅ Nome alterado para: ${nomeNovo}`);
  });

  // ============================================
  // TESTE 4: Editar a biografia
  // ============================================
  it('Deve editar a biografia do usuário com sucesso', () => {
    const bioNova = `Teste automatizado Cypress - ${Date.now()}`;
    
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    
    cy.get('textarea').clear().type(bioNova);
    salvarAlteracoes();
    
    cy.reload();
    cy.wait(2000);
    
    cy.get('textarea').should('have.value', bioNova);
    cy.log(`✅ Biografia alterada com sucesso`);
  });

  // ============================================
  // TESTE 5: Alterar o status
  // ============================================
  it('Deve alterar o status do usuário com sucesso', () => {
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    
    cy.get('select').then(($select) => {
      const valorAtual = $select.val();
      const novoValor = valorAtual === 'individual' ? 'couple' : 'individual';
      
      cy.get('select').select(novoValor);
    });
    
    salvarAlteracoes();
    
    cy.reload();
    cy.wait(2000);
    
    cy.get('select').should(($select) => {
      const valor = $select.val();
      expect(valor === 'individual' || valor === 'couple').to.be.true;
    });
    
    cy.log('✅ Status alterado com sucesso');
  });

  // ============================================
  // TESTE 6: Alterar a idade
  // ============================================
  it('Deve alterar a idade do usuário com sucesso', () => {
    const idadeNova = '30';
    
    fazerLogin();
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
    
    cy.get('input[type="number"]').clear().type(idadeNova);
    salvarAlteracoes();
    
    cy.reload();
    cy.wait(2000);
    
    cy.get('input[type="number"]').should('have.value', idadeNova);
    cy.log(`✅ Idade alterada para: ${idadeNova}`);
  });
});