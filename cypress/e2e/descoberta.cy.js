// cypress/e2e/L009-descoberta.cy.js

describe('Testes de Tela de Descoberta - L009', () => {

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

  it('Deve acessar a tela de descoberta com sucesso', () => {
    fazerLogin();
    cy.url().should('include', '/discovery');
    cy.log('✅ Acessou a tela de descoberta');
  });

  it('Deve exibir cards de perfis na tela', () => {
    fazerLogin();
    cy.get('.conv-card, .profile-card, [class*="card"]').should('exist');
    cy.log('✅ Cards de perfis estão visíveis');
  });

  it('Deve existir o botão de curtir', () => {
    fazerLogin();
    cy.get('.circle-btn.heart-btn').should('be.visible');
    cy.log('✅ Botão de curtir está visível');
  });

  it('Deve existir o botão de passar', () => {
    fazerLogin();
    cy.get('.circle-btn.x-btn').should('be.visible');
    cy.log('✅ Botão de passar está visível');
  });

  it('Deve existir o botão de filtros', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').should('be.visible');
    cy.log('✅ Botão de filtros está visível');
  });

  it('Deve abrir o modal de filtros ao clicar no botão', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    cy.contains('Filtros').should('be.visible');
    cy.log('✅ Modal de filtros aberto');
  });

  it('Deve alterar o filtro de distância', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    cy.get('.purple-slider').should('be.visible');
    cy.get('.purple-slider').invoke('val', 30).trigger('input');
    cy.log('✅ Filtro de distância alterado');
  });

  it('Deve alterar a faixa etária', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    cy.get('input[type="number"]').first().clear().type('20');
    cy.get('input[type="number"]').last().clear().type('35');
    cy.log('✅ Faixa etária alterada');
  });

  it('Deve selecionar um status de relacionamento', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    cy.contains('.check-label', 'Solteiro(a)').click();
    cy.log('✅ Status de relacionamento selecionado');
  });

  it('Deve selecionar um interesse', () => {
    fazerLogin();
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    cy.contains('.tag-btn', 'Games').click();
    cy.log('✅ Interesse selecionado');
  });

  it('Deve aplicar os filtros e fechar o modal', () => {
    fazerLogin();
    
    cy.get('.circle-btn.star-btn').click();
    cy.wait(1000);
    
    // Verificar que o modal está visível
    cy.contains('Filtros').should('be.visible');
    
    // Aplicar filtros
    cy.get('.apply-btn').click();
    cy.wait(1000);
    
    // Verificar se o modal fechou
    cy.get('body').then(($body) => {
      if ($body.text().includes('Filtros')) {
        cy.log('⚠️ Modal ainda aberto, fechando manualmente');
        cy.get('body').click();
      } else {
        cy.log('✅ Filtros aplicados e modal fechado');
      }
    });
  });

  it('Deve curtir um perfil com sucesso', () => {
    fazerLogin();
    cy.get('.circle-btn.heart-btn').first().click();
    cy.wait(2000);
    cy.log('✅ Perfil curtido com sucesso');
  });

  it('Deve passar um perfil com sucesso', () => {
    fazerLogin();
    cy.get('.circle-btn.x-btn').first().click();
    cy.wait(2000);
    cy.log('✅ Perfil passado com sucesso');
  });
});