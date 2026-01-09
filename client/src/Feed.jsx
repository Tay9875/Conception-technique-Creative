// client/src/Feed.jsx
import React, { useState, useEffect } from 'react';
import './Feed.css';

export default function Feed({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]); // Stocke la liste des tags
    // On ajoute tag_id au formulaire
    const [newPost, setNewPost] = useState({ title: '', description: '', tag_id: '' });

    const API_URL = 'https://conception-technique-creative-backend.onrender.com/api'; 

    useEffect(() => {
        fetchPosts();
        fetchTags(); // On charge les tags au lancement
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_URL}/posts`);
            const data = await response.json();
            setPosts(data);
        } catch (error) { console.error(error); }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch(`${API_URL}/tags`);
            const data = await response.json();
            setTags(data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // On envoie le tag_id avec le reste
                body: JSON.stringify({ ...newPost, user_id: user.id }) 
            });
            
            if (response.ok) {
                setNewPost({ title: '', description: '', tag_id: '' }); // Reset
                fetchPosts();
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className="feed-container">
            <header className="feed-header">
                <h1 className="feed-title">Bonjour, {user.firstname} 👋</h1>
                <button onClick={onLogout} className="logout-btn">Se déconnecter</button>
            </header>

            <div className="create-post-card">
                <h3>Partagez votre expérience</h3>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Titre du sujet" 
                        className="post-input"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        required
                    />
                    
                    {/* --- NOUVEAU SELECTEUR DE TAGS --- */}
                    <select 
                        className="post-input post-select"
                        value={newPost.tag_id}
                        onChange={(e) => setNewPost({...newPost, tag_id: e.target.value})}
                        required
                    >
                        <option value="">-- Choisir un sujet --</option>
                        {tags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.title}</option>
                        ))}
                    </select>

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

            <div className="posts-list">
                {posts.map((post) => (
                    <div key={post.id} className="post-card">
                        {/* Affiche le vrai nom du tag s'il existe */}
                        {post.tag_title && <span className="post-tag">{post.tag_title}</span>}
                        
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