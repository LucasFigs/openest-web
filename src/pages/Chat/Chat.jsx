import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Chat.css';
import logoOn from '../../assets/images/LOGO.png';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [matches, setMatches] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMatches = localStorage.getItem('openest_matches');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    }
  }, []);

  const activeChat = matches.find(c => c.id === Number(conversationId) || c.id === conversationId);

  useEffect(() => {
    if (conversationId) {
      const saved = localStorage.getItem(`openest_chat_${conversationId}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
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
            <input type="text" placeholder="Pesquisar matches..." />
          </div>
        </div>

        <div className="conversations-list">
          {matches.length > 0 ? (
            matches.map(conv => (
              <div 
                key={conv.id} 
                className={`conv-card ${conversationId == conv.id ? 'active' : ''}`}
                onClick={() => navigate(`/chat/${conv.id}`)}
              >
                <img src={conv.img} alt={conv.name} className="avatar-img" />
                <div className="conv-info">
                  <h4>{conv.name}</h4>
                  <p>{messages.length > 0 && conversationId == conv.id ? messages[messages.length-1].text : 'Clique para conversar'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches-msg">Nenhum match encontrado ainda.</div>
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
             <img src={logoOn} alt="Watermark" className="on-watermagitrk-img" style={{opacity: 0.05}} />
             <p>Selecione um match na lateral para conversar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;