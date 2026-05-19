import React, { useState, useRef, useEffect } from "react";
import "./Auth.css";
import { SquareButton } from "./components/SquareButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config/api";

export default function Auth({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role_id: "1",
  });

  const [error, setError] = useState("");
  const headingRef = useRef(null);
  const errorRef = useRef(null);

  /* Annonce le changement Connexion / Inscription */
  useEffect(() => {
    headingRef.current?.focus();
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "login" : "register";

    try {
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Une erreur est survenue.");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess?.(data.user);

        const from = location.state?.from || "/";
        navigate(from, { replace: true });
      } else {
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="auth-title"
        >
          {isLogin ? "Connexion" : "Rejoindre Oncarya"}
        </h1>

        <p className="auth-subtitle">Soutien et partage pour tous.</p>

        {error && (
          <p
            ref={errorRef}
            className="auth-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstname">Prénom</label>
                <input
                  id="firstname"
                  type="text"
                  name="firstname"
                  className="form-input"
                  placeholder="Ex: Thomas"
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastname">Nom</label>
                <input
                  id="lastname"
                  type="text"
                  name="lastname"
                  className="form-input"
                  placeholder="Ex: Dubois"
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role_id">Rôle</label>
                <select
                  id="role_id"
                  name="role_id"
                  className="form-input"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  aria-required="true"
                >
                  <option value="1">Patient</option>
                  <option value="2">Ancien Patient</option>
                  <option value="3">Proche</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="nom@exemple.com"
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>

          <SquareButton
            type="submit"
            className="sqr-button-dark-background sqr-btn-primary"
          >
            {isLogin ? "Se connecter" : "S'inscrire"}
          </SquareButton>
        </form>

        <p className="toggle-text">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            type="button"
            className="toggle-link"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
