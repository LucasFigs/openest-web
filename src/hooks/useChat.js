import { useEffect, useState, useCallback, useRef } from 'react';
import socket from '../services/socket';
import api from '../services/api'; 

// 🔥 AGORA O HOOK RECEBE O 'loggedUserId'
export const useChat = (conversationId, loggedUserId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const hasNextRef = useRef(true);

  // 🔥 LÊ DA MEMÓRIA BASEADO NO ID DO USUÁRIO LOGADO!
  const getHiddenMessages = useCallback(() => {
    if (!loggedUserId) return [];
    return JSON.parse(localStorage.getItem(`openest_hidden_msgs_${loggedUserId}`)) || [];
  }, [loggedUserId]);

  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  const fetchMessages = useCallback(async (pageNumber) => {
    // 🔥 Só busca as mensagens se já soubermos quem é o usuário
    if (!conversationId || isNaN(conversationId) || !loggedUserId) return;
    if (loadingRef.current || (!hasNextRef.current && pageNumber > 1)) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const response = await api.get(`/${conversationId}/mensagens`, {
        params: { page: pageNumber, limit: 20 }
      });

      const { messages: newMessages, pagination } = response.data;
      
      const hiddenIds = getHiddenMessages();
      const visiveis = newMessages.filter(m => !hiddenIds.includes(m.id));
      
      const mensagensOrdenadas = visiveis.reverse();

      setMessages((prev) => (pageNumber === 1 ? mensagensOrdenadas : [...mensagensOrdenadas, ...prev]));
      setHasNext(pagination.hasNext);
    } catch (error) {
      console.error("Erro ao carregar histórico de mensagens:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false); 
    }
  }, [conversationId, loggedUserId, getHiddenMessages]); 

  const loadMore = () => {
    if (hasNextRef.current && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const handleTyping = (userId) => {
    if (!conversationId || isNaN(conversationId)) return;
    socket.emit('typing_start', { conversation_id: conversationId, user_id: userId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversation_id: conversationId, user_id: userId });
    }, 3000);
  };

  useEffect(() => {
    if (!conversationId || isNaN(conversationId) || !loggedUserId) return;

    setMessages([]); 
    setPage(1);
    setHasNext(true);
    hasNextRef.current = true; 
    fetchMessages(1);
    socket.emit('join_conversation', conversationId);

    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }
    function onNewMessage(message) { 
      const hiddenIds = getHiddenMessages();
      if (hiddenIds.includes(message.id)) return;

      setMessages((prev) => {
        const jaExiste = prev.some(m => m.id === message.id || (m.content === message.content && m.sender_id === message.sender_id && m.id > Date.now() - 10000));
        if (jaExiste) return prev;
        return [...prev, message];
      }); 
    }
    function onUserTyping({ is_typing }) { setIsOtherUserTyping(is_typing); }
    
    function onMessageDeleted(deletedMsgId) {
      setMessages((prev) => prev.map(m => 
        m.id === deletedMsgId 
          ? { ...m, content: "🚫 Mensagem apagada", is_deleted: true } 
          : m
      ));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping); 
    socket.on('message_deleted', onMessageDeleted); 

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping); 
      socket.off('message_deleted', onMessageDeleted); 
      
      socket.emit('leave_conversation', conversationId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, loggedUserId, fetchMessages, getHiddenMessages]);

  const sendMessage = async (content, senderId, replyToMsg = null) => {
    if (!conversationId || isNaN(conversationId)) return;

    socket.emit('typing_stop', { conversation_id: conversationId, user_id: senderId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const fakeId = Date.now();

    const tempMessage = {
      id: fakeId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      reply_to_content: replyToMsg ? replyToMsg.content : null,
      reply_to_sender: replyToMsg ? (replyToMsg.sender_id === senderId ? "Você" : "Outro") : null,
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await api.post('/mensagens', {
        conversation_id: conversationId,
        content: content,
        reply_to_id: replyToMsg ? replyToMsg.id : null 
      });

      setMessages((prev) => prev.map(m => 
        m.id === fakeId ? { ...m, id: response.data.id } : m
      ));

    } catch (error) {
      console.error("Erro ao salvar a mensagem no banco:", error);
    }
  };

  const deleteMessage = async (msgId) => {
    setMessages((prev) => prev.map(m => 
      m.id === msgId 
        ? { ...m, content: "🚫 Mensagem apagada", is_deleted: true } 
        : m
    ));
    
    try {
      await api.delete(`/mensagens/${msgId}`);
    } catch (error) {
      console.error("Erro ao deletar mensagem no banco", error);
    }
  };

  const hideMessageForMe = (msgId) => {
    if (!loggedUserId) return;
    
    // 🔥 SALVA NO NAVEGADOR USANDO O ID DO USUÁRIO
    const hiddenIds = getHiddenMessages();
    if (!hiddenIds.includes(msgId)) {
      hiddenIds.push(msgId);
      localStorage.setItem(`openest_hidden_msgs_${loggedUserId}`, JSON.stringify(hiddenIds));
    }
    
    setMessages((prev) => prev.filter(m => m.id !== msgId));
  };

  return { messages, isConnected, sendMessage, deleteMessage, hideMessageForMe, setMessages, loading, loadMore, hasNext, isOtherUserTyping, handleTyping };
};