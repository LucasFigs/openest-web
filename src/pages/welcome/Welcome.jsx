import React from 'react';
import './Welcome.css';
import logo from "../../assets/images/LOGO.png";
import logo2 from "../../assets/images/NOME.png"; // Ajustado para a raiz da src conforme seu print

export default function Welcome({ setPage }) {
  return (
    <div className="welcome-container">
        <div className="content">
        {/* A logo (chama) continua com o tamanho atual */}
        <img src={logo} alt="Openest Logo" className="welcome-logo-icon" /> <br />
        
        {/* O nome (texto) ganha uma classe nova para crescer */}
        <img src={logo2} alt="Openest Name" className="welcome-logo-name" />
        
        <p className="welcome-subtitle">A sua nova rede social.</p>

        <div className="button-group">
          <button className="btn-primary" onClick={() => setPage('register')}>
            CRIAR CONTA
          </button>

          <button className="btn-outline" onClick={() => setPage('login')}>
            JÁ TENHO UMA CONTA
          </button>
        </div>
      </div>
    </div>
  );
}