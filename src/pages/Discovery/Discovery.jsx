import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import './Discovery.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';
import Filters from '../../components/Filters/Filters';
import MatchPopup from '../../components/MatchPopup/MatchPopup';
import ReportModal from '../../components/ReportModal/ReportModal';
import logoOn from '../../assets/images/LOGO.png';

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
  if (Array.isArray(user.fotos) && user.fotos.length > 0) {
    images = user.fotos
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
  const [currentTime,       setCurrentTime]      = useState('');
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

  // ── Relógio ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Badge piscante no título ───────────────────────────────────────────────
  useEffect(() => {
    if (notificationBadge <= 0) return;
    const original = 'Openest';
    const id = setInterval(() => {
      document.title = document.title === original
        ? `(${notificationBadge}) Nova Mensagem!` : original;
    }, 1000);
    return () => { clearInterval(id); document.title = original; };
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

  // ── Notificação de matches salvos ──────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('openest_matches') || '[]');
    if (!saved.length) return;
    const lastMatch = saved[saved.length - 1];
    const timer = setTimeout(() => {
      setNotificationBadge(prev => prev + 1);
      toast.custom((t) => (
        <div
          className={`toast-custom-openest clickable-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}
          onClick={() => { toast.dismiss(t.id); navigate(`/chat/${lastMatch.id}`); }}
        >
          <div className="toast-avatar">✉️</div>
          <div className="toast-content">
            <p className="toast-title">Nova mensagem de {lastMatch.name}</p>
            <p className="toast-text">Clique para responder...</p>
          </div>
        </div>
      ), { duration: 5000, id: `msg-${lastMatch.id}` });
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
        const saved = JSON.parse(localStorage.getItem('openest_matches') || '[]');
        if (!saved.find(m => m.id === current.id)) {
          localStorage.setItem('openest_matches',
            JSON.stringify([...saved, { ...current, img: current.img[0] }])
          );
        }
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
    <motion.div
      className="discovery-main-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-right" />

      {/* ══ SIDEBAR ══ */}
      <aside className="discovery-sidebar">

        {/* Avatar do usuário logado */}
        <div
          className="avatar-wrapper"
          onClick={() => navigate('/edit-profile')}
          title="Editar perfil"
        >
          <img
            src={loggedUser?.foto || avatarFallback(loggedUser?.name)}
            alt={loggedUser?.name || 'Meu perfil'}
            style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }}
            onError={e => { e.target.onerror = null; e.target.src = avatarFallback(loggedUser?.name); }}
          />
        </div>

        {/* Menu de navegação */}
        <div className="nav-menu">
          <button className="nav-btn-box active" onClick={() => navigate('/chat/lista')}>
            <span className="mono-icon">✉</span>
            {notificationBadge > 0 && <span className="sidebar-badge">{notificationBadge}</span>}
          </button>

          <button className="nav-btn-box active" onClick={() => navigate('/discovery')}>
            <span className="mono-icon">♥</span>
          </button>

          <button className="nav-btn-box active" onClick={() => navigate('/events')}>
            <span className="mono-icon">
              <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </span>
          </button>
        </div>

        {/* Rodapé da sidebar: configurações + denúncia */}
        <div className="sidebar-footer">
          <button className="settings-btn-circle" onClick={() => navigate('/settings')}>
            <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
          </button>

          <button className="report-btn-circle" onClick={() => setIsReportOpen(true)}>
            <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </button>
        </div>

      </aside>

      {/* ══ ÁREA PRINCIPAL ══ */}
      <main className="discovery-content-area">
        <div className="iphone-mockup-v2" style={{ position: 'relative' }}>

          {/* Header mockup de celular */}
          <header className="iphone-header">
            <div className="header-left">
              <span className="live-clock">{currentTime}</span>
            </div>
            <div className="header-center">
              <div className="mini-logo-container">
                <img src={logoOn} alt="Logo" className="phone-logo-img" />
              </div>
            </div>
            <div className="header-right">
              <div className="signal-bars">
                {[1, 2, 3, 4].map(b => <div key={b} className={`bar b${b}`} />)}
              </div>
              <div className="wifi-css">
                <div className="w-dot" />
                <div className="w-arc a1" />
                <div className="w-arc a2" />
              </div>
              <div className="battery-container">
                <div className="battery-shell">
                  <div className="battery-level" />
                </div>
                <div className="battery-tip" />
              </div>
            </div>
          </header>

          {/* Cards de perfil */}
          <div className="card-container">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.id}
                  className="profile-card"
                  initial={{ opacity: 0, scale: 0.95, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, x: exitX, rotate: exitX > 0 ? 10 : -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${current.id}-${groupMemberIndex}`}
                      src={current.img[groupMemberIndex]}
                      alt={current.name}
                      className="card-img"
                      loading="lazy"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      onError={e => { e.target.onerror = null; e.target.src = avatarFallback(current.name); }}
                    />
                  </AnimatePresence>

                  {current.img.length > 1 && (
                    <div className="photo-dots">
                      {current.img.map((_, i) => (
                        <span
                          key={i}
                          className={`dot ${i === groupMemberIndex ? 'active' : ''}`}
                          onClick={e => { e.stopPropagation(); setGroupMemberIndex(i); }}
                        />
                      ))}
                    </div>
                  )}

                  <motion.div
                    className="group-badge"
                    onClick={toggleGroupMember}
                    whileTap={{ scale: 0.9 }}
                  >
                    {current.type === 'Grupo' && current.img.length > 1
                      ? `👥 Grupo (Ver ${groupMemberIndex === 0 ? '2º' : '1º'})`
                      : `👤 ${current.type}`}
                  </motion.div>

                  {current.verified && (
                    <div className="verified-badge" title="Perfil verificado">✔</div>
                  )}

                  <div className="card-overlay">
                    <div className="info-box">
                      <h2>{current.name}, {current.age}</h2>
                      <p>{current.location} • {current.dist}</p>
                      {current.bio && (
                        <p className="bio-preview">
                          {current.bio.slice(0, 60)}{current.bio.length > 60 ? '…' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="end-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="end-icon">🌟</div>
                  <h3>Você viu todos por aqui!</h3>
                  <p>Tente ampliar os filtros ou volte mais tarde.</p>
                  <button onClick={() => fetchProfiles(1, activeFilters)} className="btn-retry">
                    Buscar novamente
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {loadingMore && (
              <div className="loading-more-indicator">
                <span>Carregando mais perfis...</span>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="actions-footer">
            <motion.button
              whileTap={{ scale: 0.8 }}
              className="circle-btn x-btn"
              onClick={handleDislike}
              disabled={!current}
            >
              ✕
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              className="circle-btn star-btn"
              onClick={() => setIsFilterOpen(true)}
            >
              ⭐
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              className="circle-btn heart-btn"
              onClick={handleLike}
              disabled={!current}
            >
              ♥
            </motion.button>
          </div>

          <div className="home-indicator" />

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
              : { id: 0, name: 'Ninguém selecionado', img: avatarFallback('Openest') }
            }
            onSubmitReport={handleReportSubmit}
          />

        </div>
      </main>
    </motion.div>
  );
};

export default Discovery;