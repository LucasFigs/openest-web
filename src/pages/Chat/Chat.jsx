import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading'; 
import { useChat } from '../../hooks/useChat'; 
import './Chat.css';
import logoOn from '../../assets/images/LOGO.png';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // ID de usuário logado (Idealmente viria do seu AuthContext)
  const usuarioLogadoId = "id-do-usuario-atual"; 

  // --- INTEGRAÇÃO DO HOOK USECHAT (TASKS #62, #63, #64) ---
  const { 
    messages, 
    sendMessage, 
    isOtherUserTyping, 
    handleTyping,
    loading: chatLoading,
    loadMore,
    hasNext 
  } = useChat(conversationId);

  // GATILHO DE SCROLL (TASK #62)
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasNext && !chatLoading) {
      loadMore();
    }
  };

  // BUSCA LISTA DE CONVERSAS (SIDEBAR)
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

  // SCROLL AUTOMÁTICO PARA BAIXO
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  // ENVIO DE MENSAGEM
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

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
                {isOtherUserTyping && (
                  <span className="typing-header">digitando...</span>
                )}
              </div>
            </header>

            <div className="chat-scroll-area" onScroll={handleScroll}>
              {chatLoading && (
                <div style={{ textAlign: 'center', padding: '10px' }}>
                  <Loading />
                </div>
              )}

              <img src={logoOn} alt="Watermark" className="on-watermark-img" />

              {messages.map((msg, index) => (
                <div key={msg.id || index} className={`msg-wrapper ${msg.sender_id === usuarioLogadoId ? 'me' : 'other'}`}>
                  <div className="msg-bubble">{msg.content}</div>
                </div>
              ))}

              {isOtherUserTyping && (
                <div className="msg-wrapper other">
                  <div className="msg-bubble typing-dots">...</div>
                </div>
              )}

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
                    handleTyping(usuarioLogadoId);
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