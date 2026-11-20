// Contexto, hook e utilitários do tema (separados do ThemeProvider para o
// Fast Refresh do Vite funcionar). O provider fica em ThemeContext.jsx.
import { createContext, useContext } from 'react';

export const THEME_STORAGE_KEY = 'openest-theme-mode';
export const THEME_MODES = ['light', 'dark', 'system'];

export const prefersDark = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export function resolveScheme(mode, systemDark = prefersDark()) {
  if (mode === 'light' || mode === 'dark') return mode;
  return systemDark ? 'dark' : 'light';
}

export function readSavedMode() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_MODES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export const ThemeContext = createContext({
  mode: 'system',
  scheme: 'light',
  isDark: false,
  setMode: () => {},
  toggle: () => {},
});


export function useTheme() {
  return useContext(ThemeContext);
}
