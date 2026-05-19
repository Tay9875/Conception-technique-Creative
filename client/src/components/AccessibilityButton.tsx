import React, { useEffect, useRef, useState } from 'react';
import { PersonStanding } from 'lucide-react';
import { usePreferences } from '../contexts/PreferencesContext';
import '../styles/Accessibility.css';

export default function AccessibilityButton() {
  const [open, setOpen] = useState<boolean>(false);
  const {
    dyslexicFont,
    toggleDyslexicFont,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    highContrast,
    toggleHighContrast,
  } = usePreferences();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    function onDoc(e: MouseEvent): void {
      const target = e.target as HTMLElement | null;
      if (!panelRef.current || !target) return;
      if (!panelRef.current.contains(target) && !target.closest('.accessibility-btn')) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDoc);
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
        onClick={() => setOpen((prev) => !prev)}
      >
        <PersonStanding size={18} />
      </button>

      {open && (
        <div className="accessibility-panel" role="dialog" aria-modal="true" ref={panelRef}>
          <header className="accessibility-panel__header">
            <strong>Accessibilité</strong>
            <button
              className="accessibility-panel__close"
              onClick={() => setOpen(false)}
              aria-label="Fermer le panneau"
            >
              ×
            </button>
          </header>

          <div className="accessibility-panel__row">
            <label htmlFor="toggle-dys">Police adaptée (dyslexie)</label>
            <input
              id="toggle-dys"
              type="checkbox"
              checked={dyslexicFont}
              onChange={toggleDyslexicFont}
            />
          </div>

          <div className="accessibility-panel__row">
            <label>Taille du texte</label>
            <div className="font-size-controls">
              <button type="button" onClick={decreaseFontSize} aria-label="Diminuer la taille du texte">
                A-
              </button>
              <span>{fontSize}px</span>
              <button type="button" onClick={increaseFontSize} aria-label="Augmenter la taille du texte">
                A+
              </button>
            </div>
          </div>

          <div className="accessibility-panel__row">
            <label htmlFor="toggle-contrast">Contraste élevé</label>
            <input
              id="toggle-contrast"
              type="checkbox"
              checked={highContrast}
              onChange={toggleHighContrast}
            />
          </div>
        </div>
      )}
    </>
  );
}
