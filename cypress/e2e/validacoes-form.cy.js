// cypress/e2e/validacoes-form.cy.js — validações dos formulários de login
// e cadastro. Tudo é validado no navegador: não precisa da API rodando.
//
// Antes, cada teste registrava um listener de alert DEPOIS do clique e
// nada era de fato verificado. Agora conferimos o que a pessoa vê na tela.

const APP = 'http://localhost:5173';

// O campo ficou inválido pela validação nativa do navegador?
const deveSerInvalido = (seletor) =>
  cy.get(seletor).then(($el) => {
    expect($el[0].checkValidity(), `${seletor} deveria estar inválido`).to.eq(false);
  });

function irParaCadastro() {
  cy.visit(`${APP}/welcome`);
  cy.contains('button', 'Criar conta').click();
  cy.url().should('include', '/register');
}

function preencherEtapa1(email, senha, confirmar = senha) {
  cy.get('#reg-email').type(email);
  cy.get('#reg-senha').type(senha);
  cy.get('#reg-confirmar').type(confirmar);
  cy.get('.btn-primary').contains('Próximo').click();
}

describe('Testes de Validações de Formulário - L006', () => {

  // ============================================
  // LOGIN — validação nativa (o pedido nem chega a sair)
  // ============================================
  describe('Login', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/api/users/login').as('login');
      cy.visit(`${APP}/welcome`);
      cy.contains('button', 'Já tenho conta').click();
      cy.url().should('include', '/login');
    });

    it('Deve bloquear login com e-mail vazio', () => {
      cy.get('#login-senha').type('123456');
      cy.get('.btn-entrar-submit').click();
      deveSerInvalido('#login-email');
      cy.url().should('include', '/login');
    });

    it('Deve bloquear login com senha vazia', () => {
      cy.get('#login-email').type('teste3@email.com');
      cy.get('.btn-entrar-submit').click();
      deveSerInvalido('#login-senha');
      cy.url().should('include', '/login');
    });

    it('Deve bloquear login com e-mail inválido (sem @)', () => {
      cy.get('#login-email').type('emailinvalido');
      cy.get('#login-senha').type('123456');
      cy.get('.btn-entrar-submit').click();
      deveSerInvalido('#login-email');
      cy.url().should('include', '/login');
    });

    it('Não chama a API quando o formulário é inválido', () => {
      cy.get('.btn-entrar-submit').click();
      cy.wait(300);
      cy.get('@login.all').should('have.length', 0);
    });
  });

  // ============================================
  // CADASTRO — mensagens na tela, sem avançar de etapa
  // ============================================
  describe('Cadastro', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/api/users/register').as('cadastro');
      irParaCadastro();
    });

    it('Deve mostrar erro com e-mail inválido', () => {
      preencherEtapa1('emailinvalido', '123456');
      cy.contains('.error-msg', 'Informe um e-mail válido.').should('be.visible');
      cy.contains('Etapa 1 de 3').should('be.visible');
    });

    it('Deve mostrar erro com senha muito curta (< 6 caracteres)', () => {
      preencherEtapa1(`teste_${Date.now()}@email.com`, '123');
      cy.contains('.error-msg', 'pelo menos 6 caracteres').should('be.visible');
      cy.contains('Etapa 1 de 3').should('be.visible');
    });

    it('Deve mostrar erro quando senha e confirmação são diferentes', () => {
      preencherEtapa1(`teste_${Date.now()}@email.com`, '123456', 'senhadiferente');
      cy.contains('.error-msg', 'As senhas não coincidem.').should('be.visible');
      cy.contains('Etapa 1 de 3').should('be.visible');
    });

    it('Deve mostrar erro com nome vazio', () => {
      preencherEtapa1(`teste_${Date.now()}@email.com`, '123456');
      cy.contains('Etapa 2 de 3').should('be.visible');

      cy.get('#reg-nascimento').type('2000-01-01');
      cy.get('#reg-bio').type('Teste bio');
      cy.get('.btn-primary').contains('Próximo').click();

      cy.contains('.error-msg', 'Informe seu nome.').should('be.visible');
      cy.contains('Etapa 2 de 3').should('be.visible');
    });

    it('Deve mostrar erro com data de nascimento vazia', () => {
      preencherEtapa1(`teste_${Date.now()}@email.com`, '123456');
      cy.get('#reg-nome').type('Usuario Teste');
      cy.get('#reg-bio').type('Teste bio');
      cy.get('.btn-primary').contains('Próximo').click();

      cy.contains('.error-msg', 'Informe sua data de nascimento.').should('be.visible');
      cy.contains('Etapa 2 de 3').should('be.visible');
    });

    it('Volta uma etapa sem perder o que foi digitado', () => {
      const email = `teste_${Date.now()}@email.com`;
      preencherEtapa1(email, '123456');
      cy.get('#reg-nome').type('Usuario Teste');
      cy.get('.btn-secondary').contains('Voltar').click();

      cy.contains('Etapa 1 de 3').should('be.visible');
      cy.get('#reg-email').should('have.value', email);
      cy.get('.btn-primary').contains('Próximo').click();
      cy.get('#reg-nome').should('have.value', 'Usuario Teste');
    });

    it('Não cria conta enquanto houver erro', () => {
      preencherEtapa1('emailinvalido', '123');
      cy.wait(300);
      cy.get('@cadastro.all').should('have.length', 0);
    });
  });
});
