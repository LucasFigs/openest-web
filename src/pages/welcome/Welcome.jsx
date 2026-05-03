import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoOn from '../../assets/images/LOGO.png';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-page-container">
      {/* Background animado fixo */}
      <div className="welcome-animated-bg"></div>

      {/* Navbar fixa no topo */}
      <nav className="welcome-navbar">
        <div className="welcome-nav-content">
          <div className="welcome-nav-left">
            <img src={logoOn} alt="Openest" className="welcome-logo-img" />
            <div className="welcome-nav-links">
              <span>Produtos</span>
              <span>Segurança</span>
              <span>Suporte</span>
            </div>
          </div>
          <button className="welcome-btn-login" onClick={() => navigate('/login')}>
            Entrar
          </button>
        </div>
      </nav>

      {/* Área de conteúdo rolável */}
      <div className="welcome-main-flow">
        <header className="welcome-hero-section">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="welcome-hero-title">
              Conexões Reais, <br />
              <span className="welcome-text-gradient">Sem Julgamentos.</span>
            </h1>
            <p className="welcome-hero-subtitle">
              O refúgio seguro para casais e indivíduos explorarem novas experiências 
              com total discrição e autenticidade em Fortaleza.
            </p>
            <button className="welcome-hero-cta" onClick={() => navigate('/register')}>
              Começar agora
            </button>
          </motion.div>
        </header>

        {/* Seção de Features - Garante que o usuário precise rolar a tela */}
        <section className="welcome-features-section">
          <div className="welcome-feature-card">
            <div className="welcome-feature-icon">🛡️</div>
            <h3>Segurança</h3>
            <p>Verificação de perfis e proteção de dados de ponta a ponta para sua tranquilidade.</p>
          </div>

          <div className="welcome-feature-card">
            <div className="welcome-feature-icon">🕵️</div>
            <h3>Discrição</h3>
            <p>Controle total sobre quem pode visualizar seu perfil e sua atividade na plataforma.</p>
          </div>

          <div className="welcome-feature-card">
            <div className="welcome-feature-icon">✨</div>
            <h3>Autenticidade</h3>
            <p>Um espaço focado em transparência, respeito mútuo e conexões genuínas.</p>
          </div>
        </section>

        <footer className="welcome-footer-simple">
          <p>© 2026 Openest - Feito com liberdade em Fortaleza.</p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;