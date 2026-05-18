import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./components/Header.tsx";
import FeedForm from "./components/FeedForm.tsx";
import "./Feed.css";
import { API_URL } from "./config/api";
import { apiFetch } from "./lib/apiClient";

export default function Feed({ user }) {
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const statusRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* 🔹 Récupération des tags */
  useEffect(() => {
    apiFetch(`${API_URL}/tags`).then(setTags).catch(console.error);
  }, []);

  /* 🔹 Focus lecteur d’écran sur message */
  useEffect(() => {
    if (statusMessage) {
      statusRef.current?.focus();
    }
  }, [statusMessage]);

  const handleCreatePost = async ({ title, description, tag_id }) => {
    setError(false);
    setStatusMessage("");

    try {
      await apiFetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ title, description, tag_id }),
      });

      setStatusMessage("Article publié avec succès 🎉");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(true);
      setStatusMessage("Une erreur est survenue lors de la publication.");
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main className="feed-container" id="main-content">
        <section className="feed-card" aria-labelledby="feed-title">
            <header className="feed-header">
                <h1 className="feed-h1">Créer un article</h1>
                <p>Partage ton expérience avec la communauté</p>
                </header>

                {/* Message accessible */}
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

                <FeedForm tags={tags} onSubmit={handleCreatePost} />
        </section>
      </main>
    </>
  );
}
