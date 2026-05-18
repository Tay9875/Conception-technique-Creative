import React, { useState, useEffect } from "react";
import "../styles/CommentSection.css";
import { CommentCard } from "./CommentCard.tsx";
import CommentForm from "./CommentForm.tsx";
import { API_URL } from "../config/api";
import { apiFetch } from "../lib/apiClient";

interface CommentSectionProps {
  id?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  articleId: number;
  user: any;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ isOpen, articleId, user }) => {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && articleId) fetchComments();
  }, [isOpen, articleId]);

  const fetchComments = async () => {
    try {
      const data = await apiFetch(`${API_URL}/comments/${articleId}`);
      setComments(data || []);
    } catch (error) {
      console.error("Erreur chargement commentaires", error);
    }
  };

  const handleAddComment = async (formData: any) => {
    const textContent = formData.contenu || formData.description || formData;
    if (!user || !user.id) return alert("Vous devez être connecté pour commenter.");

    try {
      await apiFetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ description: textContent, post_id: articleId }),
      });
      await fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <section className="comment-section" id="comments-container">
      <div aria-live="polite" className="comments-container">
        <div style={{ marginBottom: "20px" }}><CommentForm onSubmit={handleAddComment} /></div>
        {comments.length > 0 ? comments.map((c, i) => (
          <CommentCard key={c.id || i} author={c.firstname ? `${c.firstname} ${c.lastname}` : "Utilisateur"} date={c.created_at} content={c.description} />
        )) : <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>Soyez le premier à commenter !</p>}
      </div>
    </section>
  );
};
