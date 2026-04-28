import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importante
import './Welcome.css';
import logo from "../../assets/images/LOGO.png";
import logo2 from "../../assets/images/NOME.png";

export default function Welcome() {
  const navigate = useNavigate(); // Inicializa o navegador

  return (
    <div className="welcome-container">
      <div className="content">
        <img src={logo} alt="Openest Logo" className="welcome-logo-icon" /> <br />
        <img src={logo2} alt="Openest Name" className="welcome-logo-name" />
        <p className="welcome-subtitle">A sua nova rede social.</p>

        <div className="button-group">
          {/* Agora usa navigate para mudar a URL */}
          <button className="btn-primary" onClick={() => navigate('/register')}>
            CRIAR CONTA
          </button>

          <button className="btn-outline" onClick={() => navigate('/login')}>
            JÁ TENHO UMA CONTA
          </button>
        </div>
      </div>
    </div>
  );
}