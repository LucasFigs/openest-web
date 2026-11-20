import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X } from 'lucide-react';
import './ReportModal.css';

const REPORT_OPTIONS = [
  'Bullying ou perfil inadequado',
  'Suicídio, automutilação ou distúrbios alimentares',
  'Violência, ódio ou exploração',
  'Venda ou promoção de itens proibidos',
  'Nudez ou atividade sexual',
  'Golpe, fraude ou spam',
  'Informação falsa',
];

// Denúncia de perfil: lista simples de motivos, no padrão de folha de ações.
// Renderizada no <body> (portal) para ficar acima de qualquer layout.
const ReportModal = ({ isOpen, onClose, targetUser, onSubmitReport }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !targetUser) return null;

  return createPortal(
    <div className="report-modal-overlay" onClick={onClose}>
      <div
        className="report-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="report-modal-header">
          {targetUser.img ? (
            <img src={targetUser.img} alt="" className="report-user-avatar" />
          ) : null}
          <div className="report-modal-heading">
            <h2 id="report-title" className="report-modal-title">
              Denunciar <span className="report-username">{targetUser.name}</span>
            </h2>
            <p className="report-modal-subtitle">Por que você quer denunciar este perfil? A equipe do Openest analisa cada denúncia.</p>
          </div>
          <button type="button" className="report-modal-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <ul className="report-options-list">
          {REPORT_OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                className="report-option-btn"
                onClick={() => onSubmitReport(targetUser.id, option)}
              >
                <span>{option}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
};

export default ReportModal;
