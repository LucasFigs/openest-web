import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import calendarIcon from '../../assets/images/calendar.png';
import './Discovery.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';
import Filters from '../../components/Filters/Filters';
import MatchPopup from '../../components/MatchPopup/MatchPopup';
import logoOn from '../../assets/images/LOGO.png';

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
    images = user.fotos.map(f =>
      typeof f === 'string'
        ? (f.startsWith('http') ? f : cloudinaryUrl(f))
        : cloudinaryUrl(f.url || f.public_id)
    ).filter(Boolean);
  }
  if (images.length === 0 && user.foto_url) images = [user.foto_url];
  if (images.length === 0 && user.foto_public_id) images = [cloudinaryUrl(user.foto_public_id)];
  if (images.length === 0) images = [avatarFallback(user.name || user.nome)];

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

// ═══════════════════════════════════════════════
const Discovery = () => {
  const navigate = useNavigate();

  const [profiles,         setProfiles]         = useState([]);
  const [currentIndex,     setCurrentIndex]     = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [loadingMore,      setLoadingMore]      = useState(false);
  const [page,             setPage]             = useState(1);
  const [hasMore,          setHasMore]          = useState(true);
  const [loggedUser,       setLoggedUser]       = useState(null);
  const [currentTime,      setCurrentTime]      = useState('');
  const [groupMemberIndex, setGroupMemberIndex] = useState(0);
  const [exitX,            setExitX]            = useState(0);
  const [isFilterOpen,     setIsFilterOpen]     = useState(false);
  const [activeFilters,    setActiveFilters]    = useState({
    distance: 50, ageRange: [18, 40], relationshipStatus: [], interests: [],
  });
  const [showMatch,         setShowMatch]         = useState(false);
  const [notificationBadge, setNotificationBadge] = useState(0);

  // Ref para evitar que o useEffect de pré-carga dispare infinitamente
  const fetchingMore = useRef(false);

  // ── Relógio ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Badge no título ───────────────────────────────────────────────────────
  useEffect(() => {
    if (notificationBadge <= 0) return;
    const original = 'Openest';
    const id = setInterval(() => {
      document.title = document.title === original
        ? `(${notificationBadge}) Nova Mensagem!` : original;
    }, 1000);
    return () => { clearInterval(id); document.title = original; };
  }, [notificationBadge]);

  // ── Usuário logado ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get('/users/perfil')
      .then(({ data }) => setLoggedUser(normalizeLoggedUser(data)))
      .catch(err => console.error('Perfil logado:', err?.response?.status, err?.response?.data));
  }, []); // ✅ sem dependências — roda só uma vez ao montar

  // ── Busca perfis ──────────────────────────────────────────────────────────
  // FIX erro 1 e 2: activeFilters estava em falta nas deps de useCallback,
  // causando warning. Agora recebe filters como parâmetro explícito para
  // evitar stale closure sem precisar colocar activeFilters como dependência.
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
  }, []); // ✅ sem deps — parâmetros passados explicitamente

  // Carga inicial
  useEffect(() => {
    fetchProfiles(1, activeFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ roda só uma vez

  // Pré-carga da próxima página
  // FIX erro 3: deps corretas [currentIndex, profiles.length, hasMore, loadingMore, page]
  useEffect(() => {
    if (!hasMore || loadingMore || fetchingMore.current) return;
    if (profiles.length - currentIndex <= 3) {
      fetchProfiles(page + 1, activeFilters);
    }
  }, [currentIndex, profiles.length, hasMore, loadingMore, page, fetchProfiles, activeFilters]);

  // ── Notificações de matches salvos ───────────────────────────────────────
  // FIX erro 4: handleIncomingMessage estava sendo usada dentro do useEffect
  // mas não estava nas dependências. Solução: mover a lógica para dentro do effect.
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
  }, [navigate]); // ✅ navigate é estável, sem warning

  // ── Navegação entre cards ─────────────────────────────────────────────────
  const next = useCallback(() => {
    setGroupMemberIndex(0);
    setExitX(0);
    setCurrentIndex(prev => prev + 1);
  }, []); // ✅ sem deps externas

  const current = profiles[currentIndex];

  // ── Like ──────────────────────────────────────────────────────────────────
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
  }, [current, next]); // ✅ deps corretas

  // ── Dislike ───────────────────────────────────────────────────────────────
  const handleDislike = useCallback(async () => {   //await api.post(`/interactions/passar/${current.id}`, {
    if (!current) return;
    setExitX(-300);
    try {
      await api.post(`/interactions/passar/${current.id}`, { // troquei para testar; await api.post('/interactions', { to_user_id: current.id, action: 'dislike',
        to_user_id: current.id,
        action: 'dislike',
      });
    } catch (err) {
      console.error('Dislike:', err?.response?.status, err?.response?.data);
    } finally {
      setTimeout(next, 400);
    }
  }, [current, next]); // ✅ deps corretas

  const toggleGroupMember = useCallback((e) => {
    e.stopPropagation();
    if (current?.type === 'Grupo' && current.img.length > 1) {
      setGroupMemberIndex(prev => prev === 0 ? 1 : 0);
    }
  }, [current]);

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

        <div className="nav-menu">
          <button className="nav-btn-box active" onClick={() => navigate('/chat/lista')}>
            <span className="mono-icon">✉</span>
            {notificationBadge > 0 && <span className="sidebar-badge">{notificationBadge}</span>}
          </button>
          <button className="nav-btn-box active"><span className="mono-icon">♥</span></button>
          <button className="nav-btn-box active">
            <span className="mono-icon">
              <img
                src={calendarIcon} alt="Calendário" className="calendar-dark-purple"
                style={{ filter: 'invert(13%) sepia(94%) saturate(7451%) hue-rotate(277deg) brightness(94%) contrast(116%)' }}
              />
            </span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="shield-btn-circle" onClick={() => navigate('/settings')}>
            <span className="mono-icon-shield">🛡</span>
          </button>
        </div>
      </aside>

      {/* ══ ÁREA PRINCIPAL ══ */}
      <main className="discovery-content-area">
        <div className="iphone-mockup-v2" style={{ position: 'relative' }}>

          <header className="iphone-header">
            <div className="header-left"><span className="live-clock">{currentTime}</span></div>
            <div className="header-center">
              <div className="mini-logo-container">
                <img src={logoOn} alt="Logo" className="phone-logo-img" />
              </div>
            </div>
            <div className="header-right">
              <div className="signal-bars">{[1,2,3,4].map(b => <div key={b} className={`bar b${b}`}/>)}</div>
              <div className="wifi-css"><div className="w-dot"/><div className="w-arc a1"/><div className="w-arc a2"/></div>
              <div className="battery-container"><div className="battery-shell"><div className="battery-level"/></div><div className="battery-tip"/></div>
            </div>
          </header>

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
                    className={`group-badge ${current.type === 'Grupo' && current.img.length > 1 ? 'clickable' : ''}`}
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

          <div className="actions-footer">
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn x-btn"     onClick={handleDislike} disabled={!current}>✕</motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn star-btn"  onClick={() => setIsFilterOpen(true)}>⭐</motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn heart-btn" onClick={handleLike}    disabled={!current}>♥</motion.button>
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
        </div>
      </main>
    </motion.div>
  );
};

export default Discovery;