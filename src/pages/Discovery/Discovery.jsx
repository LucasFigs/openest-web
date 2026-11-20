import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import './Discovery.css';

import api from '../../services/api';
import socket from '../../services/socket';
import Loading from '../../components/Loading/Loading';
import Filters from '../../components/Filters/Filters';
import MatchPopup from '../../components/MatchPopup/MatchPopup';
import ReportModal from '../../components/ReportModal/ReportModal';
import AppSidebar from '../../components/AppSidebar/AppSidebar';
import { BadgeCheck, Heart, RotateCcw, SlidersHorizontal, Sparkles, User, Users, X } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const cloudinaryUrl = (publicIdOrUrl, opts = {}) => {
  if (!publicIdOrUrl) return null;
  if (publicIdOrUrl.startsWith('http')) return publicIdOrUrl;
  const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!CLOUD) return null;
  const { w = 600, h = 800, crop = 'fill' } = opts;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_${w},h_${h},c_${crop},q_auto,f_auto/${publicIdOrUrl}`;
};

const avatarFallback = (name = 'Usuário') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=400`;

const normalizeProfile = (user) => {
  let images = [];
  // T021: a API devolve a galeria ordenada em `photos` (posição 0 = foto
  // principal). `fotos` continua como formato legado — a ordem é preservada,
  // então o Card sempre começa pela foto principal escolhida no perfil.
  const orderedPhotos = [
    ...(Array.isArray(user.photos) ? user.photos : []),
    ...(Array.isArray(user.fotos) ? user.fotos : []),
  ];
  if (orderedPhotos.length > 0) {
    images = orderedPhotos
      .map(f => typeof f === 'string'
        ? (f.startsWith('http') ? f : cloudinaryUrl(f))
        : cloudinaryUrl(f.url || f.public_id))
      .filter(Boolean);
  }
  if (images.length === 0 && user.foto_url)       images = [user.foto_url];
  if (images.length === 0 && user.foto_public_id) images = [cloudinaryUrl(user.foto_public_id)];
  if (images.length === 0)                         images = [avatarFallback(user.name || user.nome)];

  return {
    id:       user.id,
    name:     user.name  || user.nome || 'Desconhecido',
    age:      user.idade || user.age  || '?',
    location: user.cidade || user.location || 'Localização oculta',
    dist:     user.distancia ? `${Math.round(user.distancia)} km` : 'Perto de você',
    img:      images,
    type:     user.status_relacionamento === 'grupo' ? 'Grupo' : 'Individual',
    bio:      user.bio || '',
    verified: user.verificado || false,
  };
};

const normalizeLoggedUser = (user) => ({
  id:   user.id,
  name: user.name || user.nome || 'Você',
  foto: user.foto_url
     || cloudinaryUrl(user.foto_public_id, { w: 200, h: 200, crop: 'thumb' })
     || null,
});

