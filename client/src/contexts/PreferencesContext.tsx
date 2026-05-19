import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PreferencesContextValue } from '../types/preferences';

const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 24;
const FONT_SIZE_STEP = 2;
const FONT_SIZE_DEFAULT = 16;

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v === null) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable (Safari private mode, SSR, etc.)
  }
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null);

interface PreferencesProviderProps {
  children: React.ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [dyslexicFont, setDyslexicFont] = useState<boolean>(() =>
    readLocalStorage<boolean>('dyslexicFont', false)
  );
  const [fontSize, setFontSize] = useState<number>(() =>
    readLocalStorage<number>('fontSize', FONT_SIZE_DEFAULT)
  );
  const [highContrast, setHighContrast] = useState<boolean>(() =>
    readLocalStorage<boolean>('highContrast', false)
  );

  useEffect(() => {
    writeLocalStorage('dyslexicFont', dyslexicFont);
    document.body.classList.toggle('dyslexic-font', dyslexicFont);
  }, [dyslexicFont]);

  useEffect(() => {
    writeLocalStorage('fontSize', fontSize);
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    writeLocalStorage('highContrast', highContrast);
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  const increaseFontSize = useCallback(
    () => setFontSize((v) => Math.min(FONT_SIZE_MAX, v + FONT_SIZE_STEP)),
    []
  );
  const decreaseFontSize = useCallback(
    () => setFontSize((v) => Math.max(FONT_SIZE_MIN, v - FONT_SIZE_STEP)),
    []
  );
  const toggleDyslexicFont = useCallback(() => setDyslexicFont((v) => !v), []);
  const toggleHighContrast = useCallback(() => setHighContrast((v) => !v), []);

  const value: PreferencesContextValue = {
    dyslexicFont,
    fontSize,
    highContrast,
    setDyslexicFont,
    setFontSize,
    setHighContrast,
    increaseFontSize,
    decreaseFontSize,
    toggleDyslexicFont,
    toggleHighContrast,
  };

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
}

export default PreferencesContext;
