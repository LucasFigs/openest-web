// Peças pequenas do chat: avatar com iniciais, checks de status e utilitários
// de formatação/classificação de mensagens.
import React, { useState } from 'react';
import { AlertCircle, Check, CheckCheck, Clock } from 'lucide-react';

// ── Avatar: foto real ou iniciais (sem depender de serviço externo) ──────
export function Avatar({ src, name = '', size = 44, className = '' }) {
  const [failed, setFailed] = useState(false);
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';
  const style = { width: size, height: size, fontSize: Math.round(size / 2.6) };
  if (src && !failed && !/ui-avatars\.com/.test(src)) {
    return (
      <img
        src={src}
        alt=""
        className={`avatar ${className}`}
        style={style}
        onError={() => setFailed(true)}
        draggable={false}
      />
    );
  }
  return (
    <span className={`avatar avatar--initials ${className}`} style={style} aria-hidden="true">
      {initials}
    </span>
  );
}

// ── Checks de status (1 cinza · 2 cinzas · 2 azuis) ─────────────────────
// `tone`: 'bubble' (sobre a minha bolha) ou 'surface' (lista de conversas).
// O azul só chega quando NINGUÉM está em Modo Discreto (regra do servidor).
export function MessageTicks({ status, tone = 'bubble' }) {
  const s = status || 'sent';
  if (s === 'pending') {
    return (
      <span className={`msg-ticks msg-ticks--${tone}`} title="Enviando" aria-label="Enviando" data-status="pending">
        <Clock size={13} aria-hidden="true" />
      </span>
    );
  }
  if (s === 'failed') {
    return (
      <span className="msg-ticks msg-ticks--failed" title="Não enviada" aria-label="Não enviada" data-status="failed">
        <AlertCircle size={14} aria-hidden="true" />
      </span>
    );
  }
  const lida = s === 'read';
  const dupla = lida || s === 'delivered';
  const label = lida ? 'Visualizada' : dupla ? 'Entregue' : 'Enviada';
  const Icon = dupla ? CheckCheck : Check;
  return (
    <span
      className={`msg-ticks msg-ticks--${tone} ${lida ? 'is-read' : ''}`}
      title={label}
      aria-label={label}
      data-status={s}
    >
      <Icon size={16} aria-hidden="true" />
    </span>
  );
}
