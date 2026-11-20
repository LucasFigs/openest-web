// Página de apresentação (/welcome) com a cena 3D.
// Hermético: não precisa da API. Só do front rodando (npm run dev, porta 5173).

const APP = 'http://localhost:5173';

describe('Página de apresentação 3D', () => {
  it('renderiza a cena 3D sem erros e sem bloquear os cliques', () => {
    const erros = [];
    cy.viewport(1280, 720);
    cy.visit(`${APP}/welcome`, {
      onBeforeLoad(win) {
        const original = win.console.error;
        win.console.error = (...args) => { erros.push(args.map(String).join(' ')); original.apply(win.console, args); };
      },
    });
    cy.contains('h1', 'Do match ao').should('be.visible');
    cy.get('.landing-hero__stage.is-ready canvas', { timeout: 20000 }).should('exist');
    // O palco 3D é decorativo: nunca captura ponteiro.
    cy.get('.landing-hero__stage').should('have.css', 'pointer-events', 'none');
    cy.wrap(erros).should('have.length', 0);
  });

  it('"Ver como funciona" rola até a seção', () => {
    cy.viewport(1280, 720);
    cy.visit(`${APP}/welcome`);
    cy.contains('button', 'Ver como funciona').click();
    cy.get('#como-funciona').should(($s) => {
      expect($s[0].getBoundingClientRect().top).to.be.lessThan(200);
    });
  });

  it('CTAs levam ao cadastro e ao login', () => {
    cy.viewport(1280, 720);
    cy.visit(`${APP}/welcome`);
    cy.contains('button', 'Começar agora').click();
    cy.location('pathname').should('eq', '/register');
    cy.visit(`${APP}/welcome`);
    cy.get('.welcome-btn-login').click();
    cy.location('pathname').should('eq', '/login');
  });

  it('sem WebGL mostra a versão estática e a página continua inteira', () => {
    cy.viewport(390, 720);
    cy.visit(`${APP}/welcome`, {
      onBeforeLoad(win) {
        const original = win.HTMLCanvasElement.prototype.getContext;
        cy.stub(win.HTMLCanvasElement.prototype, 'getContext').callsFake(function getContext(tipo, ...rest) {
          if (String(tipo).startsWith('webgl')) return null;
          return original.call(this, tipo, ...rest);
        });
      },
    });
    cy.get('.landing-fallback').should('exist');
    cy.get('.landing-hero__stage canvas').should('not.exist');
    cy.contains('button', 'Criar conta').scrollIntoView().should('be.visible');
  });
});
