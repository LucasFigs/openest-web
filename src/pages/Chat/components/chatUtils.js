// Formatação e classificação de mensagens do chat (mesmas regras do app).
// Status tolerando payloads antigos (só com read_at).
export const statusDaMensagem = (msg) => {
  if (!msg) return 'sent';
  if (['pending', 'failed', 'read', 'delivered', 'sent'].includes(msg.status)) return msg.status;
  if (msg.read_at) return 'read';
  if (msg.delivered_at) return 'delivered';
  return 'sent';
};

export const formatHora = (valor) => {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Hoje → "14:32" · Ontem · dia da semana · data. Rótulos que não são data
// (respostas antigas como "Agora") passam direto.
export function formatHoraLista(valor, agora = new Date()) {
  if (!valor) return '';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(d)) / 86400000);
  if (dias <= 0) return formatHora(valor);
  if (dias === 1) return 'Ontem';
  if (dias < 7) return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function rotuloDoDia(valor, agora = new Date()) {
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '';
  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(d)) / 86400000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const mesmoDia = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return !Number.isNaN(da.getTime()) && !Number.isNaN(db.getTime()) && inicioDoDia(da) === inicioDoDia(db);
};

// ── Classificação de mensagem (mesmas regras do app) ────────────────────
export const DELETED_TEXT = '🚫 Mensagem apagada';
export const INVITE_TAG = '[CONVITE_EVENTO]';

export function ehImagem(content) {
  const v = String(content || '');
  return (
    v.includes('res.cloudinary.com') ||
    v.startsWith('blob:') ||
    /(giphy|tenor)\.com/i.test(v) ||
    /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i.test(v)
  );
}

const MAPS_URL = /https?:\/\/(?:maps\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)\S*/i;
export function linkDeMapa(content) {
  const m = MAPS_URL.exec(String(content || ''));
  return m ? m[0] : null;
}

export function lerConvite(content) {
  const v = String(content || '');
  if (!v.startsWith(INVITE_TAG)) return null;
  try {
    return JSON.parse(v.slice(INVITE_TAG.length));
  } catch {
    return null;
  }
}
