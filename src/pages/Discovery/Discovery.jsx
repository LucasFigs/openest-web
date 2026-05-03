import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import calendarIcon from '../../assets/images/calendar.png';
import './Discovery.css';

// Componentes
import Loading from '../../components/Loading/Loading';
import Filters from '../../components/Filters/Filters';
import MatchPopup from '../../components/MatchPopup/MatchPopup';

// Assets
import logoOn from '../../assets/images/LOGO.png'; 

const Discovery = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [groupMemberIndex, setGroupMemberIndex] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    distance: 50,
    ageRange: [18, 40],
    relationshipStatus: [],
    interests: []
  });

  const [showMatch, setShowMatch] = useState(false);
  const [notificationBadge, setNotificationBadge] = useState(0);

  const logoPath = logoOn; 

  // Task #40: Título da aba piscante
  useEffect(() => {
    if (notificationBadge > 0) {
      const originalTitle = "Openest";
      const interval = setInterval(() => {
        document.title = document.title === originalTitle 
          ? `(${notificationBadge}) Nova Mensagem!` 
          : originalTitle;
      }, 1000);
      return () => {
        clearInterval(interval);
        document.title = originalTitle;
      };
    }
  }, [notificationBadge]);

  // Relógio em tempo real
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulação de carregamento e Notificação
  useEffect(() => {
    setTimeout(() => {
      setProfiles([
        { id: 1, name: 'Sofia Espanha', age: 25, location: 'Caucaia', dist: '15 km', img: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'], type: 'Individual' },
        { 
          id: 2, 
          name: 'Beatriz & Tiago', 
          age: '23/25', 
          location: 'Meireles', 
          dist: '2 km', 
          img: [
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800'
          ], 
          type: 'Grupo' 
        },
        { id: 3, name: 'Larissa Manoela', age: 22, location: 'Aldeota', dist: '5 km', img: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800'], type: 'Individual' },
        { 
          id: 4, 
          name: 'Marcos & Júlia', 
          age: '28/27', 
          location: 'Beira Mar', 
          dist: '1 km', 
          img: [
            'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
            'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800'
          ], 
          type: 'Grupo' 
        }
      ]);
      setLoading(false);

      const currentMatches = JSON.parse(localStorage.getItem('openest_matches') || '[]');
      if (currentMatches.length > 0) {
        const timer = setTimeout(() => {
          const lastMatch = currentMatches[currentMatches.length - 1];
          handleIncomingMessage(lastMatch); // Passamos o objeto completo do match
        }, 4000);
        return () => clearTimeout(timer);
      }
    }, 800);
  }, []);

  // Task #40: Notificação Clicável para abrir o Chat
  const handleIncomingMessage = (matchObj) => {
    setNotificationBadge(prev => prev + 1);
    
    toast.custom((t) => (
      <div 
        className={`toast-custom-openest clickable-toast ${t.visible ? 'animate-enter' : 'animate-leave'}`}
        onClick={() => {
          toast.dismiss(t.id);
          navigate(`/chat/${matchObj.id}`); // Navega direto para o chat da pessoa
        }}
      >
        <div className="toast-avatar">✉️</div>
        <div className="toast-content">
          <p className="toast-title">Nova mensagem de {matchObj.name}</p>
          <p className="toast-text">Clique para responder...</p>
        </div>
      </div>
    ), { duration: 5000, id: `msg-${matchObj.id}` });
  };

  const next = () => {
    setGroupMemberIndex(0);
    setCurrentIndex(prev => prev + 1);
  };

  const current = profiles[currentIndex];

  const toggleGroupMember = (e) => {
    e.stopPropagation();
    if (current?.type === 'Grupo') {
      setGroupMemberIndex(prev => (prev === 0 ? 1 : 0));
    }
  };

  const handleLike = () => {
    const isMatch = Math.random() > 0.5;
    if (isMatch) {
      setShowMatch(true);
      const currentMatches = JSON.parse(localStorage.getItem('openest_matches') || '[]');
      if (current && !currentMatches.find(m => m.id === current.id)) {
        const matchData = { 
          ...current, 
          img: Array.isArray(current.img) ? current.img[0] : current.img 
        };
        localStorage.setItem('openest_matches', JSON.stringify([...currentMatches, matchData]));
      }
    } else {
      next();
    }
  };

  if (loading) return <Loading />;

  return (
    <motion.div 
      className="discovery-main-container"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Toaster position="top-right" />

      <aside className="discovery-sidebar">
        <div className="avatar-wrapper" onClick={() => navigate('/edit-profile')}>
          <img src="https://github.com/edudouraado.png" alt="Profile" />
        </div>
        <div className="nav-menu">
          <button className="nav-btn-box" onClick={() => navigate('/chat/lista')}>
             <span className="mono-icon">✉</span> 
             {notificationBadge > 0 && <span className="sidebar-badge">{notificationBadge}</span>}
          </button>
          <button className="nav-btn-box active"><span className="mono-icon">♥</span></button>
          <button className="nav-btn-box">
             <span className="mono-icon">
                <img 
                  src={calendarIcon} 
                  alt="Cal" 
                  className="calendar-dark-purple" 
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

      <main className="discovery-content-area">
        <div className="iphone-mockup-v2" style={{ position: 'relative' }}>
          <header className="iphone-header">
            <div className="header-left"><span className="live-clock">{currentTime}</span></div>
            <div className="header-center">
               <div className="mini-logo-container"><img src={logoPath} alt="Logo" className="phone-logo-img" /></div>
            </div>
            <div className="header-right">
               <div className="signal-bars">{[1,2,3,4].map(b => <div key={b} className={`bar b${b}`}></div>)}</div>
               <div className="wifi-css"><div className="w-dot"></div><div className="w-arc a1"></div><div className="w-arc a2"></div></div>
               <div className="battery-container"><div className="battery-shell"><div className="battery-level"></div></div><div className="battery-tip"></div></div>
            </div>
          </header>

          <div className="card-container">
            <AnimatePresence mode="wait">
              {current ? (
                <motion.div 
                  key={current.id}
                  className="profile-card"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img 
                      key={groupMemberIndex}
                      src={current.img[groupMemberIndex]} 
                      alt={current.name} 
                      className="card-img"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                  <motion.div 
                    className={`group-badge ${current.type === 'Grupo' ? 'clickable' : ''}`}
                    onClick={toggleGroupMember}
                    whileTap={{ scale: 0.9 }}
                  >
                    {current.type === 'Grupo' ? `👥 Grupo (Ver ${groupMemberIndex === 0 ? '2º' : '1º'})` : `👤 ${current.type}`}
                  </motion.div>
                  <div className="card-overlay">
                    <div className="info-box">
                      <h2>{current.name}, {current.age}</h2>
                      <p>{current.location} • {current.dist}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="end-state">
                  <h3>Acabaram os perfis!</h3>
                  <button onClick={() => setCurrentIndex(0)} className="btn-retry">Recarregar</button>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="actions-footer">
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn x-btn" onClick={next}>✕</motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn star-btn" onClick={() => setIsFilterOpen(true)}>⭐</motion.button>
            <motion.button whileTap={{ scale: 0.8 }} className="circle-btn heart-btn" onClick={handleLike}>♥</motion.button>
          </div>
          <div className="home-indicator"></div>

          <Filters 
            isOpen={isFilterOpen} 
            onClose={() => setIsFilterOpen(false)} 
            onApply={(newFilters) => { setActiveFilters(newFilters); setIsFilterOpen(false); }} 
            currentFilters={activeFilters} 
          />
          
          <MatchPopup 
            isOpen={showMatch} 
            matchName={current?.name} 
            matchImg={Array.isArray(current?.img) ? current.img[groupMemberIndex] : current?.img} 
            onClose={() => { setShowMatch(false); next(); }} 
            onChat={() => navigate(`/chat/${current?.id}`)} 
          />
        </div>
      </main>
    </motion.div>
  );
};

export default Discovery;