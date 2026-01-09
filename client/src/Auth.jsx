// client/src/Auth.jsx
import React, { useState } from 'react';
import './Auth.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true); // Bascule entre Login et Register
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/login' : '/register';
        
        try {
            const response = await fetch(`https://conception-technique-creative-backend.onrender.com/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(isLogin ? `Bienvenue ${data.user.firstname} !` : "Inscription réussie ! Connectez-vous.");
                if (!isLogin) setIsLogin(true); // Redirige vers login après inscription
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">{isLogin ? 'Connexion' : 'Rejoindre Oncarya'}</h2>
                <p className="auth-subtitle">Soutien et partage pour tous.</p>

                <form onSubmit={handleSubmit}>
                    
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input type="text" name="firstname" className="form-input" placeholder="Ex: Thomas" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="lastname" className="form-input" placeholder="Ex: Dubois" onChange={handleChange} required />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" className="form-input" placeholder="nom@exemple.com" onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input type="password" name="password" className="form-input" placeholder="••••••••" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>

                <p className="toggle-text">
                    {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? " Créer un compte" : " Se connecter"}
                    </span>
                </p>
            </div>
        </div>
    );
}