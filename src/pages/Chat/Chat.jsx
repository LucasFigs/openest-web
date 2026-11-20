// Chat (web) no padrão WhatsApp: lista de conversas com busca, prévia tipada,
// ticks e não lidas; conversa com cabeçalho compacto, fundo com textura,
// balões agrupados, separador de dias, barra de digitação arredondada e
// gavetas para anexos/ações. Foto passa por pré-visualização (legenda +
// visualização única) antes de sair.
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Ban, CalendarCheck, CalendarDays, CalendarX, Camera, ChevronDown, ChevronRight, Clock, Copy,
  Eye, EyeOff, Image as ImageIcon, MapPin, MessageCircle, Plus, Reply, Search, Send, Trash2, X,
} from 'lucide-react';
import Loading from '../../components/Loading/Loading';
import { useChat } from '../../hooks/useChat';
import api from '../../services/api';
import socket from '../../services/socket';
import { Avatar, MessageTicks } from './components/ChatBits';
import {
  DELETED_TEXT, INVITE_REJECTED_TEXT, citacaoDe, ehImagem, formatHora, formatHoraLista, formatarQuando,
  lerConvite, lerEncontro, linkDeMapa, mesmoDia, montarEncontro, resumoDaCitacao, rotuloDoDia,
  statusDaMensagem, textoDaCitacao,
} from './components/chatUtils';
import Sheet from './components/Sheet';
import ImagePreviewModal from './components/ImagePreviewModal';
import ScheduleModal from './components/ScheduleModal';
import { ViewOnceCard, ViewOnceViewer } from './components/ViewOnce';
import './Chat.css';

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const TYPE_ICONS = {
  image: ImageIcon,
  view_once: Eye,
  location: MapPin,
  invite: CalendarDays,
  invite_answer: CalendarDays,
  deleted: Ban,
};

// Prévia da última mensagem na lista (resumo tipado da API).
function previaDaConversa(conv) {
  const last = conv.last_message;
  if (!last) return { text: 'Novo match · diga oi', isNew: true };
  const Icon = last.type === 'view_once' && last.is_opened ? EyeOff : TYPE_ICONS[last.type] || null;
  return { Icon, text: last.preview || '', mine: !!last.is_mine, status: last.status, italic: last.type === 'deleted' };
}

const normalizar = (t = '') => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function ConversationRow({ conv, active, onOpen }) {
  const previa = previaDaConversa(conv);
  const naoLidas = active ? 0 : Number(conv.unreadCount) || 0;
  const { Icon } = previa;
  return (
    <li>
      <button
        type="button"
        className={`conv-row ${active ? 'is-active' : ''}`}
        onClick={onOpen}
        aria-current={active ? 'page' : undefined}
        aria-label={`Conversa com ${conv.name}${naoLidas ? `, ${naoLidas} não lidas` : ''}`}
      >
        <Avatar src={conv.avatar ?? conv.img} name={conv.name} size={48} />
        <span className="conv-row__body">
          <span className="conv-row__line">
            <span className="conv-row__name">{conv.name}</span>
            <span className={`conv-row__time ${naoLidas ? 'is-unread' : ''}`}>{formatHoraLista(conv.timestamp)}</span>
          </span>
          <span className="conv-row__line">
            <span className={`conv-row__preview ${previa.isNew ? 'is-new' : ''} ${previa.italic ? 'is-italic' : ''} ${naoLidas ? 'is-unread' : ''}`}>
              {previa.mine && previa.status ? <MessageTicks status={previa.status} tone="surface" /> : null}
              {Icon ? <Icon size={15} aria-hidden="true" /> : null}
              <span className="conv-row__preview-text">{previa.text}</span>
            </span>
            {naoLidas > 0 ? <span className="conv-row__badge">{naoLidas > 99 ? '99+' : naoLidas}</span> : null}
          </span>
        </span>
      </button>
    </li>
  );
}

