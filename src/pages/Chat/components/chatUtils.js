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

// ── Encontro marcado (convite aceito) ───────────────────────────────────
// A API grava "[ENCONTRO_MARCADO]{titulo, scheduled_at, local, nota}" e já
// manda `meeting` pronto. Aceites antigos ("✅ Convite Aceite!") não têm
// detalhes, mas também viram o card.
export const MEETING_TAG = '[ENCONTRO_MARCADO]';
export const INVITE_ACCEPTED_TEXT = '✅ Convite Aceite!';
export const INVITE_REJECTED_TEXT = '❌ Convite Recusado';

export function lerEncontro(msg) {
  if (!msg) return null;
  if (msg.meeting && typeof msg.meeting === 'object') return msg.meeting;
  const v = String(msg.content || '');
  if (v === INVITE_ACCEPTED_TEXT) return {};
  if (!v.startsWith(MEETING_TAG)) return null;
  try {
    const dados = JSON.parse(v.slice(MEETING_TAG.length));
    return dados && typeof dados === 'object' ? dados : {};
  } catch {
    return {};
  }
}

// Conteúdo do encontro a partir do convite (mesmos campos que a API guarda).
export function montarEncontro(convite = {}) {
  const encontro = {};
  for (const chave of ['titulo', 'scheduled_at', 'local', 'nota']) {
    if (convite[chave] != null && convite[chave] !== '') encontro[chave] = convite[chave];
  }
  return { content: `${MEETING_TAG}${JSON.stringify(encontro)}`, meeting: encontro };
}

export function formatarQuando(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} · ${hora}`;
}

// ── Resposta com citação ────────────────────────────────────────────────
// Mesmos tipos da API: text | image | view_once | location | invite |
// invite_answer | deleted.
export function tipoDaMensagem(msg) {
  if (!msg) return 'text';
  const v = String(msg.content || '');
  if (msg.is_deleted || v === DELETED_TEXT) return 'deleted';
  if (msg.is_view_once) return 'view_once';
  if (v.startsWith(INVITE_TAG)) return 'invite';
  if (lerEncontro(msg) || v === INVITE_REJECTED_TEXT) return 'invite_answer';
  if (ehImagem(v)) return 'image';
  if (linkDeMapa(v)) return 'location';
  return 'text';
}

const ROTULOS_CITACAO = {
  image: 'Foto',
  view_once: 'Foto de visualização única',
  location: 'Localização',
  invite: 'Convite de encontro',
  deleted: 'Mensagem apagada',
};

// Texto curto da citação (o ícone vem do `type`).
export function textoDaCitacao(reply) {
  if (!reply) return '';
  if (reply.type === 'invite_answer') {
    return reply.content === 'Convite recusado' || reply.content === INVITE_REJECTED_TEXT ? 'Convite recusado' : 'Encontro marcado';
  }
  if (reply.type === 'image' && reply.content && !ehImagem(reply.content)) return reply.content; // legenda
  return ROTULOS_CITACAO[reply.type] || String(reply.content || '');
}

// Resumo local de uma mensagem citada (mesmo formato do `reply_to` da API),
// usado na barra acima do campo e na bolha otimista antes da confirmação.
export function resumoDaCitacao(msg, nomeDoAutor = null) {
  if (!msg) return null;
  const type = tipoDaMensagem(msg);
  let content = msg.content || '';
  if (type === 'image') content = msg.caption || 'Foto';
  else if (type !== 'text') content = ROTULOS_CITACAO[type] || '';
  return { id: msg.id, sender_id: msg.sender_id, sender_name: nomeDoAutor, type, content };
}

// Citação de uma mensagem: `reply_to` da API ou o formato antigo local.
export function citacaoDe(msg) {
  if (msg?.reply_to) return msg.reply_to;
  if (msg?.reply_to_content) {
    return { id: null, sender_id: null, sender_name: msg.reply_to_sender || null, type: 'text', content: msg.reply_to_content };
  }
  return null;
}
