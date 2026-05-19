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
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="note-titre">
        <label htmlFor="titre">Titre</label>
        <input
          id="titre"
          type="text"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          required
          aria-required="true"
          aria-label="Titre de la note"
          placeholder="Mieux Dormir"
          className="textInput"
        />
      </div>

      <div className="note-contenu">
        <label htmlFor="contenu">Contenu</label>
        <textarea
          id="contenu"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          required
          aria-required="true"
          aria-label="Contenu de la note"
          placeholder="Écrivez vos notes ici..."
          className="textArea"
        />
      </div>

      <SquareButton className="sqr-button-dark-background btn-option" type="submit" aria-label="Enregistrer la note">Enregistrer</SquareButton>
    </form>
  );
}
