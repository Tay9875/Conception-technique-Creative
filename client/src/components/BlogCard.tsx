import { Link } from "react-router-dom";
import "../styles/BlogCard.css";
import { Tag } from "./Tags.tsx";

export const BlogCard: React.FC = () => {
  return (
    <article className="blogcard" aria-labelledby="blog-title">
      <Link to="/article" className="blogcard-link">
      <div className="text">
        <div className="tags">
          <Tag>Bien-être</Tag>
        </div>

        <div className="blogcard-container">
          <header className="heading">
            <h3 id="blog-title" className="title">
              Commentaires sur la gestion du stress pendant les traitements
            </h3>
          </header>

          <p className="paragraph">
            J'ai trouvé que la méditation et les exercices de respiration m'ont beaucoup aidé à gérer le stress lié aux traitements. Cela m'a permis de rester plus calme et concentré sur mon rétablissement.
          </p>
        </div>

        <footer className="tools">
          <div className="infos">
            <p className="author">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                person
              </span>
              <span className="sr-only">Marie D.</span>
            </p>

            <time className="date" dateTime="2024-06-12">
              12 juin 2024
            </time>
          </div>

          <div className="action">
            <button
              type="button"
              className="like-btn"
              aria-label="Aimer cet article"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                favorite
              </span>
              <span aria-live="polite">0</span>
            </button>

            <button
              type="button"
              className="comment-btn"
              aria-label="Voir les commentaires"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                sms
              </span>
            </button>
          </div>
        </footer>
      </div>
      </Link>
    </article>
  );
};
