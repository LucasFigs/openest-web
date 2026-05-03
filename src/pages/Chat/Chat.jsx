import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading/Loading'; 
import './Chat.css';
import logoOn from '../../assets/images/LOGO.png';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  // 1. BUSCA DINÂMICA: Puxa apenas os matches que você fez na Discovery
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

  // 2. BUSCAR MENSAGENS DA CONVERSA SELECIONADA
  useEffect(() => {
    if (conversationId) {
      const saved = localStorage.getItem(`openest_chat_${conversationId}`);
      setMessages(saved ? JSON.parse(saved) : []);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`openest_chat_${conversationId}`, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const msg = {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, msg]);
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
            /* Substituído o texto genérico pelo seu novo Spinner */
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
                    {messages.length > 0 && conversationId === String(conv.id) 
                      ? messages[messages.length - 1].text 
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
              <h4>{activeChat.name}</h4>
            </header>

            <div className="chat-scroll-area">
              <img src={logoOn} alt="Watermark" className="on-watermark-img" />
              {messages.map(msg => (
                <div key={msg.id} className={`msg-wrapper ${msg.sender}`}>
                  <div className="msg-bubble">{msg.text}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-input-footer">
              <form className="input-form" onSubmit={handleSend}>
                <button type="button" className="btn-plus">+</button>
                <input 
                  type="text" 
                  placeholder="Envie uma mensagem..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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