import { useEffect, useState } from 'react';
import socket from '../services/socket'; // Certifique-se de ter o service criado

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // 1. Entra na sala específica da conversa (Requisito Task #43)
    if (conversationId) {
      socket.emit('join_conversation', conversationId);
    }

    // 2. Escuta quando a conexão é estabelecida
    function onConnect() {
      setIsConnected(true);
    }

    // 3. Escuta quando a conexão cai
    function onDisconnect() {
      setIsConnected(false);
    }

    // 4. Escuta novas mensagens em tempo real
    function onNewMessage(message) {
      setMessages((prev) => [...prev, message]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);

    // Limpeza ao sair da tela ou mudar de conversa
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      if (conversationId) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId]);

  // Função para enviar mensagem via Socket
  const sendMessage = (content, senderId) => {
    const messageData = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date()
    };

    // Envia para o servidor
    socket.emit('send_message', messageData);
    
    // Adiciona localmente para feedback instantâneo
    setMessages((prev) => [...prev, messageData]);
  };

  return { messages, isConnected, sendMessage, setMessages };
};