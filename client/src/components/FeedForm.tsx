// client/src/components/FeedForm.tsx
import React, { FormEvent, useState, useEffect } from "react";
import { SquareButton } from "./SquareButton.tsx";
import "../styles/FeedForm.css";

interface Tag {
  id: string | number;
  title: string;
}

interface FeedFormProps {
  tags: Tag[];
  onSubmit: (data: { title: string; description: string; tag_id: string | number }) => void;
}

export default function FeedForm({ tags, onSubmit }: FeedFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState(tags.length > 0 ? tags[0].id : "");

  useEffect(() => {
    if (tags.length > 0 && !tag) {
      setTag(tags[0].id);
    }
  }, [tags, tag]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description || !tag) return;

    onSubmit({ title, description, tag_id: tag });
    setTitle("");
    setDescription("");
    setTag(tags.length > 0 ? tags[0].id : "");
  };

  return (
    <form className="feed-form" onSubmit={handleSubmit} aria-labelledby="create-post-title">
      <h2 id="create-post-title" className="sr-only">Créer un nouvel article</h2>

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
          placeholder="Mon expérience..."
        />
      </div>

      <div className="feed-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          aria-required="true"
          className="textArea"
          rows={4}
          placeholder="Racontez-nous votre expérience..."
        />
      </div>

      <div className="feed-field">
        <label htmlFor="tag">Catégorie</label>
        <select
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          required
          aria-required="true"
          className="textInput"
        >
          {tags.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <SquareButton
        type="submit"
        className="sqr-button-dark-background btn-option"
        aria-label="Publier cet article"
      >
        Publier
      </SquareButton>
    </form>
  );
}
