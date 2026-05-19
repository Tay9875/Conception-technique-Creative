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
