import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { useChat } from "../../hooks/useChat";
import "./Chat.css";
import logoOn from "../../assets/images/LOGO.png";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref para a div que tem o scroll
  const previousScrollHeight = useRef(0); // Guarda a altura do scroll para a matemática

  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ID de usuário logado (Idealmente viria do seu AuthContext)
  const usuarioLogadoId = "id-do-usuario-atual";
  const modoDiscreto = true;

  // --- INTEGRAÇÃO DO HOOK USECHAT ---
  const {
    messages,
    sendMessage,
    isOtherUserTyping,
    handleTyping,
    loading: chatLoading,
    loadMore,
    hasNext,
  } = useChat(conversationId);

  // GATILHO DE SCROLL (TASK #48)
  const handleScroll = (e) => {
    // Se o scroll chegou no topo (0) e temos mais mensagens para carregar
    if (e.target.scrollTop === 0 && hasNext && !chatLoading) {
      // 1. Salva a altura total do scroll ANTES de renderizar as mensagens antigas
      previousScrollHeight.current = e.target.scrollHeight;
      loadMore();
    }
  };

  // MANTÉM A POSIÇÃO DO SCROLL (TASK #48)
  useLayoutEffect(() => {
    // Se temos uma altura guardada, significa que acabámos de carregar mensagens antigas
    if (chatContainerRef.current && previousScrollHeight.current > 0) {
      const container = chatContainerRef.current;
      // 2. A nova altura menos a altura antiga dá a diferença exata. 
      // Ajustamos o scrollTop para essa diferença, anulando o "salto".
      container.scrollTop = container.scrollHeight - previousScrollHeight.current;
      
      // 3. Resetamos a variável para os próximos scrolls
      previousScrollHeight.current = 0; 
    }
  }, [messages]);

  // SCROLL AUTOMÁTICO PARA BAIXO APENAS EM MENSAGENS NOVAS
  useEffect(() => {
    // Só fazemos scroll automático para o fundo se NÃO estivermos a carregar histórico
    if (previousScrollHeight.current === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOtherUserTyping]);

  // BUSCA LISTA DE CONVERSAS (SIDEBAR)
  useEffect(() => {
    const fetchConversas = () => {
      setLoading(true);
      const savedMatches = localStorage.getItem("openest_matches");

      if (savedMatches) {
        const matches = JSON.parse(savedMatches);
        const mappedConversations = matches.map((match) => ({
          ...match,
          timestamp: "Agora",
          unreadCount: 0,
        }));
        setConversations(mappedConversations);
      }
      setLoading(false);
    };

    fetchConversas();
  }, []);

  // ENVIO DE MENSAGEM
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    sendMessage(newMessage, usuarioLogadoId);
    setNewMessage("");
  };

  const activeChat = conversations.find(
    (c) => String(c.id) === String(conversationId),
  );

  return (
    <div className="figma-container">
      <aside className="figma-sidebar">
        <header className="sidebar-top">
          <h2 className="brand-title">Openest</h2>
          <button className="icon-back" onClick={() => navigate("/discovery")}>
            ←
          </button>
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
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conv-card ${conversationId === String(conv.id) ? "active" : ""}`}
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
                    {isOtherUserTyping && conversationId === String(conv.id) ? (
                      <span className="typing-small">Digitando...</span>
                    ) : messages.length > 0 &&
                      conversationId === String(conv.id) ? (
                      modoDiscreto ? (
                        "Nova mensagem" 
                      ) : (
                        messages[messages.length - 1].content
                      ) 
                    ) : (
                      "Clique para conversar"
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches-msg">
              Nenhuma conversa ativa. Vá para a Discovery dar matches!
            </div>
          )}
        </div>
      </aside>

      <main className="figma-chat-main">
        {activeChat ? (
          <>
            <header className="chat-area-header">
              <img
                src={activeChat.img}
                alt={activeChat.name}
                className="header-avatar"
              />
              <div className="header-info">
                <h4>{modoDiscreto ? "Usuário" : activeChat.name}</h4>

                {isOtherUserTyping && (
                  <span className="typing-header">digitando...</span>
                )}
              </div>
            </header>

            {/* ADICIONADA A REF DO CONTAINER AQUI */}
            <div className="chat-scroll-area" onScroll={handleScroll} ref={chatContainerRef}>
              
              {/* TASK #48: Mensagem de Fim de Histórico */}
              {!hasNext && messages.length > 0 && (
                <div style={{ textAlign: "center", padding: "15px 10px", color: "#888", fontSize: "12px" }}>
                  Não há mais mensagens
                </div>
              )}

              {/* TASK #48: Loading visível */}
              {chatLoading && (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  <Loading />
                </div>
              )}

              <img src={logoOn} alt="Watermark" className="on-watermark-img" />

              {messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`msg-wrapper ${msg.sender_id === usuarioLogadoId ? "me" : "other"}`}
                >
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
                <button type="button" className="btn-plus">
                  +
                </button>
                <input
                  type="text"
                  placeholder="Envie uma mensagem..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping(usuarioLogadoId);
                  }}
                />
                <button type="submit" className="btn-send">
                  ➤
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="empty-state">
            <img
              src={logoOn}
              alt="Watermark"
              className="on-watermark-img"
              style={{ opacity: 0.05 }}
            />
            <p>Selecione um match para conversar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;