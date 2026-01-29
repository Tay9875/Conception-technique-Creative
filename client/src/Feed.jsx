import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./components/Header.tsx";
import "./Feed.css";

export default function Feed({ user }) {
  const navigate = useNavigate();
  const API_URL = "https://conception-technique-creative-backend.onrender.com/api";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagId, setTagId] = useState("");
  const [tags, setTags] = useState([]);

  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(false);

  const statusRef = useRef(null);

  /* 🔹 Récupération des tags */
  useEffect(() => {
    fetch(`${API_URL}/tags`)
      .then((res) => res.json())
      .then(setTags)
      .catch(console.error);
  }, []);

  /* 🔹 Focus lecteur d’écran sur message */
  useEffect(() => {
    if (statusMessage) {
      statusRef.current?.focus();
    }
  }, [statusMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setStatusMessage("");

    if (!title.trim() || !description.trim() || !tagId) {
      setError(true);
      setStatusMessage("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tag_id: tagId,
          user_id: user.id, // 🔥 obligatoire
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Erreur backend :", err);
        throw new Error("Erreur publication");
      }

      setStatusMessage("Article publié avec succès 🎉");
      setTitle("");
      setDescription("");
      setTagId("");

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(true);
      setStatusMessage("Une erreur est survenue lors de la publication.");
    }
  };

  return (
    <>
      <Header />

      <main className="feed-container" id="main-content">
        <header className="feed-header">
          <h1>Créer un article</h1>
          <p>Partage ton expérience avec la communauté 💬</p>
        </header>

        {/* Message d’état accessible */}
        {statusMessage && (
          <p
            ref={statusRef}
            tabIndex={-1}
            aria-live="assertive"
            className={`status-message ${error ? "error" : "success"}`}
          >
            {statusMessage}
          </p>
        )}

        <form className="feed-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tag">Catégorie *</label>
            <select
              id="tag"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              required
              aria-required="true"
            >
              <option value="">— Choisir une catégorie —</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Contenu *</label>
            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <button type="submit" className="btn-primary">
            Publier l’article
          </button>
        </form>
      </main>
    </>
  );
}
