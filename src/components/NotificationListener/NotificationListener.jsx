import { Heart } from 'lucide-react';
import './NotificationListener.css';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import socket from '../../services/socket';

// Front-1 — Banner/toast de notificação estilo Instagram para o WEB.
// Escuta os eventos de socket `notification` (nova mensagem) e `new_match`
// emitidos pela openest-api e mostra um toast flutuante no topo com a foto
// (Cloudinary) do remetente, nome, prévia da mensagem, auto-fechamento em 4s e
// clique abrindo a conversa. Começa oculto: só surge com um evento real.
const AUTO_DISMISS_MS = 4000;

const avatarFallback = (name = 'Usuário') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7B1FA2&color=fff&size=120`;

export default function NotificationListener() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    function showToast({ name, message, avatar, conversationId, isMatch }) {
      // Não notifica a conversa que já está aberta na tela.
      if (conversationId != null && window.location.pathname.includes(`/chat/${conversationId}`)) return;

      toast.custom(
        (t) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              toast.dismiss(t.id);
              if (conversationId != null) navigateRef.current(`/chat/${conversationId}`);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && conversationId != null) {
                toast.dismiss(t.id);
                navigateRef.current(`/chat/${conversationId}`);
              }
            }}
            className={`openest-toast ${t.visible ? 'is-in' : 'is-out'}`}
          >
            <div className="openest-toast__avatar">
              <img
                src={avatar || avatarFallback(name)}
                alt=""
                onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback(name); }}
              />
              {isMatch && (
                <span className="openest-toast__match" aria-hidden="true">
                  <Heart size={10} fill="currentColor" />
                </span>
              )}
            </div>
            <div className="openest-toast__texts">
              <div className="openest-toast__name">{name}</div>
              <div className="openest-toast__message">{message}</div>
            </div>
          </div>
        ),
        { duration: AUTO_DISMISS_MS }
      );
    }

    function onNotification(payload = {}) {
      showToast({
        name: payload.sender_name || payload.title || 'Nova mensagem',
        message: payload.content || payload.body || 'Você recebeu uma nova mensagem',
        avatar: payload.sender_avatar || null,
        conversationId: payload.conversation_id ?? null,
      });
    }

    function onNewMatch(payload = {}) {
      showToast({
        name: payload.other_user_name || 'Novo match',
        message: 'Vocês deram match! Diga oi.',
        avatar: payload.other_user_avatar || null,
        conversationId: payload.conversation_id ?? null,
        isMatch: true,
      });
    }

    // ACK GLOBAL DE ENTREGA: vale em qualquer rota do sistema, mesmo que o
    // usuário não esteja no chat. Assim que o socket recebe a mensagem, ele
    // confirma ao servidor — é o que faz o 2º check cinza aparecer na hora
    // do outro lado, sem refresh.
    function onNewMessage(message = {}) {
      if (!message.conversation_id) return;
      socket.emit('message_delivered_ack', { conversation_id: message.conversation_id });
    }

    socket.on('notification', onNotification);
    socket.on('new_match', onNewMatch);
    socket.on('new_message', onNewMessage);
    return () => {
      socket.off('notification', onNotification);
      socket.off('new_match', onNewMatch);
      socket.off('new_message', onNewMessage);
    };
  }, []);

  return null;
}
