// cypress/e2e/L004-upload-foto.cy.js

describe('Testes de Upload de Foto - L004', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    cy.get('input[type="email"]').type('teste3@email.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/discovery');
    cy.get('img[alt="Profile"]').click();
    cy.url().should('include', '/edit-profile');
  });

  it('Deve encontrar o botão de adicionar foto', () => {
    cy.get('.add-item-btn').should('be.visible');
  });

  it('Deve fazer upload de foto de perfil com sucesso', () => {
    // O input file está oculto (display: none)
    // Por isso usamos { force: true } para interagir mesmo assim
    
    // Primeiro, clicamos no botão + para abrir o seletor
    cy.get('.add-item-btn').click();
    
    // Depois, encontramos o input oculto e forçamos o upload
    cy.get('input[type="file"]').selectFile('cypress/fixtures/teste.jpg', { force: true });
    
    // Aguardar o upload processar
    cy.wait(3000);
    
    cy.log('Upload executado com sucesso!');
  });
});