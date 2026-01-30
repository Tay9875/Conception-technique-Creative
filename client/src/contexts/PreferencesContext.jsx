import React, { createContext, useState, useEffect } from 'react';

export const PreferencesContext = createContext({});

export function PreferencesProvider({ children }) {
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    try {
      const v = localStorage.getItem('dyslexicFont');
      return v !== null ? JSON.parse(v) : false;
    } catch {
      return false;
    }
  });

  const [fontSize, setFontSize] = useState(() => {
    try {
      const v = localStorage.getItem('fontSize');
      return v !== null ? JSON.parse(v) : 16;
    } catch {
      return 16;
    }
  });

  const [highContrast, setHighContrast] = useState(() => {
    try {
      const v = localStorage.getItem('highContrast');
      return v !== null ? JSON.parse(v) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try { localStorage.setItem('dyslexicFont', JSON.stringify(dyslexicFont)); } catch {}
    document.body.classList.toggle('dyslexic-font', dyslexicFont);
  }, [dyslexicFont]);

  useEffect(() => {
    try { localStorage.setItem('fontSize', JSON.stringify(fontSize)); } catch {}
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    try { localStorage.setItem('highContrast', JSON.stringify(highContrast)); } catch {}
    document.body.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  return (
    <PreferencesContext.Provider value={{ dyslexicFont, setDyslexicFont, fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export default PreferencesContext;
