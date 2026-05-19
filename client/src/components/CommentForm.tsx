import React, { FormEvent, useState } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/CommentForm.css"

interface CommentFormProps {
  onSubmit: (data: { titre: string; contenu: string }) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [contenu, setContenu] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ titre: "", contenu });
    setContenu("");
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
