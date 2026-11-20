import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { EyeOff, ShieldCheck, Timer } from 'lucide-react';
import logoOn from '../../assets/images/LOGO.png';
import logoNome from '../../assets/images/NOME.png';
import './Welcome.css';

// Cada promessa aqui corresponde a algo que o app faz de verdade.
const FEATURES = [
  {
    Icon: ShieldCheck,
    title: 'Segurança',
    text: 'Denuncie um perfil em dois toques. A equipe do Openest analisa cada denúncia.',
  },
  {
    Icon: EyeOff,
    title: 'Discrição de verdade',
    text: 'O Modo Discreto tira seu perfil da Descoberta e desliga as confirmações de leitura.',
  },
  {
    Icon: Timer,
    title: 'Fotos que somem',
    text: 'No chat, envie fotos de visualização única: abrem uma só vez e depois somem da conversa.',
  },
];

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-container">
      <nav className="welcome-navbar">
        <div className="welcome-nav-content">
          <div className="welcome-nav-left">
            <button type="button" className="welcome-brand" onClick={() => navigate('/welcome')} aria-label="Openest — início">
              <img src={logoOn} alt="" className="welcome-logo-img" />
              <img src={logoNome} alt="Openest" className="welcome-logo-nome" />
            </button>
            <div className="welcome-nav-links">
              <a href="/termos-de-uso" onClick={(e) => { e.preventDefault(); navigate('/termos-de-uso'); }}>Termos de uso</a>
              <a href="/politica-de-privacidade" onClick={(e) => { e.preventDefault(); navigate('/politica-de-privacidade'); }}>Privacidade</a>
            </div>
          </div>
          <button type="button" className="welcome-btn-login" onClick={() => navigate('/login')}>
            Entrar
          </button>
        </div>
      </nav>

      <main className="welcome-main-flow">
        <header className="welcome-hero-section">
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="welcome-hero-title">
              Conexões reais,
              <br />
              <span className="welcome-text-accent">sem julgamentos.</span>
            </h1>
            <p className="welcome-hero-subtitle">
              O lugar seguro para casais e pessoas solteiras explorarem novas experiências,
              com discrição e autenticidade.
            </p>
            <div className="welcome-hero-actions">
              <button type="button" className="welcome-hero-cta" onClick={() => navigate('/register')}>
                Criar conta
              </button>
              <button type="button" className="welcome-hero-secondary" onClick={() => navigate('/login')}>
                Já tenho conta
              </button>
            </div>
          </Motion.div>
        </header>

        <section className="welcome-features-section" aria-label="Por que o Openest">
          {FEATURES.map((feature) => {
            const Icon = feature.Icon;
            return (
              <article key={feature.title} className="welcome-feature-card">
                <span className="welcome-feature-icon"><Icon size={22} aria-hidden="true" /></span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </section>

        <footer className="welcome-footer-simple">
          <p>© 2026 Openest</p>
        </footer>
      </main>
    </div>
  );
};

export default Welcome;
