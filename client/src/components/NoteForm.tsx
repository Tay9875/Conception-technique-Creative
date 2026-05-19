import { FormEvent, useState } from 'react';
import { SquareButton } from './SquareButton';
import '../styles/NoteForm.css';
import type { Tag } from '../types';

export interface NoteFormData {
  titre: string;
  contenu: string;
}

interface NoteFormProps {
  onSubmit: (data: NoteFormData) => void;
  tags?: Tag[];
}

export default function NoteForm({ onSubmit }: NoteFormProps) {
  const [titre, setTitre] = useState<string>('');
  const [contenu, setContenu] = useState<string>('');

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!titre || !contenu) return;
    onSubmit({ titre, contenu });
    setTitre('');
    setContenu('');
  };

  return (
    <form
      className="note-form"
      onSubmit={handleSubmit}
      aria-labelledby="note-form-title"
    >
      <h3 id="note-form-title" className="sr-only">Créer une nouvelle note</h3>

      <div className="note-titre">
        <label htmlFor="note-titre-input">Titre</label>
        <input
          id="note-titre-input"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
          aria-required="true"
          placeholder="Mieux Dormir"
          className="textInput"
        />
      </div>

      <div className="note-contenu">
        <label htmlFor="note-contenu-input">Contenu</label>
        <textarea
          id="note-contenu-input"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          required
          aria-required="true"
          placeholder="Écrivez vos notes ici…"
          className="textArea"
        />
      </div>

      <SquareButton
        className="sqr-button-dark-background btn-option"
        type="submit"
        aria-label="Enregistrer la note"
      >
        Enregistrer
      </SquareButton>
    </form>
  );
}
