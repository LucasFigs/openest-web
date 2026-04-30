// cypress/e2e/L006-validacoes-form.cy.js

describe('Testes de Validações de Formulário - L006', () => {

  // ============================================
  // TESTE 1: Login - Email vazio
  // ============================================
  it('Deve mostrar erro ao tentar login com email vazio', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    
    // Digitar apenas a senha, email vazio
    cy.get('input[placeholder="********"]').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    // Verificar mensagem de erro
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('email');
    });
  });

  // ============================================
  // TESTE 2: Login - Senha vazia
  // ============================================
  it('Deve mostrar erro ao tentar login com senha vazia', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    
    // Digitar apenas o email, senha vazia
    cy.get('input[placeholder="Digite seu email"]').type('teste3@email.com');
    cy.get('.btn-entrar-submit').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('senha');
    });
  });

  // ============================================
  // TESTE 3: Login - Email inválido (sem @)
  // ============================================
  it('Deve mostrar erro ao tentar login com email inválido', () => {
    cy.visit('http://localhost:5173/welcome');
    cy.contains('JÁ TENHO UMA CONTA').click();
    
    cy.get('input[placeholder="Digite seu email"]').type('emailinvalido');
    cy.get('input[placeholder="********"]').type('123456');
    cy.get('.btn-entrar-submit').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('inválido') || expect(texto).to.contain('email');
    });
  });

  // ============================================
  // TESTE 4: Cadastro - Senha muito curta (< 6 caracteres)
  // ============================================
  it('Deve mostrar erro ao cadastrar com senha muito curta', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('CRIAR CONTA').click();
    
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('input[placeholder="******"]').first().type('123'); // Senha curta (3 caracteres)
    cy.get('input[placeholder="******"]').last().type('123');
    
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('6') || expect(texto).to.contain('caracteres');
    });
  });

  // ============================================
  // TESTE 5: Cadastro - Senhas diferentes
  // ============================================
  it('Deve mostrar erro quando senha e confirmar senha são diferentes', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('CRIAR CONTA').click();
    
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('input[placeholder="******"]').first().type('123456');
    cy.get('input[placeholder="******"]').last().type('senhadiferente');
    
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('diferentes') || expect(texto).to.contain('coincidem');
    });
  });

  // ============================================
  // TESTE 6: Cadastro - Nome vazio
  // ============================================
  it('Deve mostrar erro ao cadastrar com nome vazio', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('CRIAR CONTA').click();
    
    // ETAPA 1 - Email e Senha válidos
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('input[placeholder="******"]').first().type('123456');
    cy.get('input[placeholder="******"]').last().type('123456');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 2 - Nome vazio, data e bio preenchidos
    cy.get('input[placeholder="Seu nome"]').clear(); // Garantir que está vazio
    cy.get('input[type="date"]').type('2000-01-01');
    cy.get('textarea[placeholder="Um pouco sobre você..."]').type('Teste bio');
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('nome');
    });
  });

  // ============================================
  // TESTE 7: Cadastro - Data de nascimento vazia
  // ============================================
  it('Deve mostrar erro ao cadastrar com data de nascimento vazia', () => {
    const emailUnico = `teste_${Date.now()}@email.com`;
    
    cy.visit('http://localhost:5173/welcome');
    cy.contains('CRIAR CONTA').click();
    
    // ETAPA 1
    cy.get('input[placeholder="exemplo@email.com"]').type(emailUnico);
    cy.get('input[placeholder="******"]').first().type('123456');
    cy.get('input[placeholder="******"]').last().type('123456');
    cy.get('.btn-primary').contains('Próximo').click();
    
    // ETAPA 2 - Data vazia
    cy.get('input[placeholder="Seu nome"]').type('Usuario Teste');
    cy.get('input[type="date"]').clear(); // Data vazia
    cy.get('textarea[placeholder="Um pouco sobre você..."]').type('Teste bio');
    cy.get('.btn-primary').contains('Próximo').click();
    
    cy.on('window:alert', (texto) => {
      expect(texto).to.contain('data') || expect(texto).to.contain('nascimento');
    });
  });
});