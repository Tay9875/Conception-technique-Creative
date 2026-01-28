import React from "react";
import "../styles/CommentCard.css";

interface CommentCardProps {
  author: string;       // nom de l'auteur
  date: string;         // date ISO ou format lisible
  content: string;      // contenu du commentaire
}

export const CommentCard: React.FC<CommentCardProps> = ({
  author,
  date,
  content,
}) => {
  return (
    <article className="comment-card" aria-labelledby={`comment-${author}-${date}`}>
      <header className="comment-header">
        <span className="material-symbols-outlined" aria-hidden="true">
          person
        </span>
        <p id={`comment-${author}-${date}`} className="comment-author">{author}</p>
        <time className="comment-date" dateTime={date}>
          {new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>
      <div className="comment-content">
        <p>{content}</p>
      </div>
    </article>
  );
};
