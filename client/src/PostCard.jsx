// client/src/PostCard.jsx
import React, { useState, useEffect } from 'react';

export default function PostCard({ post, user }) {
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    
    // URL API (Change selon Prod/Local)
    const API_URL = 'http://localhost:3000/api'; 

    // Charger les commentaires quand on clique sur "Voir commentaires"
    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_URL}/comments/${post.id}`);
            const data = await response.json();
            setComments(data);
        } catch (error) { console.error(error); }
    };

    // Gérer l'affichage
    const toggleComments = () => {
        if (!showComments) fetchComments(); // On charge seulement si on ouvre
        setShowComments(!showComments);
    };

    // Envoyer un commentaire
    const handleSendComment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description: newComment, 
                    user_id: user.id, 
                    post_id: post.id 
                })
            });

            if (response.ok) {
                setNewComment(""); // Vider l'input
                fetchComments(); // Recharger la liste
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="post-card">
            {post.tag_title && <span className="post-tag">{post.tag_title}</span>}
            <h2 className="post-title">{post.title}</h2>
            <p className="post-desc">{post.description}</p>
            
            <div className="post-footer">
                <span>Par <strong>{post.firstname} {post.lastname}</strong></span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>

            <hr className="divider" />

            {/* Bouton pour afficher/masquer */}
            <button onClick={toggleComments} className="btn-text">
                {showComments ? "Masquer les commentaires" : "Voir les commentaires"}
            </button>

            {/* Zone Commentaires */}
            {showComments && (
                <div className="comments-section">
                    {comments.map(comment => (
                        <div key={comment.id} className="comment-bubble">
                            <div className="comment-header">
                                <strong>{comment.firstname} {comment.lastname}</strong>
                                <span className="comment-date">
                                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric', 
                                        month: 'short', 
                                        hour: '2-digit', 
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="comment-content">
                                {comment.description}
                            </div>
                        </div>
                    ))}

                    <form onSubmit={handleSendComment} className="comment-form">
                        <input 
                            type="text" 
                            placeholder="Écrire un commentaire..." 
                            className="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-small">Envoyer</button>
                    </form>
                </div>
            )}
        </div>
    );
}