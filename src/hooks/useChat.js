import { useEffect, useState, useCallback } from 'react';
import socket from '../services/socket';
import api from '../services/api'; // Importe seu serviço de API (axios)

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // --- NOVOS ESTADOS PARA PAGINAÇÃO (TASK #62) ---
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  // --- FUNÇÃO PARA BUSCAR HISTÓRICO NO POSTGRES ---
  const fetchMessages = useCallback(async (pageNumber) => {
    if (loading || (!hasNext && pageNumber > 1)) return;

    setLoading(true);
    try {
      // Faz a chamada para o endpoint paginado
      const response = await api.get(`/conversas/${conversationId}/mensagens`, {
        params: { page: pageNumber, limit: 20 }
      });

      const { messages: newMessages, pagination } = response.data;

      // Se for a página 1, substitui. Se for scroll (page > 1), anexa ao início da lista
      setMessages((prev) => (pageNumber === 1 ? newMessages : [...newMessages, ...prev]));
      
      // Atualiza metadados de paginação
      setHasNext(pagination.hasNext);
    } catch (error) {
      console.error("Erro ao carregar histórico de mensagens:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, hasNext, loading]);

  // --- FUNÇÃO PARA DISPARAR CARREGAMENTO DE MAIS MENSAGENS ---
  const loadMore = () => {
    if (hasNext && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  useEffect(() => {
    // Busca a primeira página de mensagens ao abrir a conversa
    if (conversationId) {
      setMessages([]); // Limpa mensagens anteriores ao mudar de conversa
      setPage(1);
      setHasNext(true);
      fetchMessages(1);
      
      // 1. Entra na sala específica da conversa (Sua lógica original)
      socket.emit('join_conversation', conversationId);
    }

    // 2. Escuta quando a conexão é estabelecida (Sua lógica original)
    function onConnect() {
      setIsConnected(true);
    }

    // 3. Escuta quando a conexão cai (Sua lógica original)
    function onDisconnect() {
      setIsConnected(false);
    }

    // 4. Escuta novas mensagens em tempo real (Sua lógica original)
    function onNewMessage(message) {
      setMessages((prev) => [...prev, message]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);

    // Limpeza ao sair da tela ou mudar de conversa (Sua lógica original)
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId, fetchMessages]); // Adicionado fetchMessages como dependência

  // Função para enviar mensagem via Socket (Sua lógica original)
  const sendMessage = (content, senderId) => {
    const messageData = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date()
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData]);
  };

  // Retorna os novos controles para o seu componente de chat
  return { 
    messages, 
    isConnected, 
    sendMessage, 
    setMessages,
    loading,      // Novo: Indica se está carregando histórico
    loadMore,     // Novo: Função para chamar ao rolar para cima
    hasNext       // Novo: Indica se existem mais mensagens no Postgres
  };
};