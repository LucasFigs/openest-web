import React from 'react';
import './Loading.css';
import logoFogo from "../../assets/images/LOGO.png"; // Usando sua logo oficial

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="fire-spinner-container">
        <img src={logoFogo} alt="Carregando..." className="fire-spinner-image" />
        <div className="purple-glow"></div>
      </div>
      <p className="loading-text">Aguarde...</p>
    </div>
  );
};

export default Loading;