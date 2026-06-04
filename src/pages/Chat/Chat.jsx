import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { useChat } from "../../hooks/useChat";
import "./Chat.css";
import logoOn from "../../assets/images/LOGO.png";
import api from "../../services/api";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedUser, setLoggedUser] = useState(null);
  const usuarioLogadoId = loggedUser?.id || "";
  
  const [menuAberto, setMenuAberto] = useState(null);
  const [mensagemRespondida, setMensagemRespondida] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [menuAnexos, setMenuAnexos] = useState(false);

  const modoDiscreto = true;

  const {
    messages,
    sendMessage,
    sendImage, // 🔥 PUXAMOS A FUNÇÃO DE IMAGEM
    deleteMessage, 
    hideMessageForMe, 
    isOtherUserTyping,
    handleTyping,
    loading: chatLoading,
    loadMore,
    hasNext,
  } = useChat(conversationId, usuarioLogadoId); 

  const handleLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `📍 Localização partilhada:\nhttp://maps.google.com/maps?q=${latitude},${longitude}`;
        
        sendMessage(mapsLink, usuarioLogadoId, mensagemRespondida);
        setMensagemRespondida(null);
        setMenuAnexos(false);
      }, () => {
        alert("Não foi possível obter a sua localização. Verifique as permissões do navegador.");
      });
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click(); 
    setMenuAnexos(false);
  };

  const handleImageSelected = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 🔥 CHAMA A FUNÇÃO QUE FAZ O UPLOAD PRO CLOUDINARY
      sendImage(file, usuarioLogadoId);
    }
  };

  const handleGifClick = () => {
    alert("A gaveta de GIFs será implementada em breve!");
    setMenuAnexos(false);
  };

  const handleCopiar = (texto) => {
    navigator.clipboard.writeText(texto);
    setMenuAberto(null); 
  };

  const handleResponder = (msg) => {
    setMensagemRespondida(msg); 
    setMenuAberto(null);
  };

  const handleApagarParaTodos = (msgId) => {
    deleteMessage(msgId); 
    setMenuAberto(null);
  };

  const handleApagarParaMim = (msgId) => {
    hideMessageForMe(msgId);
    setMenuAberto(null);
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasNext && !chatLoading) {
      previousScrollHeight.current = e.target.scrollHeight;
      loadMore();
    }
  };

  useLayoutEffect(() => {
    if (chatContainerRef.current && previousScrollHeight.current > 0) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight - previousScrollHeight.current;
      previousScrollHeight.current = 0;
    }
  }, [messages]);

  useEffect(() => {
    if (previousScrollHeight.current === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOtherUserTyping]);

  useEffect(() => {
    api.get("/users/perfil")
      .then(({ data }) => setLoggedUser(data))
      .catch((err) => console.error("Erro ao buscar perfil:", err));
  }, []);

  useEffect(() => {
    const fetchConversas = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/conversas");
        setConversations(data);
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversas();
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    sendMessage(newMessage, usuarioLogadoId, mensagemRespondida);
    setNewMessage("");
    setMensagemRespondida(null); 
  };

  const activeChat = conversations.find((c) => String(c.id) === String(conversationId));

  const filteredConversations = conversations.filter((conv) => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="figma-container">
      <aside className="figma-sidebar">
        <header className="sidebar-top">
          <h2 className="brand-title">Openest</h2>
          <button className="icon-back" onClick={() => navigate("/discovery")}>←</button>
        </header>

        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Pesquisar conversas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="conversations-list">
          {loading ? (
            <div className="loading-sidebar-wrapper"><Loading /></div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div key={conv.id} className={`conv-card ${conversationId === String(conv.id) ? "active" : ""}`} onClick={() => navigate(`/chat/${conv.id}`)}>
                <div className="avatar-container">
                  <img src={conv.img} alt={conv.name} className="avatar-img" />
                  {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                </div>
                <div className="conv-info">
                  <div className="conv-header-row">
                    <h4>{conv.name}</h4>
                    <span className="conv-time">{conv.timestamp}</span>
                  </div>
                  <p className="last-msg-text">
                    {isOtherUserTyping && conversationId === String(conv.id) ? (
                      <span className="typing-small">Digitando...</span>
                    ) : messages.length > 0 && conversationId === String(conv.id) ? (
                      modoDiscreto ? "Nova mensagem" : messages[messages.length - 1].content
                    ) : "Clique para conversar"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches-msg">
              {searchQuery ? "Nenhuma conversa encontrada." : "Nenhuma conversa ativa. Vá para a Discovery dar matches!"}
            </div>
          )}
        </div>
      </aside>

      <main className="figma-chat-main">
        {activeChat ? (
          <>
            <header className="chat-area-header">
              <img src={activeChat.img} alt={activeChat.name} className="header-avatar" />
              <div className="header-info">
                <h4>{modoDiscreto ? "Usuário" : activeChat.name}</h4>
                {isOtherUserTyping && <span className="typing-header">digitando...</span>}
              </div>
            </header>

            <div className="chat-scroll-area" onScroll={handleScroll} ref={chatContainerRef}>
              {!hasNext && messages.length > 0 && (
                <div style={{ textAlign: "center", padding: "15px 10px", color: "#888", fontSize: "12px" }}>Não há mais mensagens</div>
              )}
              {chatLoading && <div style={{ textAlign: "center", padding: "10px" }}><Loading /></div>}

              <img src={logoOn} alt="Watermark" className="on-watermark-img" />

              {messages.map((msg, index) => {
                const foiApagada = msg.is_deleted || msg.content === "🚫 Mensagem apagada";
                
                // 🔥 DETECTA SE O TEXTO É UMA URL DE IMAGEM
                const isImage = !foiApagada && (msg.content.includes('res.cloudinary.com') || msg.content.startsWith('blob:'));

                return (
                  <div 
                    key={msg.id || index} 
                    className={`msg-wrapper ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`} 
                    style={{ position: "relative", zIndex: menuAberto === msg.id ? 100 : 1 }}
                  >
                    <div className={`msg-group ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`}>
                      
                      <div className={`msg-bubble ${foiApagada ? 'deleted' : ''}`}>
                        {(msg.reply_to_content && !foiApagada) && (
                          <div className="quoted-msg">
                            <strong>{msg.reply_to_sender === "Você" ? "Você" : activeChat?.name}</strong>
                            <p>{msg.reply_to_content}</p>
                          </div>
                        )}
                        
                        {/* 🔥 SE FOR IMAGEM, DESENHA O <img>, SENÃO, DESENHA O TEXTO NORMAL */}
                        {foiApagada ? (
                          <span style={{ fontStyle: 'italic' }}>{msg.content}</span>
                        ) : isImage ? (
                          <img 
                            src={msg.content} 
                            alt="Upload do chat" 
                            style={{ maxWidth: "250px", borderRadius: "8px", cursor: "pointer" }} 
                            onClick={() => window.open(msg.content, "_blank")} // Abre a foto maior em nova aba
                          />
                        ) : (
                          msg.content
                        )}
                      </div>

                      <button className="btn-msg-options" onClick={() => setMenuAberto(menuAberto === msg.id ? null : msg.id)}>⋮</button>
                    </div>

                    {menuAberto === msg.id && (
                      <div className={`options-dropdown ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`}>
                        
                        {!foiApagada && (
                          <>
                            {/* Desabilita o copiar se for uma foto, para evitar erros */}
                            {!isImage && <button onClick={() => handleResponder(msg)}>↩️ Responder</button>}
                            {!isImage && <button onClick={() => handleCopiar(msg.content)}>📋 Copiar</button>}
                          </>
                        )}

                        <button className="delete-btn" onClick={() => handleApagarParaMim(msg.id)}>
                          🗑️ Apagar p/ mim
                        </button>

                        {(msg.sender_id === usuarioLogadoId && !foiApagada) && (
                          <button className="delete-btn" onClick={() => handleApagarParaTodos(msg.id)}>
                            🗑️ Apagar p/ todos
                          </button>
                        )}

                      </div>
                    )}
                  </div>
                );
              })}

              {isOtherUserTyping && (
                <div className="msg-wrapper other">
                  <div className="msg-bubble typing-dots">...</div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <footer className="chat-input-footer" style={{ flexDirection: 'column' }}>
              
              {menuAnexos && (
                <div className="attachment-menu">
                  <button type="button" onClick={handleImageClick}>📸 Enviar Foto</button>
                  <button type="button" onClick={handleLocation}>📍 Partilhar Localização</button>
                  <button type="button" onClick={handleGifClick}>🎬 Enviar GIF</button>
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                accept="image/*" 
                onChange={handleImageSelected} 
              />

              {mensagemRespondida && (
                <div className="reply-banner">
                  <div className="reply-content">
                    <strong>{mensagemRespondida.sender_id === usuarioLogadoId ? "Você" : activeChat?.name}</strong>
                    <p>{mensagemRespondida.content}</p>
                  </div>
                  <button type="button" className="close-reply" onClick={() => setMensagemRespondida(null)}>✖</button>
                </div>
              )}

              <form className="input-form" onSubmit={handleSend} style={{ width: '100%', marginTop: mensagemRespondida ? '0' : 'auto' }}>
                <button type="button" className="btn-plus" onClick={() => setMenuAnexos(!menuAnexos)}>+</button>
                <input type="text" placeholder="Envie uma mensagem..." value={newMessage} onChange={(e) => { setNewMessage(e.target.value); handleTyping(usuarioLogadoId); }} />
                <button type="submit" className="btn-send">➤</button>
              </form>
            </footer>
          </>
        ) : (
          <div className="empty-state">
            <img src={logoOn} alt="Watermark" className="on-watermark-img" style={{ opacity: 0.05 }} />
            <p>Selecione um match para conversar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;