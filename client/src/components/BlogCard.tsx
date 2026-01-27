import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BlogCard.css";
import { Tag } from "./Tags.tsx";

export const BlogCard: React.FC = () => {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // empêche la navigation

    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // 🔜 prêt pour le fetch
    /*
    fetch("/api/favorites", {
      method: isLiked ? "DELETE" : "POST",
      body: JSON.stringify({ articleId }),
    });
    */
  };

  const handleCardClick = () => {
    navigate("/article");
  };

  return (
    <article
      className="blogcard"
      aria-labelledby="blog-title"
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      <div className="text">
        <div className="blogcard-tags">
          <Tag>Bien-être</Tag>
        </div>

        <div className="blogcard-container">
          <header className="heading">
            <h3 id="blog-title" className="blogcard-title">
              Commentaires sur la gestion du stress pendant les traitements
            </h3>
          </header>

          <p className="blogcard-paragraph">
            J'ai trouvé que la méditation et les exercices de respiration m'ont beaucoup aidé à gérer le stress lié aux traitements. Cela m'a permis de rester plus calme et concentré sur mon rétablissement.
          </p>
        </div>

        <footer className="blogcard-tools">
          <div className="blogcard-infos">
            <p className="blogcard-author">
              <span className="material-symbols-outlined" aria-hidden="true">
                person
              </span>
              <span className="sr-only">Marie D.</span>
            </p>

            <time className="date" dateTime="2024-06-12">
              12 juin 2024
            </time>
          </div>

          <div className="blogcard-action">
            {/* ❤️ FAVORI */}
            <button
              type="button"
              className="transparent-btn"
              aria-pressed={isLiked}
              aria-label={
                isLiked
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"
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
              to="/article#comments"
              className="transparent-btn"
              aria-label="Voir les commentaires"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                sms
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
};
