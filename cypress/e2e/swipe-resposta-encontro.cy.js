// Swipe da Descoberta (mouse), resposta com citação e card "Encontro marcado".
// Hermético: API simulada com cy.intercept, sessão aberta pelo localStorage.
// Só precisa do front rodando (npm run dev, porta 5173).

const APP = 'http://localhost:5173';
const ME = { id: 'u-me', name: 'Ariel Teste', email: 'eu@exemplo.com' };
const FOTO = `${APP}/src/assets/hero.png`;

function sessao(win) {
  win.localStorage.setItem('token', 'token-de-teste');
  win.localStorage.setItem('user', JSON.stringify(ME));
}

function apiBase() {
  cy.intercept('GET', '**/api/users/perfil', { ...ME, photos: [], modo_discreto: false });
}

// Arrasta o card com o mouse (eventos de ponteiro, como o framer-motion lê).
function arrastar(dx) {
  cy.get('[data-testid="swipe-card"]').then(($card) => {
    const r = $card[0].getBoundingClientRect();
    const x0 = r.left + r.width / 2;
    const y0 = r.top + r.height / 2;
    const base = { pointerId: 1, button: 0, buttons: 1, isPrimary: true, pointerType: 'mouse', force: true, eventConstructor: 'PointerEvent' };
    cy.wrap($card).trigger('pointerdown', { ...base, clientX: x0, clientY: y0 });
    const passos = 8;
    for (let i = 1; i <= passos; i += 1) {
      cy.document().trigger('pointermove', { ...base, clientX: x0 + (dx * i) / passos, clientY: y0 + 4 * i });
      cy.wait(16);
    }
    cy.document().trigger('pointerup', { ...base, buttons: 0, clientX: x0 + dx, clientY: y0 + 32 });
  });
}

describe('Descoberta: swipe estilo Tinder', () => {
  beforeEach(() => {
    apiBase();
    cy.intercept('GET', '**/api/conversas', []);
    cy.intercept('GET', '**/api/users/buscar*', {
      perfis: [
        { id: 'p1', name: 'Marina', birth_date: '1996-05-01', foto_url: FOTO, photos: [FOTO] },
        { id: 'p2', name: 'Lucas', birth_date: '1994-02-10', foto_url: FOTO, photos: [FOTO] },
        { id: 'p3', name: 'Bia', birth_date: '1998-08-20', foto_url: FOTO, photos: [FOTO] },
      ],
      hasMore: false,
    });
    cy.intercept('POST', '**/api/curtir/*', { match: false }).as('curtir');
    cy.intercept('POST', '**/api/passar/*', { ok: true }).as('passar');
    cy.viewport(1280, 720);
    cy.visit(`${APP}/discovery`, { onBeforeLoad: sessao });
    cy.contains('.info-box h2', 'Marina').should('be.visible');
  });

  it('arrastar para a direita mostra CURTI, curte na API e sobe o próximo', () => {
    arrastar(320);
    cy.wait('@curtir').its('request.url').should('match', /\/curtir\/p1$/);
    cy.contains('.info-box h2', 'Lucas').should('be.visible');
  });

  it('arrastar para a esquerda passa o perfil na rota real da API', () => {
    arrastar(-320);
    cy.wait('@passar').its('request.url').should('match', /\/passar\/p1$/);
    cy.contains('.info-box h2', 'Lucas').should('be.visible');
  });

  it('arraste curto volta ao centro sem chamar a API', () => {
    arrastar(40);
    cy.wait(600);
    cy.get('@curtir.all').should('have.length', 0);
    cy.get('@passar.all').should('have.length', 0);
    cy.contains('.info-box h2', 'Marina').should('be.visible');
  });

  it('selo aparece com opacidade proporcional durante o arraste', () => {
    cy.get('[data-testid="swipe-card"]').then(($card) => {
      const r = $card[0].getBoundingClientRect();
      const base = { pointerId: 1, button: 0, buttons: 1, isPrimary: true, pointerType: 'mouse', force: true, eventConstructor: 'PointerEvent' };
      cy.wrap($card).trigger('pointerdown', { ...base, clientX: r.left + 200, clientY: r.top + 200 });
      for (let i = 1; i <= 6; i += 1) {
        cy.document().trigger('pointermove', { ...base, clientX: r.left + 200 - 25 * i, clientY: r.top + 200 });
        cy.wait(16);
      }
    });
    cy.get('.swipe-stamp--pass').should(($s) => {
      expect(Number(getComputedStyle($s[0]).opacity)).to.be.greaterThan(0.5);
    });
    cy.get('.swipe-stamp--like').should(($s) => {
      expect(Number(getComputedStyle($s[0]).opacity)).to.eq(0);
    });
    cy.document().trigger('pointerup', { pointerId: 1, button: 0, isPrimary: true, pointerType: 'mouse', force: true, eventConstructor: 'PointerEvent' });
  });

  it('botões ♥ e X animam a saída e chamam a API', () => {
    cy.get('.heart-btn').click();
    cy.wait('@curtir');
    cy.contains('.info-box h2', 'Lucas').should('be.visible');
    cy.get('.x-btn').click();
    cy.wait('@passar').its('request.url').should('match', /\/passar\/p2$/);
    cy.contains('.info-box h2', 'Bia').should('be.visible');
  });
});

