// client/src/Feed.jsx
import React, { useState, useEffect } from 'react';
import './Feed.css';

export default function Feed({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', description: '' });

    // Charger les posts au démarrage
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('https://conception-technique-creative-backend.onrender.com/api/posts');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Erreur chargement posts:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // On envoie le post avec l'ID de l'utilisateur connecté
        try {
            const response = await fetch('https://conception-technique-creative-backend.onrender.com/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPost, user_id: user.id }) // Important : user_id
            });
            
            if (response.ok) {
                setNewPost({ title: '', description: '' }); // Vider le formulaire
                fetchPosts(); // Recharger la liste
            }
        } catch (error) {
            console.error("Erreur envoi:", error);
        }
    };

    return (
        <div className="feed-container">
            <header className="feed-header">
                <h1 className="feed-title">Bonjour, {user.firstname} 👋</h1>
                <button onClick={onLogout} className="logout-btn">Se déconnecter</button>
            </header>

            {/* Formulaire de création */}
            <div className="create-post-card">
                <h3>Partagez votre expérience</h3>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Un titre pour votre sujet..." 
                        className="post-input"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        required
                    />
                    <textarea 
                        placeholder="Racontez-nous..." 
                        className="post-input"
                        rows="3"
                        value={newPost.description}
                        onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                        required
                    />
                    <button type="submit" className="btn-post">Publier</button>
                </form>
            </div>

            {/* Liste des posts */}
            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post.id} className="post-card">
                        <span className="post-tag">Soutien</span> {/* Tag en dur pour l'instant */}
                        <h2 className="post-title">{post.title}</h2>
                        <p className="post-desc">{post.description}</p>
                        
                        <div className="post-footer">
                            <span>Par <strong>{post.firstname} {post.lastname}</strong></span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}