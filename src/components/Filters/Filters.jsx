import React, { useState } from 'react';
import './Filters.css';

const Filters = ({ isOpen, onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters || {
    ageRange: [18, 40],
    distance: 50,
    relationshipStatus: [],
    interests: []
  });

  if (!isOpen) return null;

  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      relationshipStatus: prev.relationshipStatus.includes(status)
        ? prev.relationshipStatus.filter(s => s !== status)
        : [...prev.relationshipStatus, status]
    }));
  };

  const handleClear = () => {
    setFilters({
      ageRange: [18, 99],
      distance: 100,
      relationshipStatus: [],
      interests: []
    });
  };

  return (
    <div className="filter-overlay">
      <div className="filter-modal">
        <header className="filter-header">
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>Filtros</h2>
          <button className="clear-text-btn" onClick={handleClear}>Limpar</button>
        </header>

        <div className="filter-content">
          {/* DISTÂNCIA */}
          <section className="filter-section">
            <div className="section-label">
              <span>Distância Máxima</span>
              <span className="value-tag">{filters.distance} km</span>
            </div>
            <input 
              type="range" 
              min="1" max="100" 
              value={filters.distance} 
              onChange={(e) => setFilters({...filters, distance: e.target.value})}
              className="purple-slider"
            />
          </section>

          {/* IDADE */}
          <section className="filter-section">
            <div className="section-label">
              <span>Faixa Etária</span>
              <span className="value-tag">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
            </div>
            <div className="range-inputs">
              <input 
                type="number" 
                value={filters.ageRange[0]} 
                onChange={(e) => setFilters({...filters, ageRange: [e.target.value, filters.ageRange[1]]})}
              />
              <span>até</span>
              <input 
                type="number" 
                value={filters.ageRange[1]} 
                onChange={(e) => setFilters({...filters, ageRange: [filters.ageRange[0], e.target.value]})}
              />
            </div>
          </section>

          {/* STATUS DE RELACIONAMENTO */}
          <section className="filter-section">
            <div className="section-label">Status de Relacionamento</div>
            <div className="checkbox-grid">
              {['Solteiro(a)', 'Aberto(a)', 'Poliamor', 'Enrolado(a)'].map(status => (
                <label key={status} className="check-item">
                  <input 
                    type="checkbox" 
                    checked={filters.relationshipStatus.includes(status)}
                    onChange={() => handleStatusChange(status)}
                  />
                  <span className="check-label">{status}</span>
                </label>
              ))}
            </div>
          </section>

          {/* INTERESSES (TAGS) */}
          <section className="filter-section">
            <div className="section-label">Interesses</div>
            <div className="tags-container">
              {['Games', 'Música', 'Esportes', 'Culinária', 'Viagens', 'Netflix'].map(tag => (
                <button 
                  key={tag}
                  className={`tag-btn ${filters.interests.includes(tag) ? 'active' : ''}`}
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      interests: prev.interests.includes(tag) 
                        ? prev.interests.filter(t => t !== tag) 
                        : [...prev.interests, tag]
                    }));
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="filter-footer">
          <button className="apply-btn" onClick={() => onApply(filters)}>
            Aplicar Filtros
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Filters;