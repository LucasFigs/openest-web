import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../assets/images/calendar.png';
import logoOn from '../../assets/images/LOGO.png';
import './Events.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';

const Events = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [events, setEvents] = useState([]);
  
  // Controle do calendário dinâmico
  const [currentDate, setCurrentDate] = useState(new Date());

  // Controle do Popup Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Relógio em Tempo Real ─────────────────────────────────────────────────
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

  // ── Integração Real com a API ─────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Rota que a equipe vai expor no Back-end
        const { data } = await api.get('/events/meus-encontros', {
          params: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear()
          }
        });
        
        // Espera um array de eventos vindos do Back-end no formato correto
        setEvents(data || []);
      } catch (err) {
        console.error('Erro ao buscar eventos da API:', err?.response?.status, err?.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [currentDate]);

  // ── Lógica do Calendário Dinâmico ─────────────────────────────────────────
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const openEventModal = (eventObj) => {
    setSelectedEvent(eventObj);
    setIsModalOpen(true);
  };

  const handleDayClick = (dayObj) => {
    if (!dayObj.isCurrentMonth) return;
    
    // Procura se a data do evento coincide com o dia clicado
    const foundEvent = events.find(e => {
      const eDate = new Date(e.data_encontro);
      return eDate.getDate() === dayObj.day && eDate.getMonth() === month && eDate.getFullYear() === year;
    });

    if (foundEvent) openEventModal(foundEvent);
  };

  const generateCalendarGrid = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const totalDays = new Date(year, month + 1, 0).getDate(); 
    const totalDaysPrevMonth = new Date(year, month, 0).getDate(); 

    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const grid = [];
    let currentWeek = [];

    for (let i = startOffset; i > 0; i--) {
      currentWeek.push({ day: totalDaysPrevMonth - i + 1, isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }

      // Verifica se a API retornou algum evento para este dia específico
      const hasEvent = events.some(e => {
        const eDate = new Date(e.data_encontro);
        return eDate.getDate() === day && eDate.getMonth() === month && eDate.getFullYear() === year;
      });
      
      const statusClass = hasEvent ? (day % 2 === 0 ? 'purple-dark' : 'pink') : null;
      currentWeek.push({ day, isCurrentMonth: true, status: statusClass });
    }

    let nextMonthDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({ day: nextMonthDay++, isCurrentMonth: false });
    }
    grid.push(currentWeek);
    return grid;
  };

  // Formatador de data amigável para os cards e popup
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const calendarWeeks = generateCalendarGrid();
  const daysOfWeekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long' });

  if (loading) return <Loading />;

  return (
    <div className="events-main-container">
      
      {/* ══ SIDEBAR ESQUERDA (IDÊNTICA À DISCOVERY) ══ */}
      <aside className="events-sidebar">
        <div className="avatar-wrapper" onClick={() => navigate('/edit-profile')}>
          <img src="https://github.com/edudouraado.png" alt="Profile" />
        </div>
        <div className="nav-menu">
          <button className="nav-btn-box" onClick={() => navigate('/chat/lista')}>
            <span className="mono-icon">✉</span>
          </button>
          <button className="nav-btn-box" onClick={() => navigate('/discovery')}>
            <span className="mono-icon">♥</span>
          </button>
          <button className="nav-btn-box active">
            <span className="mono-icon">
              <img src={calendarIcon} alt="Calendário Ativo" className="calendar-active-icon" />
            </span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="shield-btn-circle" onClick={() => navigate('/settings')}>
            <span className="mono-icon-shield">🛡</span>
          </button>
        </div>
      </aside>

      {/* ══ ÁREA CENTRAL ══ */}
      <main className="events-content-area">
        
        {/* COLUNA ESQUERDA: LISTAGEM DE EVENTOS */}
        <section className="events-list-section">
          <div className="events-header-row">
            <h1 className="events-title">SEUS EVENTOS</h1>
            <img src={logoOn} alt="Logo ON" className="events-logo-on" />
          </div>

          <div className="events-scroll-container">
            {events.length > 0 ? (
              events.map((event) => (
                <div 
                  key={event.id} 
                  className="event-card clickable-card" 
                  onClick={() => openEventModal(event)}
                >
                  <div className="event-avatars-row">
                    {Array.isArray(event.fotos) && event.fotos.map((avatar, idx) => (
                      <img key={idx} src={avatar} alt="Avatar" className="event-user-avatar" />
                    ))}
                  </div>
                  <h3 className="event-card-title">{event.titulo}</h3>
                  <div className="event-detail-item">
                    <span className="event-icon">📅</span>
                    <p>{formatEventTime(event.data_encontro)}</p>
                  </div>
                  <div className="event-detail-item">
                    <span className="event-icon">📍</span>
                    <p>{event.local}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="events-empty-state">
                <span className="empty-icon">👋</span>
                <h3>Nenhum evento agendado</h3>
                <p>Os eventos criados a partir dos seus matches aparecerão aqui automaticamente.</p>
              </div>
            )}
          </div>
        </section>

        {/* COLUNA DIREITA: CALENDÁRIO */}
        <section className="calendar-section">
          <div className="calendar-container-card">
            
            <header className="calendar-header">
              <button className="calendar-nav-btn" onClick={handlePrevMonth}>«</button>
              <h2 className="calendar-month-title">
                {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
              </h2>
              <button className="calendar-nav-btn" onClick={handleNextMonth}>»</button>
            </header>

            <div className="calendar-grid">
              <div className="calendar-week-days">
                {daysOfWeekLabels.map((day, idx) => (
                  <div key={idx} className="week-day-label">{day}</div>
                ))}
              </div>

              <div className="calendar-month-days">
                {calendarWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="calendar-row">
                    {week.map((date, dateIdx) => (
                      <div 
                        key={dateIdx} 
                        onClick={() => handleDayClick(date)}
                        className={`calendar-day-cell 
                          ${!date.isCurrentMonth ? 'other-month' : ''} 
                          ${date.status ? `status-${date.status} has-event-day` : ''}
                        `}
                      >
                        <span>{date.day}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* ══ POPUP MODAL EM TELA CHEIA (ESTILO CARROSSEL PREMIUM) ══ */}
      {isModalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="event-modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            
            <div className="event-modal-media">
              {/* Usa unicamente a primeira foto como plano de fundo principal */}
              {Array.isArray(selectedEvent.fotos) && selectedEvent.fotos.length > 0 && (
                <img 
                  src={selectedEvent.fotos[0]} 
                  alt="Banner do Encontro" 
                  className="event-modal-img"
                />
              )}
              
              <div className="event-modal-img-overlay">
                <h2>{selectedEvent.matchName}</h2>
                
                {/* Carrossel de avatares com efeito flutuante se houver mais de um usuário */}
                {Array.isArray(selectedEvent.fotos) && selectedEvent.fotos.length > 1 && (
                  <div className="modal-avatar-stack">
                    {selectedEvent.fotos.map((avatar, idx) => (
                      <img 
                        key={idx} 
                        src={avatar} 
                        alt={`Participante ${idx + 1}`} 
                        className="modal-stack-avatar-item" 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="event-modal-info">
              <span className="event-modal-badge">Confirmado 🔥</span>
              <h1 className="event-modal-title">{selectedEvent.titulo}</h1>
              
              <div className="event-modal-meta-row">
                <div className="meta-icon-box">📅</div>
                <div className="meta-text-box">
                  <label>Data e Horário</label>
                  <p>{formatEventTime(selectedEvent.data_encontro)}</p>
                </div>
              </div>

              <div className="event-modal-meta-row">
                <div className="meta-icon-box">📍</div>
                <div className="meta-text-box">
                  <label>Localização do Encontro</label>
                  <p>{selectedEvent.local}</p>
                </div>
              </div>

              <button className="event-modal-chat-btn" onClick={() => navigate(`/chat/${selectedEvent.matchId}`)}>
                Enviar mensagem no Chat ✉
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;