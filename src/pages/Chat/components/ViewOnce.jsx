// Foto de VISUALIZAÇÃO ÚNICA (estilo WhatsApp).
//   <ViewOnceCard>   o que aparece no balão — nunca a miniatura:
//                    fechada "1 Foto" (clique para abrir) · aberta "Aberta"
//   <ViewOnceViewer> tela cheia que mostra a foto UMA vez (sem arrastar nem
//                    "salvar imagem como" pelo menu do clique direito).
import React, { useEffect, useState } from 'react';
import { Loader2, X, EyeOff } from 'lucide-react';

export function ViewOnceCard({ message, mine, opening, onOpen }) {
  const aberta = !!message?.is_opened;
  const podeAbrir = !mine && !aberta && !opening;
  const label = aberta ? 'Aberta' : 'Foto';
  const a11y = aberta
    ? 'Foto de visualização única já aberta'
    : mine
      ? 'Foto de visualização única enviada'
      : 'Foto de visualização única. Clique para abrir';

  return (
    <button
      type="button"
      className={`view-once-card ${aberta ? 'is-opened' : ''}`}
      onClick={podeAbrir ? () => onOpen?.(message) : undefined}
      disabled={!podeAbrir}
      aria-label={a11y}
      data-testid={`view-once-${message?.id}`}
    >
      {opening ? (
        <Loader2 size={20} className="view-once-card__spin" aria-hidden="true" />
      ) : (
        <span className={`view-once-card__badge ${aberta ? 'is-dashed' : ''}`} aria-hidden="true">
          {aberta ? '' : '1'}
        </span>
      )}
      <span className="view-once-card__label">{label}</span>
    </button>
  );
}

export function ViewOnceViewer({ url, caption, onClose }) {
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!url) return null;

  return (
    <div
      className="view-once-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Foto de visualização única"
      data-testid="view-once-viewer"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="view-once-viewer__top">
        <button type="button" className="photo-preview__round" onClick={onClose} aria-label="Fechar foto" data-testid="view-once-viewer-close">
          <X size={22} aria-hidden="true" />
        </button>
        <span className="view-once-viewer__tag">
          <EyeOff size={14} aria-hidden="true" /> Visualização única
        </span>
      </header>

      <div className="view-once-viewer__stage">
        {falhou ? (
          <p className="view-once-viewer__error">Não foi possível carregar a foto.</p>
        ) : (
          <img
            src={url}
            alt="Foto de visualização única"
            draggable={false}
            onLoad={() => setCarregando(false)}
            onError={() => {
              setCarregando(false);
              setFalhou(true);
            }}
          />
        )}
        {carregando && !falhou ? <Loader2 size={32} className="view-once-card__spin view-once-viewer__loader" aria-hidden="true" /> : null}
      </div>

      <footer className="view-once-viewer__footer">
        {caption ? <p className="view-once-viewer__caption">{caption}</p> : null}
        <p className="view-once-viewer__notice">Esta foto não poderá ser aberta de novo.</p>
      </footer>
    </div>
  );
}
