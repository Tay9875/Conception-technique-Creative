import React, { useRef } from "react";
import "../styles/CommentCard.css";

interface CommentCardProps {
  author: string;
  date: string;
  content: string;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  author,
  date,
  content,
}) => {
  const titleId = useRef(`comment-author-${Math.random().toString(36).substr(2, 9)}`).current;

  return (
    <article className="comment-card" aria-labelledby={titleId}>
      <header className="comment-header">
        <span className="material-symbols-outlined" aria-hidden="true">
          person
        </span>
        <p id={titleId} className="comment-author">{author}</p>
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
