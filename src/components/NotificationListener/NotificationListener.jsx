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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              width: 340,
              maxWidth: '90vw',
              padding: '12px 14px',
              borderRadius: 16,
              cursor: 'pointer',
              background: 'rgba(30, 20, 45, 0.97)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
              color: '#fff',
              animation: t.visible ? 'openest-slide-in 0.25s ease' : 'openest-slide-out 0.2s ease forwards',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={avatar || avatarFallback(name)}
                alt={name}
                onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback(name); }}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              {isMatch && (
                <span style={{ position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: '50%', background: '#E84683', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, border: '2px solid rgba(30,20,45,1)' }}>💜</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message}</div>
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
        message: 'Vocês deram match! Diga oi 💜',
        avatar: payload.other_user_avatar || null,
        conversationId: payload.conversation_id ?? null,
        isMatch: true,
      });
    }

    socket.on('notification', onNotification);
    socket.on('new_match', onNewMatch);
    return () => {
      socket.off('notification', onNotification);
      socket.off('new_match', onNewMatch);
    };
  }, []);

  return null;
}
