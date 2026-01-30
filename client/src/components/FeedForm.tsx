import React, { FormEvent, useState } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/FeedForm.css";

interface FeedFormProps {
  tags: Array<{ id: number; title: string }>;
  onSubmit: (data: {
    title: string;
    description: string;
    tag_id: string;
  }) => void;
}

export default function FeedForm({ tags, onSubmit }: FeedFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagId, setTagId] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      tag_id: tagId,
    });
  };

  return (
    <form className="feed-form" onSubmit={handleSubmit} noValidate>
      {/* TITRE */}
      <div className="feed-field">
        <label htmlFor="title">Titre de l’article</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-required="true"
          className="textInput"
          placeholder="Ex : Gérer la fatigue au quotidien"
        />
      </div>

      {/* CATÉGORIE */}
      <div className="feed-field">
        <label htmlFor="tag">Catégorie</label>
        <select
          id="tag"
          value={tagId}
          onChange={(e) => setTagId(e.target.value)}
          required
          aria-required="true"
          className="textInput"
        >
          <option value="">— Choisir une catégorie —</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.title}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENU */}
      <div className="feed-field">
        <label htmlFor="description">Contenu</label>
        <textarea
          id="description"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          aria-required="true"
          className="textArea"
          placeholder="Partagez votre expérience, vos conseils, votre ressenti…"
        />
      </div>

      <SquareButton
        type="submit"
        className="sqr-button-dark-background feed-btn-option"
        aria-label="Publier l’article"
      >
        Publier l’article
      </SquareButton>
    </form>
  );
}
