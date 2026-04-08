import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Discovery.css';

// Importação da sua logo local
import logoOn from '../../assets/images/LOGO.png'; 

const Discovery = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  const logoPath = logoOn; 

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

  useEffect(() => {
    setTimeout(() => {
      setProfiles([
        { id: 1, name: 'Sofia Espanha', age: 25, location: 'Caucaia, Fortaleza', dist: '15 km', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800', type: 'Grupo' },
        { id: 2, name: 'Beatriz Silva', age: 23, location: 'Meireles, Fortaleza', dist: '2 km', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', type: 'Individual' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const next = () => setCurrentIndex(prev => prev + 1);

  if (loading) return <div className="discovery-main-container"><div className="loader">Carregando...</div></div>;

  const current = profiles[currentIndex];

  return (
    <div className="discovery-main-container">
      {/* SIDEBAR ESQUERDA PADRONIZADA */}
      <aside className="discovery-sidebar">
        <div className="avatar-wrapper" onClick={() => navigate('/edit-profile')}>
          <img src="https://github.com/edudouraado.png" alt="Profile" />
        </div>
        
        <div className="nav-menu">
          <button className="nav-btn-box">
             <span className="mono-icon">✉</span> 
          </button>
          <button className="nav-btn-box active">
             <span className="mono-icon">♥</span>
          </button>
          <button className="nav-btn-box">
             <span className="mono-icon">☷</span> 
          </button>
        </div>
        
        <div className="sidebar-footer">
          <button className="shield-btn-circle" onClick={() => navigate('/settings')}>
             <span className="mono-icon-shield">🛡</span>
          </button>
        </div>
      </aside>

      {/* ÁREA CENTRAL */}
      <main className="discovery-content-area">
        <div className="iphone-mockup-v2">
          {/* HEADER (STATUS BAR) CORRIGIDA */}
          <header className="iphone-header">
            <div className="header-left">
              <span className="live-clock">{currentTime}</span>
            </div>
            
            <div className="header-center">
               <div className="mini-logo-container">
                  <img src={logoPath} alt="Logo ON" className="phone-logo-img" />
               </div>
            </div>
            
            <div className="header-right">
               <div className="signal-bars">
                  <div className="bar b1"></div>
                  <div className="bar b2"></div>
                  <div className="bar b3"></div>
                  <div className="bar b4"></div>
               </div>
               {/* Ícone de Wi-Fi universal ou via CSS */}
               <div className="wifi-css">
                  <div className="w-dot"></div>
                  <div className="w-arc a1"></div>
                  <div className="w-arc a2"></div>
               </div>
               <div className="battery-container">
                  <div className="battery-shell">
                    <div className="battery-level"></div>
                  </div>
                  <div className="battery-tip"></div>
               </div>
            </div>
          </header>

          <div className="card-container">
            {current ? (
              <div className="profile-card">
                <img src={current.img} alt={current.name} className="card-img" />
                <div className="group-badge">👥 {current.type}</div>
                <div className="card-overlay">
                  <div className="info-box">
                    <h2>{current.name}, {current.age}</h2>
                    <p>Mora em {current.location}</p>
                    <small>{current.dist}</small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="end-state">
                <h3>Acabaram os perfis!</h3>
                <button onClick={() => setCurrentIndex(0)} className="btn-retry">Recarregar</button>
              </div>
            )}
          </div>

          <div className="actions-footer">
            <button className="circle-btn x-btn" onClick={next}>✕</button>
            <button className="circle-btn star-btn">⭐</button>
            <button className="circle-btn heart-btn" onClick={next}>♥</button>
          </div>
          <div className="home-indicator"></div>
        </div>
      </main>
    </div>
  );
};

export default Discovery;