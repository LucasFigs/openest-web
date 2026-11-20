// Gaveta inferior (estilo WhatsApp) para o menu de anexos e as ações da
// mensagem. Fecha com Esc, clique fora ou "Cancelar".
import React, { useEffect } from 'react';

export default function Sheet({ open, onClose, title, options = [], testId }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose} data-testid={testId}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Opções'}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sheet__handle" aria-hidden="true" />
        {title ? <h3 className="sheet__title">{title}</h3> : null}
        <div className="sheet__list">
          {options.map(({ key, label, description, Icon, onSelect, destructive }) => (
            <button
              key={key}
              type="button"
              data-testid={`${testId}-${key}`}
              className={`sheet__row ${destructive ? 'is-destructive' : ''}`}
              onClick={() => {
                onClose?.();
                onSelect?.();
              }}
            >
              <span className="sheet__icon">{Icon ? <Icon size={18} aria-hidden="true" /> : null}</span>
              <span className="sheet__texts">
                <span className="sheet__label">{label}</span>
                {description ? <span className="sheet__description">{description}</span> : null}
              </span>
            </button>
          ))}
        </div>
        <button type="button" className="sheet__cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
