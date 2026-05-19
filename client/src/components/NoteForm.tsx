import React, { FormEvent, useState } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/NoteForm.css"

interface NoteFormProps {
  onSubmit: (data: { titre: string; contenu: string }) => void;
}

export default function NoteForm({ onSubmit }: NoteFormProps) {
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ titre, contenu });
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
