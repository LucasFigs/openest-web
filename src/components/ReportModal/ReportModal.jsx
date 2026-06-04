import React from 'react';
import { createPortal } from 'react-dom'; // 🛠 Importação do Portal do React
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, targetUser, onSubmitReport }) => {
  
  if (!isOpen || !targetUser) return null;

  const reportOptions = [
    'Bullying ou perfil inadequado',
    'Suicídio, automutilação ou distúrbios alimentares',
    'Violência, ódio ou exploração',
    'Venda ou promoção de itens proibidos',
    'Nudez ou atividade sexual',
    'Golpe, fraude ou spam',
    'Informação falsa'
  ];

  // 🛠 O segredo: createPortal renderiza o HTML direto na raiz do body do navegador
  return createPortal(
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Botão de Fechar X */}
        <button className="report-modal-close-btn" onClick={onClose}>X</button>
        
        <div className="report-modal-content-box">
          <h2 className="report-modal-title">
            Porque você deseja denunciar <span className="report-username">{targetUser.name?.toUpperCase()}</span>?
          </h2>
          
          <div className="report-modal-body-layout">
            
            {/* Foto da pessoa dinamicamente da Discovery */}
            <div className="report-user-image-container">
              <img 
                src={targetUser.img || targetUser.fotos?.[0]} 
                alt={targetUser.name} 
                className="report-user-avatar-img" 
              />
            </div>

            {/* Lista de Botões de Opções */}
            <div className="report-options-list">
              {reportOptions.map((option, idx) => (
                <button 
                  key={idx} 
                  className="report-option-btn"
                  onClick={() => onSubmitReport(targetUser.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>,
    document.body // 🛠 Destino do portal
  );
};

export default ReportModal;