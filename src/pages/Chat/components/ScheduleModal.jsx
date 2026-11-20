// Agendar encontro: envia um convite [CONVITE_EVENTO] na conversa.
import React, { useEffect, useState } from 'react';
import { CalendarDays, X } from 'lucide-react';

export default function ScheduleModal({ activeChat, conversationId, onClose, onSuccess }) {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().slice(0, 16);
  const [form, setForm] = useState({
    titulo: `Encontro com ${activeChat?.name || 'Usuário'}`,
    scheduled_at: '',
    local: '',
    nota: '',
  });
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.scheduled_at) return;
    onSuccess({ conversation_id: conversationId, other_user_id: activeChat.other_user_id, ...form });
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-card" role="dialog" aria-modal="true" aria-labelledby="schedule-title" onClick={(e) => e.stopPropagation()}>
        <div className="schedule-modal-header">
          <span className="schedule-modal-icon"><CalendarDays size={18} aria-hidden="true" /></span>
          <h3 id="schedule-title">Agendar encontro</h3>
          <button type="button" className="schedule-modal-close" onClick={onClose} aria-label="Fechar">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="schedule-modal-subtitle">com <strong>{activeChat?.name || 'Usuário'}</strong></p>
        <form className="schedule-form" onSubmit={handleSubmit}>
          <div className="schedule-field">
            <label htmlFor="sch-titulo">Título</label>
            <input id="sch-titulo" type="text" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: Café no centro" maxLength={100} />
          </div>
          <div className="schedule-field">
            <label htmlFor="sch-quando">Data e hora <span className="required">*</span></label>
            <input id="sch-quando" type="datetime-local" value={form.scheduled_at} min={minDate} required onChange={(e) => set('scheduled_at', e.target.value)} />
          </div>
          <div className="schedule-field">
            <label htmlFor="sch-local">Local</label>
            <input id="sch-local" type="text" value={form.local} onChange={(e) => set('local', e.target.value)} placeholder="Ex: Praça do Ferreira" maxLength={200} />
          </div>
          <div className="schedule-field">
            <label htmlFor="sch-nota">Nota (opcional)</label>
            <textarea id="sch-nota" value={form.nota} onChange={(e) => set('nota', e.target.value)} placeholder="Algum detalhe extra..." rows={3} maxLength={300} />
          </div>
          <button type="submit" className="schedule-submit-btn" disabled={!form.scheduled_at}>
            Enviar convite
          </button>
        </form>
      </div>
    </div>
  );
}
