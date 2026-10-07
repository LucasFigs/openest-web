import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoOn from '../../assets/images/LOGO.png';
import './Events.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';

const avatarFallback = (name = 'Usuário') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

const gerarLinkGoogleCalendar = (evento) => {
  if (!evento || !evento.data_encontro) return '#';
  const inicio = new Date(evento.data_encontro);
  if (isNaN(inicio.getTime())) return '#'; 

  const fim    = new Date(inicio.getTime() + 60 * 60 * 1000); 
  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     evento.titulo,
    dates:    `${fmt(inicio)}/${fmt(fim)}`,
    details:  `Encontro gerado pelo Openest.\n${evento.bio ? `Sobre: ${evento.bio}` : ''}`.trim(),
    location: evento.local,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const Events = () => {
  const navigate = useNavigate();
  const [loading,       setLoading]       = useState(true);
  const [currentTime,   setCurrentTime]   = useState('');
  const [events,        setEvents]        = useState([]);
  const [loggedUser,    setLoggedUser]    = useState(null);
  const [currentDate,   setCurrentDate]   = useState(new Date());
  
  const [selectedDay,   setSelectedDay]   = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    api.get('/users/perfil')
      .then(({ data }) => setLoggedUser({ name: data.name, foto: data.foto_url || null }))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events/meus-encontros', {
          params: { mes: currentDate.getMonth() + 1, ano: currentDate.getFullYear() },
        });
        setEvents(data || []);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  const handleCancelEvent = async (e, eventId) => {
    e.stopPropagation();
    if (!window.confirm('Tem a certeza que deseja cancelar este encontro?')) return;
    try {
      await api.delete(`/events/cancelar/${eventId}`);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      if (selectedEvent && selectedEvent.id === eventId) setIsModalOpen(false);
    } catch (error) {
      alert('Erro ao cancelar o encontro.');
    }
  };

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const handlePrevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); };
  const handleNextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); };

  const handleDayClick = (dayObj) => {
    if (!dayObj.isCurrentMonth) return;
    setSelectedDay(prev => prev === dayObj.day ? null : dayObj.day);
  };

  const generateCalendarGrid = () => {
    const firstDayIndex      = new Date(year, month, 1).getDay();
    const totalDays          = new Date(year, month + 1, 0).getDate();
    const totalDaysPrevMonth = new Date(year, month, 0).getDate();
    const startOffset        = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const grid = []; let week = [];

    for (let i = startOffset; i > 0; i--) week.push({ day: totalDaysPrevMonth - i + 1, isCurrentMonth: false });
    for (let day = 1; day <= totalDays; day++) {
      if (week.length === 7) { grid.push(week); week = []; }
      const hasEvent = events.some(e => {
        if (!e.data_encontro) return false;
        const d = new Date(e.data_encontro);
        if (isNaN(d.getTime())) return false; 
        
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });
      const statusClass = hasEvent ? (day % 2 === 0 ? 'purple-dark' : 'pink') : null;
      week.push({ day, isCurrentMonth: true, status: statusClass });
    }
    let nextDay = 1;
    while (week.length < 7) week.push({ day: nextDay++, isCurrentMonth: false });
    grid.push(week);
    return grid;
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return 'Data indefinida';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const calendarWeeks    = generateCalendarGrid();
  const daysOfWeekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthName        = currentDate.toLocaleString('pt-BR', { month: 'long' });

  const displayedEvents = selectedDay 
    ? events.filter(e => {
        if (!e.data_encontro) return false;
        const d = new Date(e.data_encontro);
        return !isNaN(d.getTime()) && d.getDate() === selectedDay;
      })
    : events;

  if (loading) return <Loading />;

  return (
    <div className="events-main-container">
      <aside className="events-sidebar">
        <div className="avatar-wrapper" onClick={() => navigate('/edit-profile')} title="Editar perfil">
          <img src={loggedUser?.foto || avatarFallback(loggedUser?.name)} alt={loggedUser?.name || 'Perfil'} style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }} onError={e => { e.target.onerror = null; e.target.src = avatarFallback(loggedUser?.name); }} />
        </div>
        <div className="nav-menu">
          <button className="nav-btn-box" onClick={() => navigate('/chat/lista')}><span className="mono-icon">✉</span></button>
          <button className="nav-btn-box" onClick={() => navigate('/discovery')}><span className="mono-icon">♥</span></button>
          <button className="nav-btn-box active">
            <span className="mono-icon"><svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg></span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="settings-btn-circle" onClick={() => navigate('/settings')}>
            <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
          </button>
          <button className="report-btn-circle" onClick={() => alert('Para denunciar, abra o perfil do match na tela principal.')}>
            <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </button>
        </div>
      </aside>

      <main className="events-content-area">
        <section className="events-list-section">
          
          <div className="events-header-row">
            <div>
              <h1 className="events-title">{selectedDay ? `EVENTOS: DIA ${selectedDay}` : 'SEUS EVENTOS'}</h1>
              {selectedDay && (
                <button className="clear-filter-btn" onClick={() => setSelectedDay(null)}>
                  Ver todos do mês
                </button>
              )}
            </div>
            <img src={logoOn} alt="Logo ON" className="events-logo-on" />
          </div>

          <div className="events-scroll-container">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => (
                <div key={event.id} className="event-card clickable-card" onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}>
                  <div className="event-avatars-row">
                    {event.fotos.length > 0 ? event.fotos.map((avatar, idx) => <img key={idx} src={avatar} alt="Avatar" className="event-user-avatar" onError={e => { e.target.onerror = null; e.target.src = avatarFallback(event.matchName); }} />) : <img src={avatarFallback(event.matchName)} alt="Avatar" className="event-user-avatar" />}
                  </div>
                  <h3 className="event-card-title">{event.titulo}</h3>
                  <div className="event-detail-item"><span className="event-icon">📅</span><p>{formatEventTime(event.data_encontro)}</p></div>
                  <div className="event-detail-item"><span className="event-icon">📍</span><p>{event.local}</p></div>

                  <div className="event-card-actions">
                    <a href={gerarLinkGoogleCalendar(event)} target="_blank" rel="noopener noreferrer" className="gcal-btn-card" onClick={e => { e.stopPropagation(); if (gerarLinkGoogleCalendar(event) === '#') e.preventDefault(); }} title="Adicionar ao Google Agenda">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/></svg>
                      Salvar no Google Agenda
                    </a>
                    
                    {/* 🔥 O BOTÃO FOI LIBERTADO! APARECE EM TODOS OS EVENTOS! */}
                    <button className="btn-cancel-event" onClick={(e) => handleCancelEvent(e, event.id)}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                      Desistir
                    </button>

                  </div>
                </div>
              ))
            ) : (
              <div className="events-empty-state"><span className="empty-icon">👋</span>
                <h3>{selectedDay ? 'Nenhum evento neste dia' : 'Nenhum evento agendado'}</h3>
                <p>Os eventos criados a partir dos seus matches aparecerão aqui automaticamente.</p>
              </div>
            )}
          </div>
        </section>

        <section className="calendar-section">
          <div className="calendar-container-card">
            <header className="calendar-header">
              <button className="calendar-nav-btn" onClick={handlePrevMonth}>«</button>
              <h2 className="calendar-month-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
              <button className="calendar-nav-btn" onClick={handleNextMonth}>»</button>
            </header>
            <div className="calendar-grid">
              <div className="calendar-week-days">{daysOfWeekLabels.map((d, i) => <div key={i} className="week-day-label">{d}</div>)}</div>
              <div className="calendar-month-days">
                {calendarWeeks.map((week, wi) => (
                  <div key={wi} className="calendar-row">
                    {week.map((date, di) => (
                      <div 
                        key={di} 
                        onClick={() => handleDayClick(date)} 
                        className={`calendar-day-cell ${!date.isCurrentMonth ? 'other-month' : ''} ${date.status ? `status-${date.status} has-event-day` : ''} ${selectedDay === date.day ? 'selected-day' : ''}`}
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

      {isModalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="event-modal-card" onClick={e => e.stopPropagation()}>
            <button className="event-modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            <div className="event-modal-media">
              {selectedEvent.fotos.length > 0 ? <img src={selectedEvent.fotos[0]} alt="Banner do Encontro" className="event-modal-img" onError={e => { e.target.onerror = null; e.target.src = avatarFallback(selectedEvent.matchName); }} /> : <img src={avatarFallback(selectedEvent.matchName)} alt="Avatar" className="event-modal-img" />}
              <div className="event-modal-img-overlay"><h2>{selectedEvent.matchName}</h2></div>
            </div>
            <div className="event-modal-info">
              <span className="event-modal-badge">Match confirmado 🔥</span>
              <h1 className="event-modal-title">{selectedEvent.titulo}</h1>
              <div className="event-modal-meta-row"><div className="meta-icon-box">📅</div><div className="meta-text-box"><label>Data do Match</label><p>{formatEventTime(selectedEvent.data_encontro)}</p></div></div>
              <div className="event-modal-meta-row"><div className="meta-icon-box">📍</div><div className="meta-text-box"><label>Localização</label><p>{selectedEvent.local}</p></div></div>
              {selectedEvent.bio && <div className="event-modal-meta-row"><div className="meta-icon-box">👤</div><div className="meta-text-box"><label>Sobre</label><p>{selectedEvent.bio}</p></div></div>}

              <div className="event-modal-actions">
                <a href={gerarLinkGoogleCalendar(selectedEvent)} target="_blank" rel="noopener noreferrer" className="gcal-btn-modal" onClick={e => { if(gerarLinkGoogleCalendar(selectedEvent) === '#') e.preventDefault(); }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>
                  Salvar no Google Agenda
                </a>

                {selectedEvent.matchId && (
                  <button className="event-modal-chat-btn" onClick={() => navigate(`/chat/${selectedEvent.matchId}`)}>
                    Enviar mensagem no Chat ✉
                  </button>
                )}

                {/* 🔥 O BOTÃO DO MODAL TAMBÉM FOI LIBERTADO! */}
                <button className="event-modal-cancel-btn" onClick={(e) => handleCancelEvent(e, selectedEvent.id)}>
                  Desistir do Encontro
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;