function InviteCard({ invite, mine, onAccept, onReject }) {
  const quando = invite.scheduled_at
    ? new Date(invite.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : null;
  return (
    <div className="invite-card">
      <div className="invite-card__header">
        <CalendarDays size={15} aria-hidden="true" /> Convite de encontro
      </div>
      <div className="invite-card__body">
        <strong>{invite.titulo || 'Encontro'}</strong>
        {invite.local ? <p><MapPin size={14} aria-hidden="true" /> {invite.local}</p> : null}
        {quando ? <p><CalendarDays size={14} aria-hidden="true" /> {quando}</p> : null}
        {invite.nota ? <p className="invite-card__note">{invite.nota}</p> : null}
      </div>
      {mine ? (
        <p className="invite-card__waiting">Aguardando resposta…</p>
      ) : (
        <div className="invite-card__actions">
          <button type="button" className="invite-card__reject" onClick={onReject}>Recusar</button>
          <button type="button" className="invite-card__accept" onClick={onAccept}>Aceitar</button>
        </div>
      )}
    </div>
  );
}

// Convite aceito: card com data/local (quando houver) e atalho para Encontros.
function MeetingCard({ meeting, onOpen }) {
  const quando = formatarQuando(meeting.scheduled_at);
  return (
    <div className="meeting-card">
      <div className="meeting-card__head">
        <span className="meeting-card__icon"><CalendarCheck size={18} aria-hidden="true" /></span>
        <span className="meeting-card__title">
          <strong>Encontro marcado</strong>
          {meeting.titulo ? <small>{meeting.titulo}</small> : null}
        </span>
      </div>
      {quando || meeting.local ? (
        <div className="meeting-card__body">
          {quando ? <p><Clock size={14} aria-hidden="true" /> {quando}</p> : null}
          {meeting.local ? <p><MapPin size={14} aria-hidden="true" /> {meeting.local}</p> : null}
        </div>
      ) : null}
      <button type="button" className="meeting-card__cta" onClick={onOpen}>
        Ver encontro <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const listRef = useRef(null);
  const endRef = useRef(null);
  const previousScrollHeight = useRef(0);
  // Rolagem no padrão WhatsApp: abre no fim; mensagem nova só puxa para
  // baixo se a pessoa já está perto do fim (ou se foi ela quem enviou).
  const pertoDoFim = useRef(true);
  const qtdAnterior = useRef(0);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const refreshTimer = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [destaqueId, setDestaqueId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachOpen, setAttachOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [aviso, setAviso] = useState(null);

  const meuId = loggedUser?.id || '';
  const {
    messages, sendMessage, sendInvite, sendImage, openViewOnce, deleteMessage, hideMessageForMe,
    isOtherUserTyping, handleTyping, loading: chatLoading, loadMore, hasNext, setMessages, isConnected,
  } = useChat(conversationId, meuId);

  const mostrarAviso = useCallback((texto) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(null), 3500);
  }, []);

  // ── dados ──────────────────────────────────────────────────────────────
  const carregarConversas = useCallback(async () => {
    try {
      const { data } = await api.get('/conversas');
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    api.get('/users/perfil').then(({ data }) => setLoggedUser(data)).catch((err) => console.error(err));
    carregarConversas();
  }, [carregarConversas]);

  // Lista viva: mensagens novas, matches e ticks atualizam a lista (agrupados).
  const atualizarListaEmBreve = useCallback(() => {
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(carregarConversas, 450);
  }, [carregarConversas]);

  useEffect(() => {
    const eventos = ['notification', 'new_match', 'message_status_updated', 'message_view_once_opened'];
    eventos.forEach((ev) => socket.on(ev, atualizarListaEmBreve));
    return () => {
      eventos.forEach((ev) => socket.off(ev, atualizarListaEmBreve));
      window.clearTimeout(refreshTimer.current);
    };
  }, [atualizarListaEmBreve]);

  // Abrir uma conversa zera as não lidas dela (o servidor marca como visto).
  useEffect(() => {
    if (conversationId) atualizarListaEmBreve();
  }, [conversationId, atualizarListaEmBreve]);

  // ── rolagem ────────────────────────────────────────────────────────────
  const handleScroll = (e) => {
    const el = e.target;
    pertoDoFim.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (el.scrollTop === 0 && hasNext && !chatLoading) {
      previousScrollHeight.current = e.target.scrollHeight;
      loadMore();
    }
  };

  useLayoutEffect(() => {
    if (listRef.current && previousScrollHeight.current > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight - previousScrollHeight.current;
      previousScrollHeight.current = 0;
    }
  }, [messages]);

  useEffect(() => {
    if (previousScrollHeight.current !== 0) return; // carregando histórico antigo
    if (messages.length === 0) {
      qtdAnterior.current = 0;
      pertoDoFim.current = true;
      return;
    }
    const abrindo = qtdAnterior.current === 0;
    qtdAnterior.current = messages.length;
    const ultima = messages[messages.length - 1];
    const minha = ultima && String(ultima.sender_id) === String(meuId);
    if (abrindo || minha || pertoDoFim.current) {
      // Ao abrir a conversa: pula direto para o fim (sem animar o histórico).
      endRef.current?.scrollIntoView({ behavior: abrindo ? 'auto' : 'smooth', block: 'end' });
      pertoDoFim.current = true;
    }
  }, [messages, isOtherUserTyping, meuId]);

  // Fotos carregam depois e empurram o conteúdo: se a pessoa está no fim,
  // continua no fim (antes a conversa abria "no meio" quando havia imagens).
  const manterNoFim = useCallback(() => {
    if (pertoDoFim.current) endRef.current?.scrollIntoView({ block: 'end' });
  }, []);

  // Campo de texto cresce com o conteúdo (até ~5 linhas).
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [newMessage]);

  const activeChat = conversations.find((c) => String(c.id) === String(conversationId));
  const visiveis = useMemo(() => {
    const termo = normalizar(searchQuery);
    return termo ? conversations.filter((c) => normalizar(c.name).includes(termo)) : conversations;
  }, [conversations, searchQuery]);

  // ── citação ────────────────────────────────────────────────────────────
  const autorDaCitacao = (c) => {
    if (!c) return '';
    if (c.sender_id != null && String(c.sender_id) === String(meuId)) return 'Você';
    if (c.sender_id == null && c.sender_name === 'Você') return 'Você';
    return c.sender_name && c.sender_name !== 'Outro' ? c.sender_name : (activeChat?.name || 'Contato');
  };
  const citacaoAtual = replyTo
    ? resumoDaCitacao(replyTo, String(replyTo.sender_id) === String(meuId) ? (loggedUser?.name || null) : (activeChat?.name || null))
    : null;

  // Toque na citação: rola suave até a original e destaca por um instante.
  const irParaMensagem = (id) => {
    if (id == null) return;
    const el = listRef.current?.querySelector(`[data-msg-id="${String(id).replace(/"/g, '')}"]`);
    if (!el) {
      mostrarAviso('A mensagem original não está carregada.');
      return;
    }
    pertoDoFim.current = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setDestaqueId(String(id));
    window.setTimeout(() => setDestaqueId(null), 1600);
  };

  // ── envio ──────────────────────────────────────────────────────────────
  const enviarTexto = () => {
    if (!newMessage.trim() || !conversationId) return;
    sendMessage(newMessage, meuId, citacaoAtual);
    setNewMessage('');
    setReplyTo(null);
    atualizarListaEmBreve();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarTexto();
  };

  // Enter envia; Shift+Enter quebra a linha (padrão WhatsApp Web).
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      enviarTexto();
    }
  };

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setPreviewFile(file);
  };

  const enviarFoto = ({ caption, viewOnce }) => {
    const file = previewFile;
    setPreviewFile(null);
    if (file) {
      sendImage(file, meuId, { caption, viewOnce, reply: citacaoAtual });
      setReplyTo(null);
      atualizarListaEmBreve();
    }
  };

  const handleLocation = () => {
    if (!('geolocation' in navigator)) {
      mostrarAviso('Seu navegador não permite partilhar a localização.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        sendMessage(`📍 Localização partilhada:\nhttp://maps.google.com/maps?q=${coords.latitude},${coords.longitude}`, meuId, citacaoAtual);
        setReplyTo(null);
      },
      () => mostrarAviso('Não foi possível obter a sua localização.')
    );
  };

  // ── convites ───────────────────────────────────────────────────────────
  const handleAceitarConvite = async (msgId, payload) => {
    const encontro = montarEncontro(payload);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, content: encontro.content, meeting: encontro.meeting } : m)));
    try {
      // other_user_id é sempre o contato do chat ativo (nunca o próprio usuário).
      await api.post('/events/agendar', { ...payload, other_user_id: activeChat.other_user_id });
      await api.post(`/mensagens/${msgId}/responder`, { resposta: 'aceite' });
    } catch (err) {
      console.error(err);
      mostrarAviso('Não foi possível aceitar o convite.');
    }
  };

  const handleRecusarConvite = async (msgId) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, content: INVITE_REJECTED_TEXT, meeting: undefined } : m)));
    try {
      await api.post(`/mensagens/${msgId}/responder`, { resposta: 'recusado' });
    } catch (err) {
      console.error(err);
    }
  };

  // ── visualização única ─────────────────────────────────────────────────
  const abrirFotoUnica = async (msg) => {
    if (openingId) return;
    setOpeningId(msg.id);
    try {
      const { url, caption } = await openViewOnce(msg);
      setViewer({ url, caption });
    } catch (err) {
      mostrarAviso(err.code === 'already_opened' ? 'Esta foto já foi aberta.' : err.message);
    } finally {
      setOpeningId(null);
    }
  };

  // ── ações da mensagem ──────────────────────────────────────────────────
  const acoesDaMensagem = (() => {
    const msg = actionMessage;
    if (!msg) return [];
    const apagada = msg.is_deleted || msg.content === DELETED_TEXT;
    const textual = !apagada && !msg.is_view_once && !ehImagem(msg.content) && !lerConvite(msg.content) && !lerEncontro(msg) && msg.content !== INVITE_REJECTED_TEXT;
    const lista = [];
    if (!apagada) {
      lista.push({ key: 'reply', label: 'Responder', Icon: Reply, onSelect: () => { setReplyTo(msg); textareaRef.current?.focus(); } });
    }
    if (textual) {
      lista.push({
        key: 'copy', label: 'Copiar', Icon: Copy,
        onSelect: () => navigator.clipboard?.writeText(msg.content).then(() => mostrarAviso('Mensagem copiada')),
      });
    }
    lista.push({ key: 'delete-me', label: 'Apagar para mim', Icon: Trash2, destructive: true, onSelect: () => hideMessageForMe(msg.id) });
    if (msg.sender_id === meuId && !apagada) {
      lista.push({ key: 'delete-all', label: 'Apagar para todos', Icon: Trash2, destructive: true, onSelect: () => deleteMessage(msg.id) });
    }
    return lista;
  })();

  const anexos = [
    { key: 'gallery', label: 'Fotos', description: 'Escolher uma imagem', Icon: ImageIcon, onSelect: () => galleryInputRef.current?.click() },
    { key: 'camera', label: 'Câmera', description: 'Tirar uma foto agora', Icon: Camera, onSelect: () => cameraInputRef.current?.click() },
    { key: 'location', label: 'Localização', description: 'Partilhar onde você está', Icon: MapPin, onSelect: handleLocation },
    { key: 'schedule', label: 'Agendar encontro', Icon: CalendarDays, onSelect: () => setShowSchedule(true) },
  ];

  // ── render de uma mensagem ─────────────────────────────────────────────
  const renderMensagem = (msg, index) => {
    const mine = msg.sender_id === meuId;
    const anterior = messages[index - 1];
    const criada = msg.created_at || msg.createdAt;
    const criadaAnterior = anterior && (anterior.created_at || anterior.createdAt);
    const novoDia = !anterior || !mesmoDia(criada, criadaAnterior);
    const agrupada = !novoDia && anterior && anterior.sender_id === msg.sender_id &&
      Math.abs(new Date(criada) - new Date(criadaAnterior)) <= GROUP_WINDOW_MS;

    const apagada = msg.is_deleted || msg.content === DELETED_TEXT;
    const encontro = !apagada && !msg.is_view_once ? lerEncontro(msg) : null;
    const recusado = !apagada && msg.content === INVITE_REJECTED_TEXT;
    const convite = !apagada && !msg.is_view_once && !encontro ? lerConvite(msg.content) : null;
    const citacao = !apagada ? citacaoDe(msg) : null;
    const imagem = !apagada && !msg.is_view_once && !convite && ehImagem(msg.content);
    const mapa = !apagada && !msg.is_view_once && !convite && !imagem ? linkDeMapa(msg.content) : null;

    const meta = (
      <span className="bubble__meta">
        <span className="bubble__time">{formatHora(criada)}</span>
        {mine && !apagada ? <MessageTicks status={statusDaMensagem(msg)} /> : null}
      </span>
    );

    let corpo;
    if (apagada) {
      corpo = (
        <span className="bubble__inline">
          <span className="bubble__deleted"><Ban size={14} aria-hidden="true" /> Mensagem apagada</span>
          {meta}
        </span>
      );
    } else if (msg.is_view_once) {
      corpo = (
        <span className="bubble__inline">
          <ViewOnceCard message={msg} mine={mine} opening={openingId === msg.id} onOpen={abrirFotoUnica} />
          {meta}
        </span>
      );
    } else if (encontro) {
      corpo = (
        <>
          <MeetingCard
            meeting={encontro}
            onOpen={() => navigate('/events', { state: { focusDate: encontro.scheduled_at || null } })}
          />
          <span className="bubble__meta-row">{meta}</span>
        </>
      );
    } else if (recusado) {
      corpo = (
        <span className="bubble__inline">
          <span className="bubble__system"><CalendarX size={14} aria-hidden="true" /> Convite recusado</span>
          {meta}
        </span>
      );
    } else if (convite) {
      corpo = (
        <>
          <InviteCard
            invite={convite}
            mine={mine}
            onAccept={() => handleAceitarConvite(msg.id, convite)}
            onReject={() => handleRecusarConvite(msg.id)}
          />
          <span className="bubble__meta-row">{meta}</span>
        </>
      );
    } else if (imagem) {
      corpo = (
        <>
          <span className="bubble__media">
            <img src={msg.content} alt={msg.caption ? `Foto: ${msg.caption}` : 'Foto enviada na conversa'} onLoad={manterNoFim} onClick={() => window.open(msg.content, '_blank', 'noopener')} />
            {!msg.caption ? <span className="bubble__meta bubble__meta--overlay">{formatHora(criada)}{mine ? <MessageTicks status={statusDaMensagem(msg)} /> : null}</span> : null}
          </span>
          {msg.caption ? <span className="bubble__inline bubble__caption"><span className="bubble__text">{msg.caption}</span>{meta}</span> : null}
        </>
      );
    } else if (mapa) {
      corpo = (
        <>
          <a className="location-card" href={mapa} target="_blank" rel="noopener noreferrer">
            <span className="location-card__icon"><MapPin size={18} aria-hidden="true" /></span>
            <span><strong>Localização</strong><small>Ver no mapa</small></span>
          </a>
          <span className="bubble__meta-row">{meta}</span>
        </>
      );
    } else {
      corpo = (
        <span className="bubble__inline">
          <span className="bubble__text">{msg.content}</span>
          {meta}
        </span>
      );
    }

    return (
      <React.Fragment key={msg.id || index}>
        {novoDia && criada ? <div className="day-chip" role="separator"><span>{rotuloDoDia(criada)}</span></div> : null}
        <div
          className={`msg-row ${mine ? 'is-mine' : 'is-theirs'} ${agrupada ? 'is-grouped' : ''} ${destaqueId === String(msg.id) ? 'is-highlighted' : ''}`}
          data-msg-id={msg.id}
        >
          <div
            className={`bubble ${mine ? 'bubble--sent' : 'bubble--received'} ${agrupada ? '' : 'has-tail'} ${imagem ? 'bubble--media' : ''} ${encontro ? 'bubble--card' : ''} ${msg.status === 'failed' ? 'is-failed' : ''}`}
            onContextMenu={(e) => { e.preventDefault(); setActionMessage(msg); }}
          >
            {citacao ? (() => {
              const QuoteIcon = TYPE_ICONS[citacao.type] || null;
              const autor = autorDaCitacao(citacao);
              return (
                <button
                  type="button"
                  className="bubble__quote"
                  onClick={() => irParaMensagem(citacao.id)}
                  aria-label={`Ir para a mensagem de ${autor}`}
                >
                  <strong>{autor}</strong>
                  <span className="bubble__quote-text">
                    {QuoteIcon ? <QuoteIcon size={13} aria-hidden="true" /> : null}
                    <span>{textoDaCitacao(citacao)}</span>
                  </span>
                </button>
              );
            })() : null}
            {corpo}
            <button type="button" className="bubble__menu" onClick={() => setActionMessage(msg)} aria-label="Ações da mensagem">
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const temRascunho = newMessage.length > 0;

  return (
    <div className={`chat-page ${conversationId ? 'has-active' : ''}`}>
      <aside className="chat-sidebar" aria-label="Conversas">
        <header className="chat-sidebar__header">
          <button type="button" className="icon-btn" onClick={() => navigate('/discovery')} aria-label="Voltar para Descobrir">
            <ArrowLeft size={20} aria-hidden="true" />
          </button>
          <h1>Conversas</h1>
        </header>
        <div className="chat-sidebar__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Pesquisar conversas"
          />
          {searchQuery ? (
            <button type="button" className="icon-btn icon-btn--sm" onClick={() => setSearchQuery('')} aria-label="Limpar pesquisa">
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {loadingList ? (
          <div className="chat-sidebar__loading"><Loading /></div>
        ) : visiveis.length > 0 ? (
          <ul className="conv-list">
            {visiveis.map((conv) => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                active={String(conv.id) === String(conversationId)}
                onOpen={() => navigate(`/chat/${conv.id}`)}
              />
            ))}
          </ul>
        ) : (
          <p className="chat-sidebar__empty">
            {searchQuery ? `Ninguém com “${searchQuery}” nas suas conversas.` : 'Você ainda não tem conversas.'}
          </p>
        )}
      </aside>

      <main className="chat-main">
        {activeChat ? (
          <>
            <header className="chat-header">
              <button type="button" className="icon-btn chat-header__back" onClick={() => navigate('/chat')} aria-label="Voltar para conversas">
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <Avatar src={activeChat.avatar ?? activeChat.img} name={activeChat.name} size={40} />
              <div className="chat-header__info">
                <h2>{activeChat.name}</h2>
                {isOtherUserTyping ? (
                  <span className="chat-header__status is-typing">digitando…</span>
                ) : !isConnected ? (
                  <span className="chat-header__status"><span className="dot-warning" aria-hidden="true" /> Reconectando…</span>
                ) : null}
              </div>
              <button type="button" className="icon-btn" onClick={() => setShowSchedule(true)} aria-label="Agendar encontro">
                <CalendarDays size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="chat-messages" onScroll={handleScroll} ref={listRef}>
              {chatLoading ? <div className="chat-messages__loading"><Loading /></div> : null}
              {messages.length === 0 && !chatLoading ? (
                <div className="chat-messages__empty">
                  <span className="empty-badge"><MessageCircle size={24} aria-hidden="true" /></span>
                  <strong>Nenhuma mensagem ainda</strong>
                  <span>Mande a primeira mensagem para {activeChat.name}.</span>
                </div>
              ) : null}
              {messages.map(renderMensagem)}
              {isOtherUserTyping ? (
                <div className="msg-row is-theirs">
                  <div className="bubble bubble--received has-tail typing-bubble" aria-label="digitando">
                    <span /><span /><span />
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            {aviso ? <div className="chat-toast" role="status">{aviso}</div> : null}

            <footer className="composer">
              {replyTo ? (
                <div className="composer__reply" role="status" aria-label="Respondendo mensagem">
                  <span className="composer__reply-content">
                    <strong>{autorDaCitacao(citacaoAtual)}</strong>
                    <span className="composer__reply-text">
                      {TYPE_ICONS[citacaoAtual.type] ? React.createElement(TYPE_ICONS[citacaoAtual.type], { size: 13, 'aria-hidden': true }) : null}
                      <span>{textoDaCitacao(citacaoAtual)}</span>
                    </span>
                  </span>
                  <button type="button" className="icon-btn icon-btn--sm" onClick={() => setReplyTo(null)} aria-label="Cancelar resposta">
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : null}
              <form className="composer__row" onSubmit={handleSubmit}>
                <button type="button" className="icon-btn composer__plus" onClick={() => setAttachOpen(true)} aria-label="Anexar foto, localização ou convite">
                  <Plus size={22} aria-hidden="true" />
                </button>
                <div className="composer__pill">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder="Mensagem"
                    value={newMessage}
                    onChange={(e) => { setNewMessage(e.target.value); handleTyping(meuId); }}
                    onKeyDown={handleKeyDown}
                    aria-label="Mensagem"
                  />
                  {!temRascunho ? (
                    <>
                      <button type="button" className="icon-btn icon-btn--muted" onClick={() => cameraInputRef.current?.click()} aria-label="Tirar foto com a câmera">
                        <Camera size={20} aria-hidden="true" />
                      </button>
                      <button type="button" className="icon-btn icon-btn--muted" onClick={() => setShowSchedule(true)} aria-label="Agendar encontro">
                        <CalendarDays size={19} aria-hidden="true" />
                      </button>
                    </>
                  ) : null}
                </div>
                <button type="submit" className="composer__send" disabled={!newMessage.trim()} aria-label="Enviar mensagem">
                  <Send size={19} aria-hidden="true" />
                </button>
              </form>
              <input ref={galleryInputRef} type="file" accept="image/*" hidden onChange={handleFileChosen} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFileChosen} />
            </footer>
          </>
        ) : (
          <div className="chat-main__placeholder">
            <span className="empty-badge"><MessageCircle size={28} aria-hidden="true" /></span>
            <h2>Suas conversas</h2>
            <p>Escolha uma conversa ao lado para começar.</p>
          </div>
        )}
      </main>

      <Sheet open={attachOpen} onClose={() => setAttachOpen(false)} title="Enviar" options={anexos} testId="attachment-sheet" />
      <Sheet open={!!actionMessage} onClose={() => setActionMessage(null)} title="Mensagem" options={acoesDaMensagem} testId="message-actions" />

      {previewFile ? <ImagePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onSend={enviarFoto} /> : null}
      {viewer ? <ViewOnceViewer url={viewer.url} caption={viewer.caption} onClose={() => setViewer(null)} /> : null}
      {showSchedule && activeChat ? (
        <ScheduleModal
          activeChat={activeChat}
          conversationId={conversationId}
          onClose={() => setShowSchedule(false)}
          onSuccess={(payload) => {
            setShowSchedule(false);
            sendInvite(payload, meuId);
            mostrarAviso('Convite enviado');
          }}
        />
      ) : null}
    </div>
  );
};

export default Chat;
