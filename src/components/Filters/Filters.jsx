import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import './Filters.css';

const STATUS_OPTIONS = ['Solteiro(a)', 'Aberto(a)', 'Poliamor', 'Enrolado(a)'];
const INTEREST_OPTIONS = ['Games', 'Música', 'Esportes', 'Culinária', 'Viagens', 'Netflix'];

const DEFAULT_FILTERS = {
  ageRange: [18, 40],
  distance: 50,
  relationshipStatus: [],
  interests: [],
};

const toggleItem = (list, item) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

// Painel de filtros da Descoberta: folha que sobe da base no celular e
// janela centralizada no computador. Fecha no X, no Esc ou clicando fora.
const Filters = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters || DEFAULT_FILTERS);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClear = () => {
    setFilters({ ageRange: [18, 99], distance: 100, relationshipStatus: [], interests: [] });
  };

  const setAge = (index, value) => {
    const next = [...filters.ageRange];
    next[index] = value === '' ? '' : Number(value);
    setFilters({ ...filters, ageRange: next });
  };

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div
        className="filter-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="filter-header">
          <button type="button" className="filter-close-btn" onClick={onClose} aria-label="Fechar filtros">
            <X size={20} aria-hidden="true" />
          </button>
          <h2 id="filter-title">Filtros</h2>
          <button type="button" className="clear-text-btn" onClick={handleClear}>Limpar</button>
        </header>

        <div className="filter-content">
          <section className="filter-section">
            <div className="section-label">
              <label htmlFor="filter-distance">Distância máxima</label>
              <span className="value-tag">{filters.distance} km</span>
            </div>
            <input
              id="filter-distance"
              type="range"
              min="1"
              max="100"
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: Number(e.target.value) })}
              className="purple-slider"
            />
          </section>

          <section className="filter-section">
            <div className="section-label">
              <span>Faixa etária</span>
              <span className="value-tag">{filters.ageRange[0]} – {filters.ageRange[1]} anos</span>
            </div>
            <div className="range-inputs">
              <input
                type="number"
                min="18"
                max="99"
                aria-label="Idade mínima"
                value={filters.ageRange[0]}
                onChange={(e) => setAge(0, e.target.value)}
              />
              <span>até</span>
              <input
                type="number"
                min="18"
                max="99"
                aria-label="Idade máxima"
                value={filters.ageRange[1]}
                onChange={(e) => setAge(1, e.target.value)}
              />
            </div>
          </section>

          <section className="filter-section">
            <div className="section-label"><span>Status de relacionamento</span></div>
            <div className="checkbox-grid">
              {STATUS_OPTIONS.map((status) => (
                <label key={status} className="check-item">
                  <input
                    type="checkbox"
                    checked={filters.relationshipStatus.includes(status)}
                    onChange={() => setFilters((prev) => ({
                      ...prev,
                      relationshipStatus: toggleItem(prev.relationshipStatus, status),
                    }))}
                  />
                  <span className="check-label">{status}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="filter-section">
            <div className="section-label"><span>Interesses</span></div>
            <div className="tags-container">
              {INTEREST_OPTIONS.map((tag) => {
                const active = filters.interests.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    className={`tag-btn ${active ? 'active' : ''}`}
                    aria-pressed={active}
                    onClick={() => setFilters((prev) => ({ ...prev, interests: toggleItem(prev.interests, tag) }))}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="filter-footer">
          <button type="button" className="apply-btn" onClick={() => onApply(filters)}>
            Aplicar filtros
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Filters;
