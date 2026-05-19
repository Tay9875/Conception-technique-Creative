import { FormEvent, useState } from 'react';
import { SquareButton } from './SquareButton';
import '../styles/CommentForm.css';

export interface CommentFormData {
  titre: string;
  contenu: string;
}

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [contenu, setContenu] = useState<string>('');

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (!contenu) return;
    onSubmit({ titre: '', contenu });
    setContenu('');
  };

  return (
    <form
      className="comment-form"
      onSubmit={handleSubmit}
      aria-labelledby="comment-form-title"
    >
      <h3 id="comment-form-title" className="sr-only">Ajouter un commentaire</h3>

      <div className="comment-contenu">
        <label htmlFor="comment-contenu">Votre commentaire</label>
        <textarea
          id="comment-contenu"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          required
          aria-required="true"
          placeholder="Écrivez votre commentaire ici…"
          className="textArea"
        />
      </div>

      <SquareButton
        className="sqr-button-dark-background btn-option"
        type="submit"
        aria-label="Publier le commentaire"
      >
        Publier
      </SquareButton>
    </form>
  );
}
