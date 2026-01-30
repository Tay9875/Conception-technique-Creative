import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BlogCard.css";
// import { Tag } from "./Tags"; // Utilise ton composant Tag si tu l'as
// Sinon un simple span suffit pour le moment :
const Tag = ({ children }: { children: React.ReactNode }) => <span className="tag-badge">{children}</span>;

// Mise à jour de l'interface pour correspondre à ton Backend SQL
interface Article {
  id: number;
  title: string;
  description: string;
  created_at: string;
  firstname?: string; // Ajouté
  lastname?: string;  // Ajouté
  tag_title?: string; // SQL renvoie souvent ça avec un JOIN
  like_count?: number;
  is_liked?: number; // 0 ou 1
  tag?: { title: string }; // Cas où l'API renvoie un objet imbriqué
}

interface BlogCardProps {
  article: Article;
  user?: any; // Pour gérer l'authentification du like
}

export const BlogCard: React.FC<BlogCardProps> = ({ article, user }) => {
  const navigate = useNavigate();

  // Initialisation avec les données du backend
  const [isLiked, setIsLiked] = useState(article.is_liked === 1);
  const [likesCount, setLikesCount] = useState(article.like_count || 0);

  const titleId = `blog-title-${article.id}`;
  const API_URL = "https://conception-technique-creative-backend.onrender.com/api"; 
  // const API_URL = "http://localhost:3000/api";

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    // UI Optimiste
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    if (user && user.id) {
        try {
            await fetch(`${API_URL}/posts/${article.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
        } catch (error) { console.error(error); }
    }
  };

  const handleCardClick = () => {
    navigate(`/article/${article.id}`);
  };

  // Gestion du nom de l'auteur
  const authorName = article.firstname && article.lastname 
    ? `${article.firstname} ${article.lastname}` 
    : "Anonyme";

  // Gestion du titre du Tag (supporte les deux formats API)
  const displayTag = article.tag_title || (article.tag ? article.tag.title : null);

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

          <p className="blogcard-paragraph">
            {article.description}
          </p>
        </div>

        {/* FOOTER */}
        <footer className="blogcard-tools">
          <div className="blogcard-infos">
            <p className="blogcard-author">
              <span className="material-symbols-outlined" aria-hidden="true">
                person
              </span>
              {/* ICI : On affiche le nom visuellement */}
              <span className="author-name" style={{ marginLeft: '6px', fontWeight: '500' }}>
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
              aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
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