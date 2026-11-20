// Pré-visualização da foto ANTES de enviar (estilo WhatsApp): imagem em
// destaque, legenda opcional, botão circular "1" de visualização única e
// enviar. Fundo sempre escuro — a foto é o foco nos dois temas.
import React, { useEffect, useMemo, useState } from 'react';
import { EyeOff, Send, X } from 'lucide-react';

export default function ImagePreviewModal({ file, onClose, onSend }) {
  const [caption, setCaption] = useState('');
  const [viewOnce, setViewOnce] = useState(false);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!file) return null;

  const enviar = (e) => {
    e?.preventDefault();
    onSend?.({ caption: caption.trim(), viewOnce });
  };

  return (
    <div className="photo-preview" role="dialog" aria-modal="true" aria-label="Pré-visualização da foto" data-testid="image-preview">
      <header className="photo-preview__top">
        <button type="button" className="photo-preview__round" onClick={onClose} aria-label="Cancelar envio da foto" data-testid="image-preview-close">
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <div className="photo-preview__stage">
        <img src={previewUrl} alt="Foto selecionada para envio" draggable={false} />
      </div>

      {viewOnce ? (
        <p className="photo-preview__hint" aria-live="polite">
          <EyeOff size={14} aria-hidden="true" /> Foto de visualização única
        </p>
      ) : null}

      <form className="photo-preview__bar" onSubmit={enviar}>
        <div className="photo-preview__caption">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Adicione uma legenda..."
            maxLength={1000}
            aria-label="Legenda da foto"
            data-testid="image-preview-caption"
            autoFocus
          />
          <button
            type="button"
            className={`photo-preview__once ${viewOnce ? 'is-on' : ''}`}
            onClick={() => setViewOnce((v) => !v)}
            role="switch"
            aria-checked={viewOnce}
            aria-label="Visualização única"
            title="A foto só poderá ser aberta uma vez"
            data-testid="image-preview-view-once"
          >
            1
          </button>
        </div>
        <button
          type="submit"
          className="photo-preview__send"
          aria-label={viewOnce ? 'Enviar foto de visualização única' : 'Enviar foto'}
          data-testid="image-preview-send"
        >
          <Send size={20} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
