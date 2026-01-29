import React, { useState, useEffect } from 'react';
import PostCard from './PostCard';
import './Feed.css';

export default function Feed({ user, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', description: '', tag_id: '' });
    
    const [selectedTag, setSelectedTag] = useState(null);

    const API_URL = 'https://conception-technique-creative-backend.onrender.com/api';

    useEffect(() => {
        fetchPosts();
        fetchTags();
    }, []);

    const fetchPosts = async () => {
        try {
            if (!user || !user.id) return;
            
            const response = await fetch(`${API_URL}/posts?user_id=${user.id}`);
            
            if (!response.ok) throw new Error("Erreur fetch posts");
            
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
                body: JSON.stringify({ ...newPost, user_id: user.id }) 
            });
            
            if (response.ok) {
                setNewPost({ title: '', description: '', tag_id: '' });
                fetchPosts();
                setSelectedTag(null); // Remettre sur "Tous" après un post
            }
        } catch (error) { console.error(error); }
    };

    // --- LOGIQUE DE FILTRAGE ---
    // Si selectedTag est null, on garde tout. Sinon, on compare les ID.
    const filteredPosts = selectedTag 
        ? posts.filter(post => post.tag_id === selectedTag) 
        : posts;

    // console.log("🔍 Mes Posts reçus :", posts);

    return (
        <div className="feed-container">
            <header className="feed-header">
                <h1 className="feed-title">Bonjour, {user.firstname} 👋</h1>
                <button onClick={onLogout} className="logout-btn">Se déconnecter</button>
            </header>

            {/* --- BARRE DE FILTRES --- */}
            <div className="filter-container">
                <button 
                    className={`filter-btn ${selectedTag === null ? 'active' : ''}`} 
                    onClick={() => setSelectedTag(null)}
                >
                    ✨ Tous
                </button>
                
                {tags.map(tag => (
                    <button 
                        key={tag.id}
                        className={`filter-btn ${selectedTag === tag.id ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag.id)}
                    >
                        {tag.title}
                    </button>
                ))}
            </div>

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
                {/* On utilise filteredPosts au lieu de posts */}
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <PostCard key={post.id} post={post} user={user} />
                    ))
                ) : (
                    <p className="no-posts">Aucun post ne correspond à ce filtre.</p>
                )}
            </div>
        </div>
    );
}