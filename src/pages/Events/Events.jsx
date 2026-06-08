import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../assets/images/calendar.png';
import logoOn from '../../assets/images/LOGO.png';
import './Events.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';

const avatarFallback = (name = 'Usuário') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

// ─────────────────────────────────────────────────────────────────────────────
// Gera um link direto para o Google Calendar com o evento pré-preenchido.
// O usuário clica, o Google abre com tudo já preenchido, e ele só salva.
// Não precisa de OAuth, API Key nem nenhuma configuração extra.
// ─────────────────────────────────────────────────────────────────────────────
const gerarLinkGoogleCalendar = (evento) => {
  const inicio = new Date(evento.data_encontro);
  const fim    = new Date(inicio.getTime() + 60 * 60 * 1000); // +1 hora

  // Formato exigido pelo Google: YYYYMMDDTHHmmssZ
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

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

  // ── Foto do usuário logado (sidebar) ──────────────────────────────────────
  useEffect(() => {
    api.get('/users/perfil')
      .then(({ data }) => setLoggedUser({ name: data.name, foto: data.foto_url || null }))
      .catch(err => console.error('Perfil sidebar:', err?.response?.status));
  }, []);

  // ── Busca eventos da API ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/events/meus-encontros', {
          params: {
            mes: currentDate.getMonth() + 1,
            ano: currentDate.getFullYear(),
          },
        });
        setEvents(data || []);
      } catch (err) {
        console.error('Erro ao buscar eventos:', err?.response?.status, err?.response?.data);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  // ── Calendário dinâmico ────────────────────────────────────────────────────
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayClick = (dayObj) => {
    if (!dayObj.isCurrentMonth) return;
    const found = events.find(e => {
      const d = new Date(e.data_encontro);
      return d.getDate() === dayObj.day && d.getMonth() === month && d.getFullYear() === year;
    });
    if (found) { setSelectedEvent(found); setIsModalOpen(true); }
  };

  const generateCalendarGrid = () => {
    const firstDayIndex      = new Date(year, month, 1).getDay();
    const totalDays          = new Date(year, month + 1, 0).getDate();
    const totalDaysPrevMonth = new Date(year, month, 0).getDate();
    const startOffset        = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const grid = [];
    let week   = [];

    for (let i = startOffset; i > 0; i--)
      week.push({ day: totalDaysPrevMonth - i + 1, isCurrentMonth: false });

    for (let day = 1; day <= totalDays; day++) {
      if (week.length === 7) { grid.push(week); week = []; }
      const hasEvent    = events.some(e => {
        const d = new Date(e.data_encontro);
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

  const formatEventTime = (dateString) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
    });

  const calendarWeeks    = generateCalendarGrid();
  const daysOfWeekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthName        = currentDate.toLocaleString('pt-BR', { month: 'long' });

  if (loading) return <Loading />;

  return (
    <div className="events-main-container">

      {/* ══ SIDEBAR ══ */}
      <aside className="events-sidebar">
        <div className="avatar-wrapper" onClick={() => navigate('/edit-profile')} title="Editar perfil">
          <img
            src={loggedUser?.foto || avatarFallback(loggedUser?.name)}
            alt={loggedUser?.name || 'Perfil'}
            style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '50%' }}
            onError={e => { e.target.onerror = null; e.target.src = avatarFallback(loggedUser?.name); }}
          />
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

        {/* Lista de eventos */}
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
                  onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                >
                  <div className="event-avatars-row">
                    {event.fotos.length > 0
                      ? event.fotos.map((avatar, idx) => (
                          <img key={idx} src={avatar} alt="Avatar" className="event-user-avatar"
                            onError={e => { e.target.onerror = null; e.target.src = avatarFallback(event.matchName); }}
                          />
                        ))
                      : <img src={avatarFallback(event.matchName)} alt="Avatar" className="event-user-avatar" />
                    }
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

                  {/* Botão Google Calendar direto no card */}
                  <a
                    href={gerarLinkGoogleCalendar(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gcal-btn-card"
                    onClick={e => e.stopPropagation()}
                    title="Adicionar ao Google Agenda"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    Salvar no Google Agenda
                  </a>
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

        {/* Calendário */}
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
                {daysOfWeekLabels.map((d, i) => (
                  <div key={i} className="week-day-label">{d}</div>
                ))}
              </div>
              <div className="calendar-month-days">
                {calendarWeeks.map((week, wi) => (
                  <div key={wi} className="calendar-row">
                    {week.map((date, di) => (
                      <div
                        key={di}
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

      {/* ══ MODAL DE EVENTO ══ */}
      {isModalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="event-modal-card" onClick={e => e.stopPropagation()}>
            <button className="event-modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>

            <div className="event-modal-media">
              {selectedEvent.fotos.length > 0 ? (
                <img
                  src={selectedEvent.fotos[0]}
                  alt="Banner do Encontro"
                  className="event-modal-img"
                  onError={e => { e.target.onerror = null; e.target.src = avatarFallback(selectedEvent.matchName); }}
                />
              ) : (
                <img src={avatarFallback(selectedEvent.matchName)} alt="Avatar" className="event-modal-img" />
              )}
              <div className="event-modal-img-overlay">
                <h2>{selectedEvent.matchName}</h2>
              </div>
            </div>

            <div className="event-modal-info">
              <span className="event-modal-badge">Match confirmado 🔥</span>
              <h1 className="event-modal-title">{selectedEvent.titulo}</h1>

              <div className="event-modal-meta-row">
                <div className="meta-icon-box">📅</div>
                <div className="meta-text-box">
                  <label>Data do Match</label>
                  <p>{formatEventTime(selectedEvent.data_encontro)}</p>
                </div>
              </div>

              <div className="event-modal-meta-row">
                <div className="meta-icon-box">📍</div>
                <div className="meta-text-box">
                  <label>Localização</label>
                  <p>{selectedEvent.local}</p>
                </div>
              </div>

              {selectedEvent.bio && (
                <div className="event-modal-meta-row">
                  <div className="meta-icon-box">👤</div>
                  <div className="meta-text-box">
                    <label>Sobre</label>
                    <p>{selectedEvent.bio}</p>
                  </div>
                </div>
              )}

              {/* ── Botões de ação ── */}
              <div className="event-modal-actions">
                {/* Abre o Google Agenda com evento pré-preenchido */}
                <a
                  href={gerarLinkGoogleCalendar(selectedEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcal-btn-modal"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/>
                  </svg>
                  Salvar no Google Agenda
                </a>

                {selectedEvent.matchId && (
                  <button
                    className="event-modal-chat-btn"
                    onClick={() => navigate(`/chat/${selectedEvent.matchId}`)}
                  >
                    Enviar mensagem no Chat ✉
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;