// ═══════════════════════════════════════════════════════════════════════════
const Discovery = () => {
  const navigate = useNavigate();

  const [profiles,          setProfiles]         = useState([]);
  const [currentIndex,      setCurrentIndex]     = useState(0);
  const [loading,           setLoading]          = useState(true);
  const [loadingMore,       setLoadingMore]      = useState(false);
  const [page,              setPage]             = useState(1);
  const [hasMore,           setHasMore]          = useState(true);
  const [loggedUser,        setLoggedUser]       = useState(null);
  const [groupMemberIndex,  setGroupMemberIndex] = useState(0);
  const [exitX,             setExitX]            = useState(0);
  const [isFilterOpen,      setIsFilterOpen]     = useState(false);
  const [activeFilters,     setActiveFilters]    = useState({
    distance: 50, ageRange: [18, 40], relationshipStatus: [], interests: [],
  });
  const [showMatch,          setShowMatch]        = useState(false);
  const [notificationBadge,  setNotificationBadge] = useState(0);
  const [isReportOpen,       setIsReportOpen]     = useState(false);

  const fetchingMore = useRef(false);

  // ── Mensagens não lidas (badge do Chat e título da aba) ──────────────────
  // Total real vindo da API (soma do unreadCount de cada conversa), atualizado
  // quando chega mensagem nova pelo socket.
  const carregarNaoLidas = useCallback(async () => {
    try {
      const { data } = await api.get('/conversas');
      const total = (Array.isArray(data) ? data : [])
        .reduce((soma, conversa) => soma + (Number(conversa.unreadCount) || 0), 0);
      setNotificationBadge(total);
    } catch (err) {
      console.error('Não lidas:', err?.response?.status, err?.response?.data);
    }
  }, []);

  useEffect(() => {
    carregarNaoLidas();
    socket.on('new_message', carregarNaoLidas);
    return () => { socket.off('new_message', carregarNaoLidas); };
  }, [carregarNaoLidas]);

  useEffect(() => {
    document.title = notificationBadge > 0 ? `(${notificationBadge}) Openest` : 'Openest';
    return () => { document.title = 'Openest'; };
  }, [notificationBadge]);

  // ── Usuário logado (sidebar) ───────────────────────────────────────────────
  useEffect(() => {
    api.get('/users/perfil')
      .then(({ data }) => setLoggedUser(normalizeLoggedUser(data)))
      .catch(err => console.error('Perfil logado:', err?.response?.status, err?.response?.data));
  }, []);

  // ── Busca de perfis (paginada) ─────────────────────────────────────────────
  const fetchProfiles = useCallback(async (pageNum, filters) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    fetchingMore.current = true;
    try {
      const { data } = await api.get('/users/buscar', {
        params: {
          page:      pageNum,
          limit:     10,
          distancia: filters.distance,
          idade_min: filters.ageRange[0],
          idade_max: filters.ageRange[1],
          ...(filters.relationshipStatus.length > 0 && {
            status: filters.relationshipStatus.join(','),
          }),
        },
      });

      const raw        = data.perfis || data.users || data.results || data.data || [];
      const normalized = raw.map(normalizeProfile);

      if (pageNum === 1) {
        setProfiles(normalized);
        setCurrentIndex(0);
      } else {
        setProfiles(prev => [...prev, ...normalized]);
      }

      setHasMore(data.hasMore ?? (normalized.length === 10));
      setPage(pageNum);
    } catch (err) {
      console.error('Buscar perfis:', err?.response?.status, err?.response?.data);
      toast.error('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingMore.current = false;
    }
  }, []);

  // Carga inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProfiles(1, activeFilters); }, []);

  // Pré-carga quando restam ≤ 3 cards
  useEffect(() => {
    if (!hasMore || loadingMore || fetchingMore.current) return;
    if (profiles.length - currentIndex <= 3) {
      fetchProfiles(page + 1, activeFilters);
    }
  }, [currentIndex, profiles.length, hasMore, loadingMore, page, fetchProfiles, activeFilters]);

  // ── Helpers de navegação ───────────────────────────────────────────────────
  const next = useCallback(() => {
    setGroupMemberIndex(0);
    setExitX(0);
    setCurrentIndex(prev => prev + 1);
  }, []);

  const current = profiles[currentIndex];

  const toggleGroupMember = useCallback((e) => {
    e.stopPropagation();
    if (current?.type === 'Grupo' && current.img.length > 1) {
      setGroupMemberIndex(prev => prev === 0 ? 1 : 0);
    }
  }, [current]);

  // ── Like ───────────────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!current) return;
    setExitX(300);
    try {
      const { data } = await api.post(`/curtir/${current.id}`);
      const isMatch = data.match || data.isMatch || data.resultado === 'match' || false;
      if (isMatch) {
        setShowMatch(true);
      } else {
        setTimeout(next, 400);
      }
    } catch (err) {
      console.error('Like:', err?.response?.status, err?.response?.data);
      setTimeout(next, 400);
    }
  }, [current, next]);

  // ── Dislike ────────────────────────────────────────────────────────────────
  const handleDislike = useCallback(async () => {
    if (!current) return;
    setExitX(-300);
    try {
      await api.post(`/interactions/passar/${current.id}`, {
        to_user_id: current.id,
        action: 'dislike',
      });
    } catch (err) {
      console.error('Dislike:', err?.response?.status, err?.response?.data);
    } finally {
      setTimeout(next, 400);
    }
  }, [current, next]);

  // ── Denúncia ───────────────────────────────────────────────────────────────
  const handleReportSubmit = useCallback(async (userId, reason) => {
    try {
      await api.post(`/denunciar/${userId}`, { motivo: reason });
      toast.success('Denúncia enviada com sucesso. Nossa equipe vai analisar o perfil.');
    } catch (err) {
      console.error('Denúncia:', err?.response?.status, err?.response?.data);
      toast.error('Não foi possível registrar a denúncia agora.');
    } finally {
      setIsReportOpen(false);
    }
  }, []);

  // ── Filtros ────────────────────────────────────────────────────────────────
  const handleApplyFilters = useCallback((newFilters) => {
    setActiveFilters(newFilters);
    setIsFilterOpen(false);
    fetchProfiles(1, newFilters);
  }, [fetchProfiles]);

  if (loading) return <Loading />;

  return (
    <Motion.div
      className="discovery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Toaster position="top-right" />

      <AppSidebar
        user={loggedUser}
        onReport={() => {
          // Só há o que denunciar com um perfil na tela.
          if (current) setIsReportOpen(true);
          else toast('Nenhum perfil na tela para denunciar.');
        }}
        badges={{ '/chat': notificationBadge }}
      />

      <main className="discovery-main">
        <header className="discovery-toolbar">
          <h1>Descobrir</h1>
          <button type="button" className="discovery-filter-btn" onClick={() => setIsFilterOpen(true)}>
            <SlidersHorizontal size={16} aria-hidden="true" /> Filtros
          </button>
        </header>

        <div className="discovery-stage">
          <div className="card-container">
            <AnimatePresence mode="wait">
              {current ? (
                <Motion.div
                  key={current.id}
                  className="profile-card"
                  initial={{ opacity: 0, scale: 0.97, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, x: exitX, rotate: exitX > 0 ? 8 : -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <AnimatePresence mode="wait">
                    <Motion.img
                      key={`${current.id}-${groupMemberIndex}`}
                      src={current.img[groupMemberIndex]}
                      alt={current.name}
                      className="card-img"
                      loading="lazy"
                      draggable={false}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onError={e => { e.target.onerror = null; e.target.src = avatarFallback(current.name); }}
                    />
                  </AnimatePresence>

                  {current.img.length > 1 && (
                    <div className="photo-dots">
                      {current.img.map((_, i) => (
                        <button
                          type="button"
                          key={i}
                          className={`dot ${i === groupMemberIndex ? 'active' : ''}`}
                          onClick={e => { e.stopPropagation(); setGroupMemberIndex(i); }}
                          aria-label={`Foto ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <button type="button" className="group-badge" onClick={toggleGroupMember}>
                    {current.type === 'Grupo'
                      ? <><Users size={14} aria-hidden="true" /> Grupo{current.img.length > 1 ? ` · ver ${groupMemberIndex === 0 ? '2º' : '1º'}` : ''}</>
                      : <><User size={14} aria-hidden="true" /> {current.type}</>}
                  </button>

                  <div className="card-overlay">
                    <div className="info-box">
                      <h2>
                        {current.name}, {current.age}
                        {current.verified ? <BadgeCheck size={20} className="verified-icon" aria-label="Perfil verificado" /> : null}
                      </h2>
                      <p>{current.location} · {current.dist}</p>
                      {current.bio && (
                        <p className="bio-preview">
                          {current.bio.slice(0, 80)}{current.bio.length > 80 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </Motion.div>
              ) : (
                <Motion.div
                  className="end-state"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span className="end-badge"><Sparkles size={26} aria-hidden="true" /></span>
                  <h3>Você viu todo mundo por aqui</h3>
                  <p>Tente ampliar os filtros ou volte mais tarde.</p>
                  <button onClick={() => fetchProfiles(1, activeFilters)} className="btn-retry">
                    <RotateCcw size={16} aria-hidden="true" /> Buscar novamente
                  </button>
                </Motion.div>
              )}
            </AnimatePresence>

            {loadingMore && (
              <div className="loading-more-indicator">
                <span>Carregando mais perfis...</span>
              </div>
            )}
          </div>

          <div className="actions-footer">
            <Motion.button
              whileTap={{ scale: 0.9 }}
              className="circle-btn x-btn"
              onClick={handleDislike}
              disabled={!current}
              aria-label="Passar perfil"
              title="Passar"
            >
              <X size={28} aria-hidden="true" />
            </Motion.button>
            <Motion.button
              whileTap={{ scale: 0.9 }}
              className="circle-btn heart-btn"
              onClick={handleLike}
              disabled={!current}
              aria-label="Curtir perfil"
              title="Curtir"
            >
              <Heart size={28} fill="currentColor" aria-hidden="true" />
            </Motion.button>
          </div>
        </div>

        <Filters
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyFilters}
          currentFilters={activeFilters}
        />

        <MatchPopup
          isOpen={showMatch}
          matchName={current?.name}
          matchImg={current?.img?.[groupMemberIndex]}
          loggedUserImg={loggedUser?.foto}
          onClose={() => { setShowMatch(false); next(); }}
          onChat={() => navigate(`/chat/${current?.id}`)}
        />

        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          targetUser={current
            ? { id: current.id, name: current.name, img: current.img[groupMemberIndex] }
            : null}
          onSubmitReport={handleReportSubmit}
        />
      </main>
    </Motion.div>
  );
};

export default Discovery;