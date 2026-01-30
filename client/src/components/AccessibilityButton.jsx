import React, { useState, useContext, useEffect, useRef } from 'react';
import { PersonStanding } from 'lucide-react';
import { PreferencesContext } from '../contexts/PreferencesContext';
import '../styles/Accessibility.css';

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const { dyslexicFont, setDyslexicFont, fontSize, setFontSize, highContrast, setHighContrast } = useContext(PreferencesContext);
  const panelRef = useRef(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    function onDoc(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target) && !e.target.closest('.accessibility-btn')) setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.addEventListener('mousedown', onDoc);
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="accessibility-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ouvrir le panneau d'accessibilité"
        onClick={() => setOpen(!open)}
      >
        <PersonStanding size={18} />
      </button>

      {open && (
        <div className="accessibility-panel" role="dialog" aria-modal="true" ref={panelRef}>
          <header className="accessibility-panel__header">
            <strong>Accessibilité</strong>
            <button className="accessibility-panel__close" onClick={() => setOpen(false)} aria-label="Fermer le panneau">×</button>
          </header>

          <div className="accessibility-panel__row">
            <label htmlFor="toggle-dys">Police adaptée (dyslexie)</label>
            <input id="toggle-dys" type="checkbox" checked={dyslexicFont} onChange={() => setDyslexicFont(!dyslexicFont)} />
          </div>

          <div className="accessibility-panel__row">
            <label>Taille du texte</label>
            <div className="font-size-controls">
              <button type="button" onClick={() => setFontSize((s) => Math.max(12, s - 2))}>A-</button>
              <span>{fontSize}px</span>
              <button type="button" onClick={() => setFontSize((s) => Math.min(24, s + 2))}>A+</button>
            </div>
          </div>

          <div className="accessibility-panel__row">
            <label htmlFor="toggle-contrast">Contraste élevé</label>
            <input id="toggle-contrast" type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} />
          </div>
        </div>
      )}
    </>
  );
}
