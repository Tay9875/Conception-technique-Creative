// client/src/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from './config/api';

export default function PostCard({ post, user }) {
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [isLiked, setIsLiked] = useState(post.is_liked === 1);
    const [likeCount, setLikeCount] = useState(post.like_count);
    
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

    const handleLike = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Mise à jour visuelle immédiate
                setIsLiked(data.liked);
                setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            console.error("Erreur like:", error);
        }
    };

    return (
        <div className="post-card">
            {post.tag_title && <span className="post-tag">{post.tag_title}</span>}
            <h2 className="post-title">{post.title}</h2>
            <p className="post-desc">{post.description}</p>
            <button 
                onClick={handleLike} 
                style={{ 
                    cursor: 'pointer', 
                    background: 'none', 
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    padding: '5px 10px',
                    color: isLiked ? 'red' : 'black' // Change la couleur du texte/coeur
                }}
            >
                {isLiked ? '❤️' : '🤍'} {likeCount}
            </button>
            
            <div className="post-footer">
                    <span>Par <strong>{post.firstname} {post.lastname}</strong></span>
                    {post.role_id && (
                        <span style={{marginLeft:8, fontStyle:'italic', color:'#666'}}>
                            [
                            {post.role_id === 1 ? "Patient" : post.role_id === 2 ? "Ancien Patient" : post.role_id === 3 ? "Proche" : "Inconnu"}
                            ]
                        </span>
                    )}
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
