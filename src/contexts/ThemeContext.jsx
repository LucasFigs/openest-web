// Tema do web (Claro / Escuro / Automático), salvo no localStorage.
//
// - `mode`: escolha do usuário ('light' | 'dark' | 'system').
// - `scheme`: o que vale agora ('light' | 'dark'); no automático acompanha
//   o sistema e muda junto com ele.
// O tema é aplicado como `data-theme` no <html>; as cores vêm das variáveis
// CSS em src/styles/theme.css. O index.html aplica o tema salvo antes do
// React montar, então não há "piscada" do tema errado.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { THEME_MODES, THEME_STORAGE_KEY, ThemeContext, prefersDark, readSavedMode, resolveScheme } from './theme';

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readSavedMode);
  const [systemDark, setSystemDark] = useState(prefersDark);

  // Acompanha a troca de tema do sistema (vale no modo Automático).
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => setSystemDark(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  const scheme = resolveScheme(mode, systemDark);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', scheme);
    // Liga a transição suave só depois do primeiro desenho.
    const id = window.requestAnimationFrame(() => root.classList.add('theme-ready'));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', scheme === 'dark' ? '#0f0d15' : '#6d28d9');
    return () => window.cancelAnimationFrame(id);
  }, [scheme]);

  const setMode = useCallback((next) => {
    if (!THEME_MODES.includes(next)) return;
    setModeState(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // armazenamento indisponível (aba anônima): vale só para esta sessão
    }
  }, []);

  const toggle = useCallback(() => setMode(scheme === 'dark' ? 'light' : 'dark'), [scheme, setMode]);

  const value = useMemo(
    () => ({ mode, scheme, isDark: scheme === 'dark', setMode, toggle }),
    [mode, scheme, setMode, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
