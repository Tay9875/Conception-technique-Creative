import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BlogCard.css";
import { Tag } from "./Tags.tsx";

interface Article {
  id: number;
  title: string;
  description: string;
  created_at: string;
  author?: string;
  tag?: {
    title: string;
  };
}

interface BlogCardProps {
  article: Article;
}

export const BlogCard: React.FC<BlogCardProps> = ({ article }) => {
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const titleId = `blog-title-${article.id}`;

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleCardClick = () => {
    navigate(`/article/${article.id}`);
  };

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
          {article.tag && <Tag>{article.tag.title}</Tag>}
        </div>

        {/* CONTENU */}
        <div className="blogcard-container">
          <header className="heading">
            <h3 id={titleId} className="blogcard-title">
              {article.title}
            </h3>
          </header>

          <p className="blogcard-paragraph">
            {article.description}
          </p>
        </div>

        {/* FOOTER */}
        <footer className="blogcard-tools">
          <div className="blogcard-infos">
            <p className="blogcard-author">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                person
              </span>
              <span className="sr-only">
                Auteur : {article.author || "Utilisateur"}
              </span>
            </p>

            <time
              className="date"
              dateTime={article.created_at}
            >
              {new Date(article.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
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
                isLiked
                  ? "Retirer cet article des favoris"
                  : "Ajouter cet article aux favoris"
              }
              onClick={handleLike}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                {isLiked ? "favorite" : "favorite_border"}
              </span>
              <span aria-live="polite">{likesCount}</span>
            </button>

            {/* 💬 COMMENTAIRES */}
            <Link
              to={`/article/${article.id}#comments`}
              className="transparent-btn"
              aria-label="Voir les commentaires de cet article"
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                sms
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
};
