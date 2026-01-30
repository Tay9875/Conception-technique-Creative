import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BlogCard.css";

// Composant Tag simple
const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="tag-badge">{children}</span>
);

interface Article {
  id: number;
  title: string;
  description: string;
  created_at: string;
  firstname?: string;
  lastname?: string;
  tag_title?: string;
  like_count?: number;
  is_liked?: number;
  tag?: { title: string };
}

interface BlogCardProps {
  article: Article;
  user?: any;
}

export const BlogCard: React.FC<BlogCardProps> = ({ article, user }) => {
  const navigate = useNavigate();

  // --- ÉTATS ---
  const [isLiked, setIsLiked] = useState(article.is_liked === 1);
  const [likesCount, setLikesCount] = useState(article.like_count || 0);
  
  // État pour cacher le post s'il vient d'être banni
  const [isVisible, setIsVisible] = useState(true);

  const titleId = `blog-title-${article.id}`;
  const API_URL = "https://conception-technique-creative-backend.onrender.com/api";
  // const API_URL = "http://localhost:3000/api";

  // --- GESTION DU LIKE ---
  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!user || !user.id) return alert("Veuillez vous connecter pour aimer un article.");

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await fetch(`${API_URL}/posts/${article.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- GESTION DU SIGNALEMENT (NOUVEAU) ---
  const handleReport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Empêche d'ouvrir l'article

    if (!user || !user.id) return alert("Veuillez vous connecter pour signaler un contenu.");

    if (!window.confirm("Voulez-vous vraiment signaler ce contenu comme inapproprié ?")) return;

    try {
      const response = await fetch(`${API_URL}/posts/${article.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        // Si le post est banni (3ème signalement), on le cache visuellement
        if (data.banned) {
          setIsVisible(false);
        }
      } else {
        alert("Erreur : " + data.message);
      }
    } catch (error) {
      console.error("Erreur report:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/article/${article.id}`);
  };

  // Gestion des noms et tags
  const authorName =
    article.firstname && article.lastname
      ? `${article.firstname} ${article.lastname}`
      : "Anonyme";

  const displayTag =
    article.tag_title || (article.tag ? article.tag.title : null);

  // Si le post est banni/caché, on ne rend rien
  if (!isVisible) return null;

  return (
    <article
      className="blogcard"
      aria-labelledby={titleId}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="text">
        {/* TAG */}
        <div className="blogcard-tags">
          {displayTag && <Tag>{displayTag}</Tag>}
        </div>

        {/* CONTENU */}
        <div className="blogcard-container">
          <header className="heading">
            <h3 id={titleId} className="blogcard-title">
              {article.title}
            </h3>
          </header>

          <p className="blogcard-paragraph">{article.description}</p>
        </div>

        {/* FOOTER */}
        <footer className="blogcard-tools">
          <div className="blogcard-infos">
            <p className="blogcard-author">
              <span className="material-symbols-outlined" aria-hidden="true">
                person
              </span>
              <span
                className="author-name"
                style={{ marginLeft: "6px", fontWeight: "500" }}
              >
                {authorName}
              </span>
            </p>

            <time className="date" dateTime={article.created_at}>
              {new Date(article.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>

          <div className="blogcard-action">
            {/* ❤️ FAVORI */}
            <button
              type="button"
              className="transparent-btn"
              aria-pressed={isLiked}
              aria-label={
                isLiked ? "Retirer des favoris" : "Ajouter aux favoris"
              }
              onClick={handleLike}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {isLiked ? "favorite" : "favorite_border"}
              </span>
              <span aria-live="polite">{likesCount}</span>
            </button>

            {/* 💬 COMMENTAIRES */}
            <Link
              to={`/article/${article.id}#comments`}
              className="transparent-btn"
              onClick={(e) => e.stopPropagation()}
              aria-label="Voir les commentaires"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                sms
              </span>
            </Link>

            {/* 🚩 SIGNALEMENT (NOUVEAU) */}
            <button
              type="button"
              className="transparent-btn"
              onClick={handleReport}
              aria-label="Signaler ce contenu"
              title="Signaler"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "1.3rem" }} // Légèrement ajusté si besoin
              >
                flag
              </span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
};