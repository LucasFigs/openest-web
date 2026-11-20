// Página de apresentação do Openest (pública, antes do login).
// Hero com cena 3D (Three.js via @react-three/fiber, carregada sob demanda),
// como funciona, diferenciais em bento grid, ecossistema web + mobile e CTA.
import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import {
  ArrowRight, CalendarCheck, Check, CheckCheck, ChevronDown, EyeOff, Flame, Globe,
  Heart, MessageCircle, MonitorSmartphone, Smartphone, Timer, X,
} from 'lucide-react';
import logoOn from '../../assets/images/LOGO.png';
import SceneBoundary from './SceneBoundary';
import './Welcome.css';

const HeroScene = lazy(() => import('./HeroScene'));

const temWebGL = () => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
};

const prefereMenosMovimento = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Versão estática do celular: aparece enquanto o 3D carrega ou sem WebGL.
function HeroFallback() {
  return (
    <div className="landing-fallback" aria-hidden="true">
      <div className="landing-fallback__ring" />
      <div className="landing-fallback__phone">
        <span className="landing-fallback__island" />
        <span className="landing-fallback__card" />
        <span className="landing-fallback__line" />
        <span className="landing-fallback__line is-short" />
      </div>
    </div>
  );
}

const revelar = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const PASSOS = [
  { Icon: Flame, titulo: 'Descubra', texto: 'Arraste para a direita para curtir ou para a esquerda para passar. Pessoas e casais perto de você.' },
  { Icon: MessageCircle, titulo: 'Converse', texto: 'Deu match? O chat abre na hora, com checks de enviado, entregue e lido em tempo real.' },
  { Icon: CalendarCheck, titulo: 'Encontre', texto: 'Mande um convite com data e local. Aceitou, vira "Encontro marcado" na agenda dos dois.' },
];

