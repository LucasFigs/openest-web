import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { useChat } from "../../hooks/useChat";
import "./Chat.css";
import logoOn from "../../assets/images/LOGO.png";
import api from "../../services/api";

const IconSearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconCalendar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconReply = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>;
const IconCopy = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const IconTrash = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCamera = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconLocation = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconGif = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'10px'}}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>;
const IconDots = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;

const ScheduleModal = ({ activeChat, conversationId, onClose, onSuccess }) => {
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const minDate = today.toISOString().slice(0, 16);
  const [form, setForm] = useState({ titulo: `Encontro com ${activeChat?.name || 'Usuário'}`, scheduled_at: '', local: '', nota: '' });
  const [saving, setSaving] = useState(false);
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.scheduled_at) return;
    setSaving(true);
    const payloadEvento = { conversation_id: conversationId, other_user_id: activeChat.other_user_id, ...form };
    onSuccess(payloadEvento);
    setSaving(false);
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal-card" onClick={e => e.stopPropagation()}>
        <div className="schedule-modal-header"><span className="schedule-modal-icon"><IconCalendar /></span><h3>Agendar Encontro</h3><button className="schedule-modal-close" onClick={onClose}>✕</button></div>
        <p className="schedule-modal-subtitle">com <strong>{activeChat?.name || 'Usuário'}</strong></p>
        <form className="schedule-form" onSubmit={handleSubmit}>
          <div className="schedule-field"><label>Título</label><input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ex: Café no centro" maxLength={100} /></div>
          <div className="schedule-field"><label>Data e Hora <span className="required">*</span></label><input type="datetime-local" value={form.scheduled_at} min={minDate} required onChange={e => set('scheduled_at', e.target.value)} /></div>
          <div className="schedule-field"><label>Local</label><input type="text" value={form.local} onChange={e => set('local', e.target.value)} placeholder="Ex: Praça do Ferreira" maxLength={200} /></div>
          <div className="schedule-field"><label>Nota (opcional)</label><textarea value={form.nota} onChange={e => set('nota', e.target.value)} placeholder="Algum detalhe extra..." rows={3} maxLength={300} /></div>
          <button type="submit" className="schedule-submit-btn" disabled={saving || !form.scheduled_at}>{saving ? 'Agendando...' : '✓ Enviar Convite'}</button>
        </form>
      </div>
    </div>
  );
};

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null); const chatContainerRef = useRef(null); const previousScrollHeight = useRef(0); const fileInputRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const [mensagemRespondida, setMensagemRespondida] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAnexos, setMenuAnexos] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [lastCreatedEvent, setLastCreatedEvent] = useState(null);

  const usuarioLogadoId = loggedUser?.id || "";
  const modoDiscreto = true;

  const { messages, sendMessage, sendInvite, sendImage, deleteMessage, hideMessageForMe, isOtherUserTyping, handleTyping, loading: chatLoading, loadMore, hasNext, setMessages } = useChat(conversationId, usuarioLogadoId);

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        sendMessage(`📍 Localização partilhada:\nhttp://maps.google.com/maps?q=${coords.latitude},${coords.longitude}`, usuarioLogadoId, mensagemRespondida);
        setMensagemRespondida(null); setMenuAnexos(false);
      }, () => alert("Erro na localização."));
    }
  };

  const handleImageClick = () => { fileInputRef.current.click(); setMenuAnexos(false); };
  const handleImageSelected = (e) => { const f = e.target.files[0]; if (f) sendImage(f, usuarioLogadoId); };
  const handleCopiar = (txt) => { navigator.clipboard.writeText(txt); setMenuAberto(null); };
  const handleResponder = (msg) => { setMensagemRespondida(msg); setMenuAberto(null); };
  const handleApagarParaTodos = (id) => { deleteMessage(id); setMenuAberto(null); };
  const handleApagarParaMim = (id) => { hideMessageForMe(id); setMenuAberto(null); };

  const handleEventCreated = (payloadEvento) => { sendInvite(payloadEvento, usuarioLogadoId); setLastCreatedEvent(true); setTimeout(() => setLastCreatedEvent(null), 5000); };
  
  // 🔥 BUG CORRIGIDO: Garante que o other_user_id seja o contato do chat ativo, para não salvar o evento duplicado com o seu próprio ID
  const handleAceitarConvite = async (msgId, payload) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: '✅ Convite Aceito!' } : m));
    try {
      const payloadCorrigido = { ...payload, other_user_id: activeChat.other_user_id };
      await api.post('/events/agendar', payloadCorrigido);
      await api.post(`/mensagens/${msgId}/responder`, { resposta: 'aceite' });
    } catch(err) { console.error(err); alert("Erro ao aceitar."); }
  };

  const handleRecusarConvite = async (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: '❌ Convite Recusado' } : m));
    try { await api.post(`/mensagens/${msgId}/responder`, { resposta: 'recusado' }); } catch(err) { console.error(err); }
  };

  const handleScroll = (e) => { if (e.target.scrollTop === 0 && hasNext && !chatLoading) { previousScrollHeight.current = e.target.scrollHeight; loadMore(); } };

  useLayoutEffect(() => { if (chatContainerRef.current && previousScrollHeight.current > 0) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight - previousScrollHeight.current; previousScrollHeight.current = 0; } }, [messages]);
  useEffect(() => { if (previousScrollHeight.current === 0) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOtherUserTyping]);
  useEffect(() => { api.get("/users/perfil").then(({ data }) => setLoggedUser(data)).catch(err => console.error(err)); }, []);
  useEffect(() => { setLoading(true); api.get("/conversas").then(({ data }) => setConversations(data)).catch(err => console.error(err)).finally(() => setLoading(false)); }, []);

  const handleSend = (e) => {
    e.preventDefault(); if (!newMessage.trim() || !conversationId) return;
    sendMessage(newMessage, usuarioLogadoId, mensagemRespondida);
    setNewMessage(""); setMensagemRespondida(null);
  };

  const activeChat = conversations.find(c => String(c.id) === String(conversationId));
  const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="figma-container">
      <aside className="figma-sidebar">
        <header className="sidebar-top"><h2 className="brand-title">Openest</h2><button className="icon-back" onClick={() => navigate("/discovery")}>←</button></header>
        <div className="search-container"><div className="search-box"><span className="search-icon"><IconSearch /></span><input type="text" placeholder="Pesquisar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
        <div className="conversations-list">
          {loading ? <div className="loading-sidebar-wrapper"><Loading /></div> : filteredConversations.length > 0 ? filteredConversations.map(conv => (
            <div key={conv.id} className={`conv-card ${conversationId === String(conv.id) ? "active" : ""}`} onClick={() => navigate(`/chat/${conv.id}`)}>
              <div className="avatar-container"><img src={conv.img} alt={conv.name} className="avatar-img" />{conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}</div>
              <div className="conv-info">
                <div className="conv-header-row"><h4>{conv.name}</h4><span className="conv-time">{conv.timestamp}</span></div>
                <p className="last-msg-text">{isOtherUserTyping && conversationId === String(conv.id) ? <span className="typing-small">Digitando...</span> : messages.length > 0 && conversationId === String(conv.id) ? (modoDiscreto ? "Nova mensagem" : messages[messages.length - 1].content) : "Clique para conversar"}</p>
              </div>
            </div>
          )) : <div className="no-matches-msg">Nenhuma conversa encontrada.</div>}
        </div>
      </aside>

      <main className="figma-chat-main">
        {activeChat ? (
          <>
            <header className="chat-area-header"><img src={activeChat.img} alt={activeChat.name} className="header-avatar" /><div className="header-info"><h4>{modoDiscreto ? "Usuário" : activeChat.name}</h4>{isOtherUserTyping && <span className="typing-header">digitando...</span>}</div></header>
            <div className="chat-scroll-area" onScroll={handleScroll} ref={chatContainerRef}>
              {chatLoading && <div style={{ textAlign: "center", padding: "10px" }}><Loading /></div>}
              <img src={logoOn} alt="Watermark" className="on-watermark-img" />

              {messages.map((msg, index) => {
                const foiApagada = msg.is_deleted || msg.content === "🚫 Mensagem apagada";
                const isConvite = typeof msg.content === 'string' && msg.content.startsWith('[CONVITE_EVENTO]');
                let conviteData = null;
                if (isConvite) { try { conviteData = JSON.parse(msg.content.replace('[CONVITE_EVENTO]', '')); } catch (e) { console.error("Parse erro"); } }
                const isImage = !foiApagada && !isConvite && (msg.content.includes('res.cloudinary.com') || msg.content.startsWith('blob:'));

                return (
                  <div key={msg.id || index} className={`msg-wrapper ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`} style={{ zIndex: menuAberto === msg.id ? 100 : 1 }}>
                    <div className={`msg-group ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`}>
                      <div className={`msg-bubble ${foiApagada ? 'deleted' : ''} ${isConvite ? 'invite-bubble' : ''}`}>
                        {msg.reply_to_content && !foiApagada && <div className="quoted-msg"><strong>{msg.reply_to_sender === "Você" ? "Você" : activeChat?.name}</strong><p>{msg.reply_to_content}</p></div>}
                        
                        {foiApagada ? <span style={{ fontStyle: 'italic' }}>{msg.content}</span> : isImage ? <img src={msg.content} alt="Upload" style={{ maxWidth: "250px", borderRadius: "8px", cursor: "pointer" }} onClick={() => window.open(msg.content, "_blank")} /> : isConvite && conviteData ? (
                          <div className="invite-card-ui">
                            <div className="invite-header">📅 Convite de Encontro</div>
                            <div className="invite-body">
                              <strong>{conviteData.titulo}</strong><p>📍 {conviteData.local}</p><p>🕒 {new Date(conviteData.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                            </div>
                            {msg.sender_id !== usuarioLogadoId ? (
                              <div className="invite-actions"><button className="btn-accept" onClick={() => handleAceitarConvite(msg.id, conviteData)}>Aceitar</button><button className="btn-reject" onClick={() => handleRecusarConvite(msg.id)}>Recusar</button></div>
                            ) : <div className="invite-actions"><span className="waiting-text">Aguardando resposta...</span></div>}
                          </div>
                        ) : msg.content}
                      </div>
                      <button className="btn-msg-options" onClick={() => setMenuAberto(menuAberto === msg.id ? null : msg.id)}><IconDots /></button>
                    </div>
                    {menuAberto === msg.id && (
                      <div className={`options-dropdown ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`}>
                        {!foiApagada && !isImage && !isConvite && (<><button onClick={() => handleResponder(msg)}><IconReply /> Responder</button><button onClick={() => handleCopiar(msg.content)}><IconCopy /> Copiar</button></>)}
                        <button className="delete-btn" onClick={() => handleApagarParaMim(msg.id)}><IconTrash /> Apagar p/ mim</button>
                        {msg.sender_id === usuarioLogadoId && !foiApagada && <button className="delete-btn" onClick={() => handleApagarParaTodos(msg.id)}><IconTrash /> Apagar p/ todos</button>}
                      </div>
                    )}
                  </div>
                );
              })}
              {isOtherUserTyping && <div className="msg-wrapper other"><div className="msg-bubble typing-dots">...</div></div>}
              <div ref={messagesEndRef} />
            </div>

            {lastCreatedEvent && <div className="event-created-toast"><span>✅ Convite enviado com sucesso!</span></div>}

            <footer className="chat-input-footer" style={{ flexDirection: 'column' }}>
              {menuAnexos && <div className="attachment-menu"><button type="button" onClick={handleImageClick}><IconCamera /> Enviar Foto</button><button type="button" onClick={handleLocation}><IconLocation /> Localização</button></div>}
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleImageSelected} />
              {mensagemRespondida && <div className="reply-banner"><div className="reply-content"><strong>{mensagemRespondida.sender_id === usuarioLogadoId ? "Você" : activeChat?.name}</strong><p>{mensagemRespondida.content}</p></div><button type="button" className="close-reply" onClick={() => setMensagemRespondida(null)}>✖</button></div>}
              <form className="input-form" onSubmit={handleSend} style={{ width: '100%', marginTop: mensagemRespondida ? '0' : 'auto' }}>
                <button type="button" className="btn-plus" onClick={() => setMenuAnexos(!menuAnexos)}>+</button>
                <button type="button" className="btn-schedule" onClick={() => { setMenuAnexos(false); setShowScheduleModal(true); }}><IconCalendar /></button>
                <input type="text" placeholder="Envie uma mensagem..." value={newMessage} onChange={e => { setNewMessage(e.target.value); handleTyping(usuarioLogadoId); }} />
                <button type="submit" className="btn-send">➤</button>
              </form>
            </footer>
          </>
        ) : <div className="empty-state"><p>Selecione um match para conversar</p></div>}
      </main>

      {showScheduleModal && activeChat && <ScheduleModal activeChat={activeChat} conversationId={conversationId} onClose={() => setShowScheduleModal(false)} onSuccess={(payload) => { setShowScheduleModal(false); handleEventCreated(payload); }} />}
    </div>
  );
};
export default Chat;