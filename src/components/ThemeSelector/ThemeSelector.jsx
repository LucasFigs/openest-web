// Seletor de tema: Claro / Escuro / Automático (segue o sistema).
import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/theme';
import './ThemeSelector.css';

const OPTIONS = [
  { mode: 'light', label: 'Claro', Icon: Sun },
  { mode: 'dark', label: 'Escuro', Icon: Moon },
  { mode: 'system', label: 'Automático', Icon: Monitor },
];

export default function ThemeSelector() {
  const { mode, setMode } = useTheme();
  return (
    <div className="theme-selector" role="radiogroup" aria-label="Tema do aplicativo" data-testid="theme-selector">
      {OPTIONS.map((option) => {
        const { mode: value, label } = option;
        const Icon = option.Icon;
        const selected = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            data-testid={`theme-option-${value}`}
            className={`theme-selector__option ${selected ? 'is-selected' : ''}`}
            onClick={() => setMode(value)}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