const Welcome = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const [podeUsar3D] = useState(temWebGL);
  const [reduzido] = useState(prefereMenosMovimento);
  const [heroVisivel, setHeroVisivel] = useState(true);
  const [cenaPronta, setCenaPronta] = useState(false);

  // Cursor e scroll alimentam a cena (refs: nada re-renderiza a página).
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const altura = heroRef.current?.offsetHeight || window.innerHeight;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / altura));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Fora da tela, a cena para de renderizar (poupa GPU durante a apresentação).
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entrada]) => setHeroVisivel(entrada.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="landing">
      <nav className="landing-nav" aria-label="Principal">
        <div className="landing-nav__inner">
          <button type="button" className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Openest, voltar ao topo">
            <img src={logoOn} alt="" />
            <span>Openest</span>
          </button>
          <div className="landing-nav__links">
            <button type="button" onClick={() => irPara('como-funciona')}>Como funciona</button>
            <button type="button" onClick={() => irPara('recursos')}>Recursos</button>
            <button type="button" onClick={() => irPara('multiplataforma')}>Web + App</button>
          </div>
          <button type="button" className="welcome-btn-login" onClick={() => navigate('/login')}>
            Entrar
          </button>
        </div>
      </nav>

      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <header className="landing-hero" ref={heroRef}>
        <div className="landing-hero__glow" aria-hidden="true" />
        <div className="landing-hero__inner">
          <Motion.div
            className="landing-hero__copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="landing-eyebrow"><span className="landing-eyebrow__dot" /> Web + app sincronizados em tempo real</span>
            <h1>
              Do match ao <span className="landing-accent">encontro de verdade.</span>
            </h1>
            <p className="landing-hero__lead">
              Descubra pessoas e casais perto de você, converse com discrição e marque o encontro sem sair da conversa.
            </p>
            <div className="landing-hero__actions">
              <button type="button" className="landing-btn landing-btn--primary" onClick={() => navigate('/register')}>
                Começar agora <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="landing-btn landing-btn--ghost" onClick={() => irPara('como-funciona')}>
                Ver como funciona
              </button>
            </div>
            <ul className="landing-hero__proof">
              <li><EyeOff size={15} aria-hidden="true" /> Modo Discreto</li>
              <li><Timer size={15} aria-hidden="true" /> Foto de visualização única</li>
              <li><CheckCheck size={15} aria-hidden="true" /> Checks em tempo real</li>
            </ul>
          </Motion.div>

          <div className={`landing-hero__stage ${cenaPronta ? 'is-ready' : ''}`}>
            <div className="landing-hero__canvas">
            {podeUsar3D ? (
              <SceneBoundary fallback={<HeroFallback />}>
                <Suspense fallback={<HeroFallback />}>
                  <HeroScene
                    pointer={pointer}
                    scroll={scroll}
                    reduced={reduzido}
                    active={heroVisivel}
                    onReady={() => setCenaPronta(true)}
                  />
                </Suspense>
              </SceneBoundary>
            ) : (
              <HeroFallback />
            )}
            </div>
          </div>
        </div>
        <button type="button" className="landing-scroll-hint" onClick={() => irPara('como-funciona')} aria-label="Rolar para Como funciona">
          <ChevronDown size={22} aria-hidden="true" />
        </button>
      </header>

      <main>
        {/* ── Como funciona ─────────────────────────────────────────── */}
        <section className="landing-section" id="como-funciona" aria-labelledby="como-funciona-titulo">
          <Motion.div className="landing-section__head" {...revelar}>
            <span className="landing-kicker">Como funciona</span>
            <h2 id="como-funciona-titulo">Três passos entre a curtida e o encontro.</h2>
          </Motion.div>
          <ol className="landing-steps">
            {PASSOS.map((passo, i) => {
              const { Icon, titulo, texto } = passo;
              return (
              <Motion.li key={titulo} className="landing-step" {...revelar} transition={{ ...revelar.transition, delay: i * 0.08 }}>
                <span className="landing-step__num">{i + 1}</span>
                <span className="landing-step__icon"><Icon size={20} aria-hidden="true" /></span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Motion.li>
              );
            })}
          </ol>
        </section>

        {/* ── 2. Diferenciais (bento) ───────────────────────────────── */}
        <section className="landing-section" id="recursos" aria-labelledby="recursos-titulo">
          <Motion.div className="landing-section__head" {...revelar}>
            <span className="landing-kicker">Recursos</span>
            <h2 id="recursos-titulo">Feito para conexões reais, com privacidade de verdade.</h2>
          </Motion.div>

          <div className="landing-bento">
            <Motion.article className="bento-tile bento-tile--swipe" {...revelar}>
              <div className="bento-visual bento-swipe" aria-hidden="true">
                <span className="bento-swipe__card is-back" />
                <span className="bento-swipe__card is-mid" />
                <span className="bento-swipe__card is-front">
                  <span className="bento-swipe__stamp">CURTI</span>
                  <span className="bento-swipe__name">Lucas, 29</span>
                </span>
                <span className="bento-swipe__btn is-pass"><X size={18} /></span>
                <span className="bento-swipe__btn is-like"><Heart size={18} fill="currentColor" /></span>
              </div>
              <div className="bento-copy">
                <h3>Swipe e Descoberta</h3>
                <p>Arraste o card com o dedo ou o mouse. Filtros por distância, idade e perfil, para pessoas e casais.</p>
              </div>
            </Motion.article>

            <Motion.article className="bento-tile bento-tile--chat" {...revelar}>
              <div className="bento-visual bento-chat" aria-hidden="true">
                <span className="bento-bubble is-in">Bora no sábado?</span>
                <span className="bento-bubble is-out">
                  <span className="bento-quote"><strong>Marina</strong>Bora no sábado?</span>
                  Sábado sim! <CheckCheck size={14} className="bento-ticks" />
                </span>
                <span className="bento-discreet"><EyeOff size={14} /> Modo Discreto ativo</span>
              </div>
              <div className="bento-copy">
                <h3>Chat em tempo real</h3>
                <p>Checks de enviado, entregue e lido, resposta com citação e Modo Discreto: sem confirmação de leitura e fora da Descoberta.</p>
              </div>
            </Motion.article>

            <Motion.article className="bento-tile bento-tile--once" {...revelar}>
              <div className="bento-visual bento-once" aria-hidden="true">
                <span className="bento-once__chip"><span className="bento-once__one">1</span> Foto</span>
                <ArrowRight size={16} className="bento-once__arrow" />
                <span className="bento-once__chip is-opened"><span className="bento-once__dash" /> Aberta</span>
              </div>
              <div className="bento-copy">
                <h3>Fotos de visualização única</h3>
                <p>Abrem uma vez e somem da conversa. Quem enviou vê "Aberta" na hora.</p>
              </div>
            </Motion.article>

            <Motion.article className="bento-tile bento-tile--meet" {...revelar}>
              <div className="bento-visual bento-meet" aria-hidden="true">
                <span className="bento-meet__card">
                  <span className="bento-meet__icon"><CalendarCheck size={18} /></span>
                  <span>
                    <strong>Encontro marcado</strong>
                    <small>Sáb · 19:00 · Café no centro</small>
                  </span>
                </span>
                <span className="bento-meet__cta">Ver encontro <ArrowRight size={14} /></span>
              </div>
              <div className="bento-copy">
                <h3>Agendamento integrado</h3>
                <p>Convite com data e local dentro do chat. Aceitou, o encontro entra na agenda dos dois.</p>
              </div>
            </Motion.article>
          </div>
        </section>

        {/* ── 3. Ecossistema Web + Mobile ───────────────────────────── */}
        <section className="landing-section" id="multiplataforma" aria-labelledby="multi-titulo">
          <div className="landing-sync">
            <Motion.div className="landing-sync__copy" {...revelar}>
              <span className="landing-kicker">Web + App</span>
              <h2 id="multi-titulo">Mandou no navegador, chegou no celular.</h2>
              <p>O mesmo Openest no computador e no app, conectados em tempo real.</p>
              <ul className="landing-sync__list">
                <li><Check size={16} aria-hidden="true" /> Mensagens e matches aparecem na hora nos dois lados</li>
                <li><Check size={16} aria-hidden="true" /> Checks de entregue e lido atualizam ao vivo</li>
                <li><Check size={16} aria-hidden="true" /> Tema claro ou escuro, salvo em cada aparelho</li>
              </ul>
            </Motion.div>

            <Motion.div className="landing-sync__visual" {...revelar} aria-hidden="true">
              <div className="sync-browser">
                <div className="sync-browser__bar"><span /><span /><span /><em><Globe size={11} /> openest</em></div>
                <div className="sync-browser__body">
                  <span className="sync-msg is-out">Te vejo às 19h <CheckCheck size={13} className="bento-ticks" /></span>
                </div>
                <span className="sync-label"><MonitorSmartphone size={14} /> Web</span>
              </div>
              <div className="sync-wire"><span className="sync-wire__dot" /></div>
              <div className="sync-phone">
                <span className="sync-phone__island" />
                <span className="sync-msg is-in">Te vejo às 19h</span>
                <span className="sync-label"><Smartphone size={14} /> App</span>
              </div>
            </Motion.div>
          </div>
        </section>

        {/* ── 4. CTA final ──────────────────────────────────────────── */}
        <section className="landing-final" aria-labelledby="final-titulo">
          <Motion.div className="landing-final__inner" {...revelar}>
            <h2 id="final-titulo">Seu próximo encontro começa com um match.</h2>
            <p>Crie sua conta em menos de um minuto.</p>
            <div className="landing-hero__actions is-center">
              <button type="button" className="landing-btn landing-btn--primary" onClick={() => navigate('/register')}>
                Criar conta <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button type="button" className="landing-btn landing-btn--ghost" onClick={() => navigate('/login')}>
                Já tenho conta
              </button>
            </div>
          </Motion.div>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-brand is-small"><img src={logoOn} alt="" /> Openest</span>
        <nav aria-label="Legal">
          <a href="/termos-de-uso" onClick={(e) => { e.preventDefault(); navigate('/termos-de-uso'); }}>Termos de uso</a>
          <a href="/politica-de-privacidade" onClick={(e) => { e.preventDefault(); navigate('/politica-de-privacidade'); }}>Privacidade</a>
        </nav>
        <span>© 2026 Openest</span>
      </footer>
    </div>
  );
};

export default Welcome;
