import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, MapPin, MessageCircle, UserRound, X,
} from 'lucide-react';
import AppSidebar from '../../components/AppSidebar/AppSidebar';
import './Events.css';

import api from '../../services/api';
import Loading from '../../components/Loading/Loading';

const avatarFallback = (name = 'Usuário') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`;

// Deduplica por par de usuários: cada pessoa aparece UMA vez. Um encontro
// AGENDADO substitui o card "A combinar" (match) do mesmo par. (A API já
// deduplica; esta é uma trava extra no cliente contra cards duplicados.)
const dedupeEventos = (lista = []) => {
  const porPar = new Map();
  for (const ev of lista) {
    const chave = ev.otherUserId
      ? String(ev.otherUserId)
      : ev.matchId != null ? `conv-${ev.matchId}` : ev.id;
    const atual = porPar.get(chave);
    if (!atual || (atual.tipo !== 'agendado' && ev.tipo === 'agendado')) {
      porPar.set(chave, ev);
    }
  }
  return Array.from(porPar.values());
};

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
  const location = useLocation();
  // Vindo do card "Encontro marcado" do chat: abre no mês e no dia dele.
  const [focoInicial] = useState(() => {
    const d = location.state?.focusDate ? new Date(location.state.focusDate) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  });
  const [loading,       setLoading]       = useState(true);
  const [events,        setEvents]        = useState([]);
  const [loggedUser,    setLoggedUser]    = useState(null);
  const [currentDate,   setCurrentDate]   = useState(() => (focoInicial ? new Date(focoInicial.getFullYear(), focoInicial.getMonth(), 1) : new Date()));

  const [selectedDay,   setSelectedDay]   = useState(() => (focoInicial ? focoInicial.getDate() : null));

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  // (removido um relógio que re-renderizava a página a cada segundo sem ser exibido)

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
        setEvents(dedupeEventos(data || []));
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentDate]);

  // "Desistir" encerra o vínculo inteiro (evento agendado + match) no banco.
  // Só tira o card da tela DEPOIS que a API confirma — se falhar, o card
  // continua lá e o erro aparece, em vez de sumir e voltar no refresh.
  const handleCancelEvent = async (e, evento) => {
    e.stopPropagation();
    if (!window.confirm('Tem a certeza que deseja cancelar este encontro?')) return;
    const eventId = typeof evento === 'object' ? evento.id : evento;
    try {
      await api.delete(`/events/cancelar/${encodeURIComponent(eventId)}`, {
        // Rede de segurança: se o evento já tiver sumido, a API ainda resolve
        // o vínculo pelo outro participante.
        data: { other_user_id: (typeof evento === 'object' ? evento.otherUserId : null) ?? null },
      });
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      if (selectedEvent && selectedEvent.id === eventId) setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao cancelar o encontro:', error);
      const detalhe = error?.response?.data?.error;
      alert(detalhe ? `Erro ao cancelar o encontro: ${detalhe}` : 'Erro ao cancelar o encontro. Tente novamente.');
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
  const daysOfWeekLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // seg → dom
  const monthName        = currentDate.toLocaleString('pt-BR', { month: 'long' });

  const displayedEvents = selectedDay
    ? events.filter(e => {
        if (!e.data_encontro) return false;
        const d = new Date(e.data_encontro);
        return !isNaN(d.getTime()) && d.getDate() === selectedDay;
      })
    : events;

  if (loading) return <Loading />;

  const ehAgendado = (ev) => String(ev?.id || '').startsWith('sched-') || ev?.tipo === 'agendado';
  const fotoDe = (ev) => (Array.isArray(ev?.fotos) && ev.fotos.find(Boolean)) || null;

  return (
    <div className="events-page">
      <AppSidebar
        user={loggedUser}
        onReport={() => alert('Para denunciar, abra o perfil do match na tela principal.')}
      />

      <main className="events-content">
        <section className="events-list-section">
          <header className="events-header">
            <div>
              <h1 className="events-title">{selectedDay ? `Dia ${selectedDay}` : 'Encontros'}</h1>
              <p className="events-subtitle">
                {selectedDay ? 'Encontros deste dia' : 'Matches e encontros marcados'}
              </p>
            </div>
            {selectedDay ? (
              <button className="clear-filter-btn" onClick={() => setSelectedDay(null)}>
                Ver o mês todo
              </button>
            ) : null}
          </header>

          <div className="events-scroll">
            {displayedEvents.length > 0 ? (
              displayedEvents.map((event) => {
                const foto = fotoDe(event);
                const agendado = ehAgendado(event);
                return (
                  <article
                    key={event.id}
                    className="event-card"
                    onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedEvent(event); setIsModalOpen(true); } }}
                    aria-label={`Encontro com ${event.matchName}`}
                  >
                    <div className="event-card__top">
                      <img
                        src={foto || avatarFallback(event.matchName)}
                        alt=""
                        className="event-card__avatar"
                        onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback(event.matchName); }}
                      />
                      <div className="event-card__heading">
                        <h3>{event.matchName}</h3>
                        {event.titulo && event.titulo !== event.matchName ? <p>{event.titulo}</p> : null}
                      </div>
                      <span className={`event-status ${agendado ? 'is-confirmed' : 'is-pending'}`}>
                        {agendado ? 'Agendado' : 'A combinar'}
                      </span>
                    </div>

                    <ul className="event-card__details">
                      <li><CalendarDays size={15} aria-hidden="true" /> {agendado ? formatEventTime(event.data_encontro) : 'Data a combinar'}</li>
                      <li><MapPin size={15} aria-hidden="true" /> {event.local}</li>
                    </ul>

                    <div className="event-card__actions">
                      {agendado ? (
                        <a
                          href={gerarLinkGoogleCalendar(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-outline"
                          onClick={(e) => { e.stopPropagation(); if (gerarLinkGoogleCalendar(event) === '#') e.preventDefault(); }}
                        >
                          <CalendarPlus size={15} aria-hidden="true" /> Salvar na agenda
                        </a>
                      ) : null}
                      {event.matchId ? (
                        <button
                          className="btn-primary"
                          onClick={(e) => { e.stopPropagation(); navigate(`/chat/${event.matchId}`); }}
                        >
                          <MessageCircle size={15} aria-hidden="true" /> Abrir chat
                        </button>
                      ) : null}
                      <button className="btn-ghost-danger" onClick={(e) => handleCancelEvent(e, event)}>
                        Desistir
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="events-empty">
                <span className="events-empty__badge"><CalendarDays size={26} aria-hidden="true" /></span>
                <h3>{selectedDay ? 'Nenhum encontro neste dia' : 'Nenhum encontro ainda'}</h3>
                <p>Os encontros marcados com os seus matches aparecem aqui automaticamente.</p>
              </div>
            )}
          </div>
        </section>

        <section className="calendar-section" aria-label="Calendário">
          <div className="calendar-card">
            <header className="calendar-header">
              <button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Mês anterior">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <h2 className="calendar-month-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</h2>
              <button className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Próximo mês">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </header>
            <div className="calendar-grid">
              <div className="calendar-week-days">
                {daysOfWeekLabels.map((d, i) => <div key={i} className="week-day-label">{d}</div>)}
              </div>
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className="calendar-row">
                  {week.map((date, di) => (
                    <button
                      type="button"
                      key={di}
                      onClick={() => handleDayClick(date)}
                      disabled={!date.isCurrentMonth}
                      aria-pressed={selectedDay === date.day && date.isCurrentMonth}
                      className={`calendar-day ${!date.isCurrentMonth ? 'is-other-month' : ''} ${date.status ? 'has-event' : ''} ${selectedDay === date.day && date.isCurrentMonth ? 'is-selected' : ''}`}
                    >
                      {date.day}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <p className="calendar-legend"><span className="calendar-legend__dot" aria-hidden="true" /> dias com encontro</p>
          </div>
        </section>
      </main>

      {isModalOpen && selectedEvent && (
        <div className="event-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="event-modal" role="dialog" aria-modal="true" aria-label={`Encontro com ${selectedEvent.matchName}`} onClick={(e) => e.stopPropagation()}>
            <button className="event-modal__close" onClick={() => setIsModalOpen(false)} aria-label="Fechar">
              <X size={18} aria-hidden="true" />
            </button>
            <div className="event-modal__media">
              <img
                src={fotoDe(selectedEvent) || avatarFallback(selectedEvent.matchName)}
                alt=""
                onError={(e) => { e.target.onerror = null; e.target.src = avatarFallback(selectedEvent.matchName); }}
              />
              <div className="event-modal__media-name"><h2>{selectedEvent.matchName}</h2></div>
            </div>
            <div className="event-modal__info">
              <span className={`event-status ${ehAgendado(selectedEvent) ? 'is-confirmed' : 'is-pending'}`}>
                {ehAgendado(selectedEvent) ? 'Encontro agendado' : 'Match confirmado'}
              </span>
              <h1 className="event-modal__title">{selectedEvent.titulo}</h1>
              <div className="event-modal__meta">
                <span className="event-modal__meta-icon"><CalendarDays size={16} aria-hidden="true" /></span>
                <div><label>{ehAgendado(selectedEvent) ? 'Data do encontro' : 'Data do match'}</label><p>{formatEventTime(selectedEvent.data_encontro)}</p></div>
              </div>
              <div className="event-modal__meta">
                <span className="event-modal__meta-icon"><MapPin size={16} aria-hidden="true" /></span>
                <div><label>Local</label><p>{selectedEvent.local}</p></div>
              </div>
              {selectedEvent.bio ? (
                <div className="event-modal__meta">
                  <span className="event-modal__meta-icon"><UserRound size={16} aria-hidden="true" /></span>
                  <div><label>Sobre</label><p>{selectedEvent.bio}</p></div>
                </div>
              ) : null}

              <div className="event-modal__actions">
                {selectedEvent.matchId ? (
                  <button className="btn-primary btn-block" onClick={() => navigate(`/chat/${selectedEvent.matchId}`)}>
                    <MessageCircle size={16} aria-hidden="true" /> Enviar mensagem
                  </button>
                ) : null}
                {ehAgendado(selectedEvent) ? (
                  <a
                    href={gerarLinkGoogleCalendar(selectedEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-block"
                    onClick={(e) => { if (gerarLinkGoogleCalendar(selectedEvent) === '#') e.preventDefault(); }}
                  >
                    <CalendarPlus size={16} aria-hidden="true" /> Salvar no Google Agenda
                  </a>
                ) : null}
                <button className="btn-ghost-danger btn-block" onClick={(e) => handleCancelEvent(e, selectedEvent)}>
                  Desistir do encontro
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