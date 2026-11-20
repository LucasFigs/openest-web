// Tema claro/escuro (web): troca em Configurações, persistência no
// localStorage e aplicação antes do React montar.
//
// Teste hermético: a API é simulada com cy.intercept e a sessão é aberta
// direto no localStorage — não precisa da API no ar nem toca no banco.
// Só precisa do front rodando (npm run dev, porta 5173).

const APP = 'http://localhost:5173';
const STORAGE_KEY = 'openest-theme-mode';

// Fundo da página em cada tema (--color-background em src/styles/theme.css).
const FUNDO_CLARO = 'rgb(248, 247, 250)'; // #f8f7fa
const FUNDO_ESCURO = 'rgb(15, 13, 21)'; // #0f0d15

const usuarioFake = { id: 4242, name: 'Teste Tema', email: 'tema@exemplo.com' };

function abrirSessaoSimulada(win, modo) {
  win.localStorage.setItem('token', 'token-de-teste');
  win.localStorage.setItem('user', JSON.stringify(usuarioFake));
  if (modo) win.localStorage.setItem(STORAGE_KEY, modo);
}

// matchMedia falso: responde "escuro" à preferência do sistema.
function sistemaEscuro(win) {
  cy.stub(win, 'matchMedia').callsFake((query) => ({
    matches: query.includes('prefers-color-scheme: dark'),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  }));
}

function simularApi() {
  cy.intercept('GET', '**/api/users/perfil', {
    statusCode: 200,
    body: { ...usuarioFake, modo_discreto: false, photos: [] },
  }).as('perfil');
  cy.intercept('GET', '**/api/conversas', { statusCode: 200, body: [] });
}

function abrirConfiguracoes(modoSalvo, extra) {
  simularApi();
  cy.visit(`${APP}/settings`, {
    onBeforeLoad(win) {
      abrirSessaoSimulada(win, modoSalvo);
      if (extra) extra(win);
    },
  });
  cy.get('[data-testid="theme-selector"]').should('be.visible');
}

describe('Tema claro/escuro', () => {
  it('aplica o tema salvo já no carregamento (página pública)', () => {
    cy.visit(`${APP}/welcome`, {
      onBeforeLoad(win) { win.localStorage.setItem(STORAGE_KEY, 'dark'); },
    });
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('body').should('have.css', 'background-color', FUNDO_ESCURO);

    cy.visit(`${APP}/welcome`, {
      onBeforeLoad(win) { win.localStorage.setItem(STORAGE_KEY, 'light'); },
    });
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.get('body').should('have.css', 'background-color', FUNDO_CLARO);
  });

  it('troca para Escuro em Configurações e mantém depois de recarregar', () => {
    abrirConfiguracoes('light');
    cy.get('html').should('have.attr', 'data-theme', 'light');

    cy.get('[data-testid="theme-option-dark"]').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('[data-testid="theme-option-dark"]').should('have.attr', 'aria-checked', 'true');
    cy.get('body').should('have.css', 'background-color', FUNDO_ESCURO);
    cy.get('meta[name="theme-color"]').should('have.attr', 'content', '#0f0d15');
    cy.window().then((win) => {
      expect(win.localStorage.getItem(STORAGE_KEY)).to.eq('dark');
    });

    cy.reload();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('[data-testid="theme-option-dark"]').should('have.attr', 'aria-checked', 'true');
  });

  it('volta para Claro e mantém depois de recarregar', () => {
    abrirConfiguracoes('dark');
    cy.get('html').should('have.attr', 'data-theme', 'dark');

    cy.get('[data-testid="theme-option-light"]').click();
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.get('body').should('have.css', 'background-color', FUNDO_CLARO);
    cy.window().then((win) => {
      expect(win.localStorage.getItem(STORAGE_KEY)).to.eq('light');
    });

    cy.reload();
    cy.get('html').should('have.attr', 'data-theme', 'light');
    cy.get('[data-testid="theme-option-light"]').should('have.attr', 'aria-checked', 'true');
  });

  it('Automático segue o tema do sistema', () => {
    abrirConfiguracoes('system', sistemaEscuro);
    cy.get('[data-testid="theme-option-system"]').should('have.attr', 'aria-checked', 'true');
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });

  it('o tema vale nas outras telas (Descoberta)', () => {
    simularApi();
    cy.intercept('GET', '**/api/users/buscar*', { statusCode: 200, body: { perfis: [], hasMore: false } });
    cy.visit(`${APP}/discovery`, {
      onBeforeLoad(win) { abrirSessaoSimulada(win, 'dark'); },
    });
    cy.get('html').should('have.attr', 'data-theme', 'dark');
    cy.get('body').should('have.css', 'background-color', FUNDO_ESCURO);
    cy.contains('Você viu todo mundo por aqui').should('be.visible');
  });
});
