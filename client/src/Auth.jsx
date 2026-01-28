// client/src/Auth.jsx
import React, { useState, useRef, useEffect } from 'react';
import './Auth.css';
import { SquareButton } from './components/SquareButton.tsx';
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth({ onLoginSuccess }) {
    const navigate = useNavigate();
    const location = useLocation();

    const API_URL = process.env.REACT_APP_API_URL;

    const [isLogin, setIsLogin] = useState(true); // Bascule entre Login et Register
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState("");
    const errorRef = useRef(null);
    const headingRef = useRef(null);

    useEffect(() => {
        // Annonce le changement Login / Register
        headingRef.current?.focus();
    }, [isLogin]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? 'login' : 'register';
        
        try {

            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            alert(isLogin ? `Data ${data.user.firstname} !` : "Inscription réussie ! Connectez-vous.");

            if (response.ok) {
                alert(isLogin ? `Bienvenue ${data.user.firstname}!` : "Inscription réussie ! Connectez-vous.");
                if (isLogin) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    onLoginSuccess?.(data.user);
                    const from = location.state?.from || "/";
                    navigate(from, { replace: true });
                } else {
                    alert("Inscription réussie ! Connectez-vous.");
                    setIsLogin(true);
                }
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

                    <SquareButton type="submit" className="sqr-button-dark-background sqr-btn-primary">
                        {isLogin ? 'Se connecter' : "S'inscrire"}
                    </SquareButton>
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