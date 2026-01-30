import "./Article.css";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "./components/Header.tsx";
import AccessibleModal from "./components/AccessibleModal.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { Tag } from "./components/Tags.tsx";
import ReportForm from "./components/ReportForm.tsx";
import { CommentSection } from "./components/CommentSection.tsx";

function Article() {
  const { id } = useParams();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const API_URL =
    "https://conception-technique-creative-backend.onrender.com/api";

  /* 🎨 Thème */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* 📡 Récupération de l’article via la liste */
  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) {
          throw new Error("Erreur chargement articles");
        }

        const posts = await response.json();
        const foundArticle = posts.find(
          (post) => String(post.id) === String(id)
        );

        if (!foundArticle) {
          throw new Error("Article introuvable");
        }

        setArticle(foundArticle);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l’article.");
      }
    };

    fetchArticle();
  }, [id]);

  /* ⏳ Chargement */
  if (!article && !error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: "2rem" }}>Chargement de l’article…</p>
      </>
    );
  }

  /* ❌ Erreur */
  if (error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: "2rem" }}>{error}</p>
      </>
    );
  }

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <section className="article-container">
        <article className="article">
          {/* 🔙 Retour */}
          <Link to="/" className="article-link">
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Retour aux articles
          </Link>

          {/* 📄 Contenu */}
          <main className="article-text" id="main-content">
            {article.tag?.title && (
              <div className="tags">
                <Tag>{article.tag.title}</Tag>
              </div>
            )}

            <div className="main-container">
              <header className="article-detail-heading">
                <h1 id="article-title" className="article-title">
                  {article.title}
                </h1>
              </header>

              <p className="article-content">{article.description}</p>
            </div>
          </main>

          {/* 🧰 Actions */}
          <section className="article-tools" aria-label="Actions sur l’article">
            <div className="article-appreciation">
              <SquareButton
                className="sqr-button-dark-background"
                aria-label="Ajouter l’article aux favoris"
                onClick={() => console.log("Favori")}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  favorite
                </span>
              </SquareButton>

              <SquareButton
                className="sqr-button-dark-background"
                aria-expanded={commentsOpen}
                aria-controls="comments-container"
                aria-haspopup="region"
                aria-label="Afficher ou masquer les commentaires"
                onClick={() => setCommentsOpen((prev) => !prev)}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  sms
                </span>
              </SquareButton>
            </div>

            <SquareButton
              className="sqr-button-dark-background"
              aria-label="Signaler cet article"
              onClick={() => setIsModalOpen(true)}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                report
              </span>
            </SquareButton>
          </section>

          {/* 💬 Commentaires */}
          {commentsOpen && (
            <CommentSection
              id="comments-container"
              isOpen={commentsOpen}
              articleId={article.id}
            />
          )}
        </article>
      </section>

      {/* 🚨 Modale signalement */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signaler cet article"
      >
        <ReportForm
          onCancel={() => setIsModalOpen(false)}
          onSubmit={() => setIsModalOpen(false)}
        />
      </AccessibleModal>
    </>
  );
}

export default Article;
