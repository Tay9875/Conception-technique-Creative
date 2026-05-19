import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/AccessibleModal.css';
import { SquareButton } from './SquareButton';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function getOrCreateModalRoot(): HTMLElement {
  let modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
}

export default function AccessibleModal({
  isOpen,
  onClose,
  title,
  children,
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const titleIdRef = useRef<string>(`modal-title-${Math.random().toString(36).slice(2, 11)}`);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    document.body.style.overflow = "hidden";

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements?.[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "Tab" && focusableElements?.length) {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalRoot = getOrCreateModalRoot();

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleIdRef.current}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={modalRef} className="modal-content">
        <div className="modal-heading">
          <h2 id={titleIdRef.current}>{title}</h2>
          <SquareButton
            className="sqr-button-dark-background"
            onClick={onClose}
            aria-label={`Fermer - ${title}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </SquareButton>
        </div>
        <div className="modal-form">{children}</div>
      </div>
    </div>,
    modalRoot
  );
}
