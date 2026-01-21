import { useState } from "react";
import "../styles/Header.css";
import logo from "../styles/images/logo.png";
import { SquareButton } from "./SquareButton.tsx";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async (path: string) => {
    setLoading(true);

    // Pages qui nécessitent d'être connecté
    const protectedPaths = ["/favoris", "/notes", "/feed"];

    try {
      const user = localStorage.getItem("user");
      const isAuthenticated = !!user;

      if (protectedPaths.includes(path) && !isAuthenticated) {
        // Non connecté → redirige vers Auth.jsx
        navigate("/connexion");
      } else {
        // Connecté ou page publique → navigation normale
        navigate(path);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'auth :", error);
      navigate("/connexion"); // fallback sécurité
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header role="banner" className="header">
        {/* Logo */}
        <div className="header-left">
          <a href="/" aria-label="Accueil" className="logo-link">
            <img
              src={logo}
              alt="Oncarya"
              className="logo-image"
              width={40}
              height={40}
            />
            <span className="logo-title">Oncarya</span>
          </a>
        </div>

        {/* Navigation principale */}
        <nav className="header-nav extra" aria-label="Navigation principale">
          <SquareButton onClick={() => handleClick("/")}>Accueil</SquareButton>
          <SquareButton onClick={() => handleClick("/favoris")}>Favoris</SquareButton>
          <SquareButton onClick={() => handleClick("/notes")}>Mes Notes</SquareButton>
        </nav>

        <div className="header-right">
          <div className="button-gaps">
            <SquareButton ariaLabel="Rechercher">
              <span className="material-symbols-outlined">search</span>
            </SquareButton>
            <SquareButton ariaLabel="Mode sombre">
              <span className="material-symbols-outlined">dark_mode</span>
            </SquareButton>
          </div>

          <div className="button-gaps extra">
            <SquareButton className="sqr-button-dark-background" onClick={() => handleClick("/feed")}>Partager</SquareButton>

            {/* Connexion seulement si pas connecté */}
            {!localStorage.getItem("user") && (
              <SquareButton className="sqr-button-dark-background" onClick={() => handleClick("/connexion")}>Connexion</SquareButton>
            )}

            {localStorage.getItem("user") && (
              <SquareButton className="sqr-button-dark-background" onClick={() => handleClick("/logout")}>Déconnexion</SquareButton>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
