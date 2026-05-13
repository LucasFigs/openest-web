import { useEffect, useState, useCallback, useRef } from 'react'; // Adicionado useRef
import socket from '../services/socket';
import api from '../services/api'; 

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // --- NOVOS ESTADOS PARA PAGINAÇÃO (TASK #62) ---
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  // --- NOVO ESTADO PARA INDICADOR DE DIGITAÇÃO (TASK #64) ---
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

 const fetchMessages = useCallback(async (pageNumber) => {
  // Removido a checagem de 'loading' e 'hasNext' daqui para simplificar o useCallback
  setLoading(true);
  try {
    const response = await api.get(`/conversas/${conversationId}/mensagens`, {
      params: { page: pageNumber, limit: 20 }
    });

    const { messages: newMessages, pagination } = response.data;

    setMessages((prev) => (pageNumber === 1 ? newMessages : [...newMessages, ...prev]));
    setHasNext(pagination.hasNext);
  } catch (error) {
    console.error("Erro ao carregar histórico de mensagens:", error);
  } finally {
    setLoading(false);
  }
  // Mantenha APENAS o conversationId aqui para estabilizar a função
}, [conversationId]);

  // --- FUNÇÃO PARA DISPARAR CARREGAMENTO DE MAIS MENSAGENS ---
  const loadMore = () => {
    if (hasNext && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  // --- NOVA FUNÇÃO PARA NOTIFICAR QUE ESTÁ DIGITANDO (TASK #64) ---
  const handleTyping = (userId) => {
    // Avisa o backend que o usuário começou a digitar
    socket.emit('typing_start', { conversation_id: conversationId, user_id: userId });

    // Limpa o timeout anterior se o usuário continuar digitando
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Define um tempo de 3 segundos para avisar que parou de digitar por inatividade
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversation_id: conversationId, user_id: userId });
    }, 3000);
  };

  useEffect(() => {
    if (conversationId) {
      setMessages([]); 
      setPage(1);
      setHasNext(true);
      fetchMessages(1);
      
      socket.emit('join_conversation', conversationId);
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onNewMessage(message) {
      setMessages((prev) => [...prev, message]);
    }

    // --- ESCUTAR EVENTO DE DIGITAÇÃO (TASK #64) ---
    function onUserTyping({ is_typing }) {
      setIsOtherUserTyping(is_typing);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping); // Ouvindo o evento

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping); // Limpeza
      
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = (content, senderId) => {
    const messageData = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date()
    };

    // Ao enviar, forçamos o encerramento do status de digitando
    socket.emit('typing_stop', { conversation_id: conversationId, user_id: senderId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData]);
  };

  return { 
    messages, 
    isConnected, 
    sendMessage, 
    setMessages,
    loading,      
    loadMore,     
    hasNext,
    isOtherUserTyping, // Novo: Exiba "Digitando..." se for true
    handleTyping       // Novo: Chame esta função no onChange do seu Input
  };
};