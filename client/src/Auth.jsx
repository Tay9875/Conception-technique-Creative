import React, { useState, useRef, useEffect } from "react";
import "./Auth.css";
import { SquareButton } from "./components/SquareButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "./config/api";
import { apiFetch } from "./lib/apiClient";

export default function Auth({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstname: "", lastname: "", email: "", password: "", role_id: "1" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const headingRef = useRef(null);

  useEffect(() => {
    document.title = isLogin ? "Connexion — Oncarya" : "Inscription — Oncarya";
    headingRef.current?.focus();
  }, [isLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const endpoint = isLogin ? "login" : "register";

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { firstname: formData.firstname, lastname: formData.lastname, email: formData.email, password: formData.password };

      const data = await apiFetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) localStorage.setItem("token", data.token);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        onLoginSuccess?.(data.user);
        navigate(location.state?.from || "/", { replace: true });
      } else {
        setIsLogin(true);
        setError("Inscription réussie. Tu peux maintenant te connecter.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
      if (err.details && typeof err.details === "object") setFieldErrors(err.details);
    }
  };

  return (
    <main className="auth-container" id="main-content">
      <div className="auth-card">
        <button
          type="button"
          className="auth-back-btn"
          onClick={() => location.key !== "default" ? navigate(-1) : navigate("/")}
          aria-label={location.key !== "default" ? "Retour à la page précédente" : "Retour à l'accueil"}
        >
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          Retour
        </button>

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
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
              autoComplete="email"
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
              autoComplete={isLogin ? "current-password" : "new-password"}
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
    </main>
  );
}
