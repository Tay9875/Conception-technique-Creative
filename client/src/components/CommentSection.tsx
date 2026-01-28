import React, { useState } from "react";
import "../styles/CommentSection.css"
import { CommentCard } from "./CommentCard.tsx";
import CommentForm  from "./CommentForm.tsx";

interface CommentSectionProps {
  isOpen?: boolean;
  onToggle?: () => void; // permet au bouton externe de déclencher l'ouverture
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  isOpen: externalIsOpen,
  onToggle,
}) => {
  const [comments, setComments] = useState([
    {
      author: "Marie D.",
      date: "2026-01-27",
      content: "Contenu du commentaire factice",
    },
  ]);

  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle();
  };

  const handleAddComment = (content: string) => {
    setComments((prev) => [
      ...prev,
      { author: "Vous", date: new Date().toISOString().split("T")[0], content },
    ]);
  };

  return (
    <section className="comment-section" id="comments-container">
      {isOpen && (
        <div aria-live="polite" className="comments-container">
          <CommentForm onSubmit={handleAddComment} />
          {comments.map((c, i) => (
            <CommentCard key={i} author={c.author} date={c.date} content={c.content} />
          ))}
        </div>
      )}
    </section>
  );
};
