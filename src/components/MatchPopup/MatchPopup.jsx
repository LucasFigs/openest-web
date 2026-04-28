import React from 'react';
import './MatchPopup.css';

const MatchPopup = ({ isOpen, matchName, matchImg, onClose, onChat }) => {
  if (!isOpen) return null;

  return (
    <div className="match-overlay">
      <div className="match-modal">
        <div className="match-content">
          <h1 className="match-title">It's a Match!</h1>
          <p className="match-subtitle">Você e {matchName} curtiram um ao outro.</p>
          
          <div className="match-avatars">
            <img src="https://github.com/edudouraado.png" alt="Edu" className="avatar-me" />
            <img src={matchImg} alt={matchName} className="avatar-them" />
          </div>

          <div className="match-actions">
            <button className="match-btn-chat" onClick={onChat}>
              Conversar agora
            </button>
            <button className="match-btn-continue" onClick={onClose}>
              Continuar explorando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPopup;