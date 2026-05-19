import React, { useState, useContext, useEffect, useRef } from 'react';
import { PersonStanding } from 'lucide-react';
import { PreferencesContext } from '../contexts/PreferencesContext';
import '../styles/Accessibility.css';

const PANEL_TITLE_ID = 'accessibility-panel-title';

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const { dyslexicFont, setDyslexicFont, fontSize, setFontSize, highContrast, setHighContrast } = useContext(PreferencesContext);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const firstFocusable = panelRef.current?.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus();

    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function onDoc(e) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target) && !e.target.closest('.accessibility-btn')) {
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
        ref={triggerRef}
        type="button"
        className="accessibility-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Ouvrir le panneau d'accessibilité"
        onClick={() => setOpen((v) => !v)}
      >
        <PersonStanding size={18} aria-hidden="true" />
      </button>

      <div
        id="accessibility-panel"
        className="accessibility-panel"
        role="dialog"
        aria-modal={open}
        aria-labelledby={PANEL_TITLE_ID}
        ref={panelRef}
        hidden={!open}
      >
        <div className="accessibility-panel__header">
          <strong id={PANEL_TITLE_ID}>Accessibilité</strong>
          <button
            type="button"
            className="accessibility-panel__close"
            onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
            aria-label="Fermer le panneau d'accessibilité"
          >
            ×
          </button>
        </div>

        <div className="accessibility-panel__row">
          <label htmlFor="toggle-dys">Police adaptée (dyslexie)</label>
          <input
            id="toggle-dys"
            type="checkbox"
            checked={dyslexicFont}
            onChange={() => setDyslexicFont(!dyslexicFont)}
          />
        </div>

        <div className="accessibility-panel__row">
          <p id="font-size-label">Taille du texte</p>
          <div className="font-size-controls" role="group" aria-labelledby="font-size-label">
            <button
              type="button"
              aria-label="Réduire la taille du texte"
              onClick={() => setFontSize((s) => Math.max(12, s - 2))}
            >
              A-
            </button>
            <span aria-live="polite" aria-atomic="true">{fontSize}px</span>
            <button
              type="button"
              aria-label="Agrandir la taille du texte"
              onClick={() => setFontSize((s) => Math.min(24, s + 2))}
            >
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
            onChange={() => setHighContrast(!highContrast)}
          />
        </div>
      </div>
    </>
  );
}
