import { Square } from "lucide-react";
import React, { FormEvent, useState } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/CommentForm.css"

interface CommentFormProps {
  onSubmit: (data: { titre: string; contenu: string }) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ titre, contenu });
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