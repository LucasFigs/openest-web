import { useEffect, useState, useCallback, useRef } from "react";
import socket from "../services/socket";
import api from "../services/api";

export const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const hasNextRef = useRef(true);

  useEffect(() => {
    hasNextRef.current = hasNext;
  }, [hasNext]);

  const fetchMessages = useCallback(
    async (pageNumber) => {
      // 🔥 ESCUDO: Só prossegue se existir um ID e se ele for um número
      if (!conversationId || isNaN(conversationId)) return;

      if (loadingRef.current || (!hasNextRef.current && pageNumber > 1)) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await api.get(`/${conversationId}/mensagens`, {
          params: { page: pageNumber, limit: 20 },
        });
        const { messages: newMessages, pagination } = response.data;
        const mensagensOrdenadas = newMessages.reverse();
        setMessages((prev) =>
          pageNumber === 1
            ? mensagensOrdenadas
            : [...mensagensOrdenadas, ...prev],
        );
        setHasNext(pagination.hasNext);
      } catch (error) {
        console.error("Erro ao carregar histórico de mensagens:", error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [conversationId],
  );

  const loadMore = () => {
    if (hasNextRef.current && !loadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
    }
  };

  const handleTyping = (userId) => {
    if (!conversationId || isNaN(conversationId)) return;

    socket.emit("typing_start", {
      conversation_id: conversationId,
      user_id: userId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", {
        conversation_id: conversationId,
        user_id: userId,
      });
    }, 3000);
  };

  useEffect(() => {
    // 🔥 ESCUDO: Só conecta na sala se for uma conversa válida
    if (conversationId && !isNaN(conversationId)) {
      setMessages([]);
      setPage(1);
      setHasNext(true);
      hasNextRef.current = true;
      fetchMessages(1);

      socket.emit("join_conversation", conversationId);
    }

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    // 🔥 ANTI-DUPLICAÇÃO: Evita que a mensagem que você enviou apareça 2x
    function onNewMessage(message) {
      setMessages((prev) => {
        const jaExiste = prev.some(
          (m) =>
            m.id === message.id ||
            (m.content === message.content &&
              m.sender_id === message.sender_id &&
              m.id > Date.now() - 10000),
        );
        if (jaExiste) return prev;
        return [...prev, message];
      });
    }

    function onUserTyping({ is_typing }) {
      setIsOtherUserTyping(is_typing);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);

      if (conversationId && !isNaN(conversationId)) {
        socket.emit("leave_conversation", conversationId);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (content, senderId) => {
    if (!conversationId || isNaN(conversationId)) return;

    socket.emit("typing_stop", {
      conversation_id: conversationId,
      user_id: senderId,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // 1. OTIMISTA: Coloca a mensagem na tela na mesma hora
    const tempMessage = {
      id: Date.now(), // ID provisório
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      // 2. SALVAMENTO REAL: Envia para o backend via HTTP para gravar no Postgres!
      await api.post("/mensagens", {
        conversation_id: conversationId,
        content: content,
      });
    } catch (error) {
      console.error("Erro ao salvar a mensagem no banco:", error);
    }
  };

  // 🔥 ISSO AQUI ESTAVA FALTANDO! Devolve as variáveis para a tela do Chat:
  return {
    messages,
    isConnected,
    sendMessage,
    setMessages,
    loading,
    loadMore,
    hasNext,
    isOtherUserTyping,
    handleTyping,
  };
};
