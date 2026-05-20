import { useEffect, useState, useCallback, useRef } from 'react';
import socket from '../services/socket';
import api from '../services/api'; 

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef(null);

  // --- O SEGREDO PARA QUEBRAR O LOOP INFINITO ---
  // Usamos refs para ler os valores dentro do fetchMessages sem causar re-renders
  const loadingRef = useRef(false);
  const hasNextRef = useRef(true);

  // Mantém as refs sincronizadas com os estados visuais
  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  const fetchMessages = useCallback(async (pageNumber) => {
    // Lemos das Refs em vez do State para não colocar na lista de dependências
    if (loadingRef.current || (!hasNextRef.current && pageNumber > 1)) return;

    loadingRef.current = true;
    setLoading(true); // Atualiza a tela

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
      loadingRef.current = false;
      setLoading(false); // Libera a tela
    }
  }, [conversationId]); // <-- O LOOP MORRE AQUI! Sem loading/hasNext nas dependências.

  const loadMore = () => {
    if (hasNextRef.current && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const handleTyping = (userId) => {
    socket.emit('typing_start', { conversation_id: conversationId, user_id: userId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversation_id: conversationId, user_id: userId });
    }, 3000);
  };

  useEffect(() => {
    if (conversationId) {
      setMessages([]); 
      setPage(1);
      setHasNext(true);
      hasNextRef.current = true; // Reseta a ref também
      fetchMessages(1);
      
      socket.emit('join_conversation', conversationId);
    }

    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }
    function onNewMessage(message) { setMessages((prev) => [...prev, message]); }
    function onUserTyping({ is_typing }) { setIsOtherUserTyping(is_typing); }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping); 

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping); 
      
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
    isOtherUserTyping, 
    handleTyping       
  };
};