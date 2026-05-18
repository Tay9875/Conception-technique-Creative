import React, { useState, useEffect } from "react";
import "../styles/CommentSection.css";
import { CommentCard } from "./CommentCard.tsx";
import CommentForm from "./CommentForm.tsx";
import { API_URL } from "../config/api";

interface CommentSectionProps {
  id?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  articleId: number;
  user: any;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  isOpen,
  articleId,
  user,
}) => {
  const [comments, setComments] = useState<any[]>([]);

  // 1. CHARGEMENT DES COMMENTAIRES (GET)
  useEffect(() => {
    if (isOpen && articleId) {
      fetchComments();
    }
  }, [isOpen, articleId]);

  const fetchComments = async () => {
    try {
      // On suppose que votre API permet de filtrer les commentaires par post_id
      const response = await fetch(`${API_URL}/comments?post_id=${articleId}`);
      if (response.ok) {
        const data = await response.json();
        // On filtre manuellement si l'API renvoie tout
        const articleComments = data.filter((c: any) => c.post_id == articleId);
        setComments(articleComments);
      }
    } catch (error) {
      console.error("Erreur chargement commentaires", error);
    }
  };

  // 2. AJOUT D'UN COMMENTAIRE (POST)
  const handleAddComment = async (formData: any) => {
    
    const textContent = formData.contenu || formData.description || formData; 

    if (!user || !user.id) {
      alert("Vous devez être connecté pour commenter.");
      return;
    }

    // Création de l'objet pour l'API (basé sur ton schéma SQL : description, user_id, post_id)
    const newCommentPayload = {
      description: textContent, 
      user_id: user.id,
      post_id: articleId
    };

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCommentPayload),
      });

      if (response.ok) {
        // Mise à jour locale immédiate pour fluidité
        const savedComment = {
          description: textContent,
          created_at: new Date().toISOString(),
          firstname: user.firstname || "Moi", // Adapte selon ton objet User
          lastname: user.lastname || "",
        };
        
        setComments((prev) => [...prev, savedComment]);
        
        // Optionnel : Recharger depuis le serveur pour être sûr
        fetchComments();
      } else {
        console.error("Erreur lors de l'envoi du commentaire");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Si la section est fermée, on ne rend rien (ou juste le container vide selon le design)
  if (!isOpen) return null;

  return (
    <section className="comment-section" id="comments-container">
      <div aria-live="polite" className="comments-container">
        
        {/* FORMULAIRE */}
        <div style={{ marginBottom: '20px' }}>
             <CommentForm onSubmit={handleAddComment} />
        </div>

        {/* LISTE DES COMMENTAIRES */}
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <CommentCard 
              key={c.id || i} 
              author={c.firstname ? `${c.firstname} ${c.lastname}` : "Utilisateur"} 
              date={c.created_at}
              content={c.description} 
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
            Soyez le premier à commenter !
          </p>
        )}
      </div>
    </section>
  );
};
