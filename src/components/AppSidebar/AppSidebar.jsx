// Navegação lateral do app (Descobrir, Conversas, Encontros, Ajustes).
// Antes cada página tinha a sua cópia, com caracteres (✉ ♥) como ícones e,
// no Descobrir, os três botões marcados como ativos ao mesmo tempo. Aqui o
// item ativo vem da rota atual e os ícones são vetoriais (Lucide).
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Flame, MessageCircle, Settings, ShieldAlert } from 'lucide-react';
import './AppSidebar.css';

const ITEMS = [
  { path: '/discovery', label: 'Descobrir', Icon: Flame },
  { path: '/chat', label: 'Conversas', Icon: MessageCircle },
  { path: '/events', label: 'Encontros', Icon: CalendarDays },
];

function Initials({ name }) {
  const ini = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return <span className="app-sidebar__initials">{ini || '?'}</span>;
}

// `badges`: contadores por rota, ex.: { '/chat': 3 }.
export default function AppSidebar({ user, onReport, badges = {} }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [fotoFalhou, setFotoFalhou] = useState(false);
  const foto = user?.foto || user?.foto_url || null;

  return (
    <aside className="app-sidebar" aria-label="Navegação principal">
      <button
        type="button"
        className="app-sidebar__avatar"
        onClick={() => navigate('/edit-profile')}
        aria-label="Editar perfil"
        title="Editar perfil"
      >
        {foto && !fotoFalhou ? (
          <img src={foto} alt="" onError={() => setFotoFalhou(true)} draggable={false} />
        ) : (
          <Initials name={user?.name} />
        )}
      </button>

      <nav className="app-sidebar__nav">
        {ITEMS.map((item) => {
          const ativo = pathname.startsWith(item.path);
          const Icon = item.Icon;
          return (
            <button
              key={item.path}
              type="button"
              className={`app-sidebar__item ${ativo ? 'is-active' : ''}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={ativo ? 'page' : undefined}
              title={item.label}
            >
              <Icon size={22} aria-hidden="true" />
              {badges[item.path] > 0 ? (
                <span className="app-sidebar__badge" aria-label={`${badges[item.path]} novas`}>
                  {badges[item.path] > 99 ? '99+' : badges[item.path]}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="app-sidebar__footer">
        <button
          type="button"
          className={`app-sidebar__item ${pathname.startsWith('/settings') ? 'is-active' : ''}`}
          onClick={() => navigate('/settings')}
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings size={21} aria-hidden="true" />
        </button>
        {onReport ? (
          <button type="button" className="app-sidebar__item" onClick={onReport} aria-label="Segurança e denúncias" title="Segurança e denúncias">
            <ShieldAlert size={21} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}
