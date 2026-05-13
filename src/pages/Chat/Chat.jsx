import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading'; 
import { useChat } from '../../hooks/useChat'; // Importando seu novo hook
import './Chat.css';
import logoOn from '../../assets/images/LOGO.png';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // --- INTEGRAÇÃO DO HOOK USECHAT (TASKS #62, #63, #64) ---
  const { 
    messages, 
    sendMessage, 
    isOtherUserTyping, // Estado para o "Digitando..."
    handleTyping,      // Função para avisar o outro usuário
    loading: chatLoading 
  } = useChat(conversationId);

  const messagesEndRef = useRef(null);

  // Simulando um ID de usuário logado (Idealmente viria do seu AuthContext)
  const usuarioLogadoId = "id-do-usuario-atual"; 

  useEffect(() => {
    const fetchConversas = () => {
      setLoading(true);
      const savedMatches = localStorage.getItem('openest_matches');
      
      if (savedMatches) {
        const matches = JSON.parse(savedMatches);
        const mappedConversations = matches.map(match => ({
          ...match,
          timestamp: 'Agora', 
          unreadCount: 0      
        }));
        setConversations(mappedConversations);
      }
      setLoading(false);
    };

    fetchConversas();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]); // Rola para baixo também se alguém começar a digitar

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    // Envia via Socket (Task #27/63)
    sendMessage(newMessage, usuarioLogadoId);
    setNewMessage('');
  };

  const activeChat = conversations.find(c => String(c.id) === String(conversationId));

  return (
    <div className="figma-container">
      <aside className="figma-sidebar">
        <header className="sidebar-top">
          <h2 className="brand-title">Openest</h2>
          <button className="icon-back" onClick={() => navigate('/discovery')}>←</button>
        </header>

        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Pesquisar conversas..." />
          </div>
        </div>

        <div className="conversations-list">
          {loading ? (
            <div className="loading-sidebar-wrapper">
               <Loading />
            </div>
          ) : conversations.length > 0 ? (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                className={`conv-card ${conversationId === String(conv.id) ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <div className="avatar-container">
                  <img src={conv.img} alt={conv.name} className="avatar-img" />
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="conv-info">
                  <div className="conv-header-row">
                    <h4>{conv.name}</h4>
                    <span className="conv-time">{conv.timestamp}</span>
                  </div>
                  <p className="last-msg-text">
                    {/* Exibe indicador de digitação na lista lateral também, se desejar */}
                    {isOtherUserTyping && conversationId === String(conv.id) 
                      ? <span className="typing-small">Digitando...</span>
                      : messages.length > 0 && conversationId === String(conv.id) 
                        ? messages[messages.length - 1].content 
                        : 'Clique para conversar'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches-msg">Nenhuma conversa ativa. Vá para a Discovery dar matches!</div>
          )}
        </div>
      </aside>

      <main className="figma-chat-main">
        {activeChat ? (
          <>
            <header className="chat-area-header">
              <img src={activeChat.img} alt={activeChat.name} className="header-avatar" />
              <div className="header-info">
                <h4>{activeChat.name}</h4>
                {/* TASK #64: Indicador de digitação no header */}
                {isOtherUserTyping && (
                  <span className="typing-header">digitando...</span>
                )}
              </div>
            </header>

          <div className="chat-scroll-area">
  {/* 1. SE ESTIVER CARREGANDO O HISTÓRICO, MOSTRA O SPINNER */}
  {chatLoading && (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <Loading />
    </div>
  )}

  <img src={logoOn} alt="Watermark" className="on-watermark-img" />

  {/* 2. RENDERIZA AS MENSAGENS */}
  {messages.map((msg, index) => (
    <div key={msg.id || index} className={`msg-wrapper ${msg.sender_id === usuarioLogadoId ? 'me' : 'other'}`}>
      <div className="msg-bubble">{msg.content}</div>
    </div>
  ))}

  {/* 3. INDICADOR VISUAL DE DIGITAÇÃO (TASK #64) */}
  {isOtherUserTyping && (
    <div className="msg-wrapper other">
      <div className="msg-bubble typing-dots">...</div>
    </div>
  )}

  {/* 4. REFERÊNCIA PARA SCROLL AUTOMÁTICO */}
  <div ref={messagesEndRef} />
</div>

            <footer className="chat-input-footer">
              <form className="input-form" onSubmit={handleSend}>
                <button type="button" className="btn-plus">+</button>
                <input 
                  type="text" 
                  placeholder="Envie uma mensagem..." 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(usuarioLogadoId); // Dispara evento de digitação
                  }}
                />
                <button type="submit" className="btn-send">➤</button>
              </form>
            </footer>
          </>
        ) : (
          <div className="empty-state">
             <img src={logoOn} alt="Watermark" className="on-watermark-img" style={{opacity: 0.05}} />
             <p>Selecione um match para conversar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;