describe('Chat: resposta com citação e Encontro marcado', () => {
  const hoje = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const mensagens = [
    { id: 5, sender_id: 'u-me', content: '✅ Convite Aceite!', created_at: hoje(10, 6), status: 'read' },
    {
      id: 4, sender_id: 'u2', content: '[ENCONTRO_MARCADO]{"titulo":"Café","local":"Dragão do Mar"}',
      meeting: { titulo: 'Café', local: 'Dragão do Mar', scheduled_at: '2026-11-22T19:00:00.000Z' },
      created_at: hoje(10, 5), status: 'read',
    },
    {
      id: 3, sender_id: 'u-me', content: 'Sábado eu topo!', created_at: hoje(10, 2), status: 'read', reply_to_id: 1,
      reply_to: { id: 1, sender_id: 'u2', sender_name: 'Marina', type: 'text', content: 'Vamos marcar alguma coisa no fim de semana?' },
    },
    { id: 2, sender_id: 'u2', content: 'Oi! Tudo bem?', created_at: hoje(9, 58), status: 'read' },
    { id: 1, sender_id: 'u2', content: 'Vamos marcar alguma coisa no fim de semana?', created_at: hoje(9, 57), status: 'read' },
  ];

  beforeEach(() => {
    apiBase();
    cy.intercept('GET', '**/api/conversas', [{ id: 10, name: 'Marina', timestamp: hoje(10, 6), unreadCount: 0, other_user_id: 'u2' }]);
    cy.intercept('GET', '**/api/10/mensagens*', { messages: mensagens, pagination: { hasNext: false } });
    cy.intercept('GET', '**/api/events/meus-encontros*', []);
    cy.viewport(1280, 720);
    cy.visit(`${APP}/chat/10`, { onBeforeLoad: sessao });
    cy.contains('Sábado eu topo!').should('be.visible');
  });

  it('balão mostra a citação com autor e texto, e o toque rola até a original', () => {
    cy.get('[data-msg-id="3"] .bubble__quote')
      .should('contain', 'Marina')
      .and('contain', 'Vamos marcar alguma coisa');
    cy.get('[data-msg-id="3"] .bubble__quote').click();
    cy.get('[data-msg-id="1"]').should('have.class', 'is-highlighted');
  });

  it('responder: barra acima do campo, envia reply_to_id e o balão sai com a citação', () => {
    cy.intercept('POST', '**/api/mensagens', (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 99, sender_id: 'u-me', content: req.body.content, status: 'sent', created_at: new Date().toISOString(),
          reply_to_id: req.body.reply_to_id,
          reply_to: { id: 2, sender_id: 'u2', sender_name: 'Marina', type: 'text', content: 'Oi! Tudo bem?' },
        },
      });
    }).as('enviar');

    cy.get('[data-msg-id="2"] .bubble').rightclick();
    cy.contains('button', 'Responder').click();
    cy.get('.composer__reply').should('contain', 'Marina').and('contain', 'Oi! Tudo bem?');

    cy.get('[placeholder="Mensagem"]').type('Tudo ótimo!{enter}');
    cy.wait('@enviar').its('request.body.reply_to_id').should('eq', 2);
    cy.get('.composer__reply').should('not.exist');
    cy.contains('.bubble', 'Tudo ótimo!').find('.bubble__quote').should('contain', 'Marina').and('contain', 'Oi! Tudo bem?');
  });

  it('convite aceito vira o card "Encontro marcado" (novo e antigo) com atalho para Encontros', () => {
    cy.get('[data-msg-id="4"] .meeting-card')
      .should('contain', 'Encontro marcado')
      .and('contain', 'Café')
      .and('contain', 'Dragão do Mar');
    cy.get('[data-msg-id="5"] .meeting-card').should('contain', 'Encontro marcado');
    cy.contains('Convite Aceite!').should('not.exist');

    cy.get('[data-msg-id="4"] .meeting-card__cta').click();
    cy.location('pathname').should('eq', '/events');
  });
});
