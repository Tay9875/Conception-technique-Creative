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
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-contenu">
        <label htmlFor="contenu" className="label">Commentaires</label>
        <textarea
          id="contenu"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          required
          aria-required="true"
          aria-label="Contenu de la comment"
          placeholder="Écrivez vos commentaires ici..."
          className="textArea"
        />
      </div>

      <SquareButton className="sqr-button-dark-background btn-option" type="submit" aria-label="Enregistrer la comment">Enregistrer</SquareButton>
    </form>
  );
}
