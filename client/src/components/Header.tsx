import React, { useState, useEffect } from 'react';
import "../styles/Header.css";
import logo from "../styles/images/logo.png";
import { SquareButton } from "./SquareButton.tsx";
import { useNavigate, useLocation } from "react-router-dom";

type HeaderProps = {
  theme: string;
  setTheme: (theme: string) => void;
};

export const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // ✅ Source de vérité unique
  const [user, setUser] = useState<any>(null);

  // 🔁 Synchronisation au refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  const handleClick = (path: string) => {
    const protectedPaths = ["/favoris", "/notes", "/feed"];
    const isAuthenticated = Boolean(user);

    if (protectedPaths.includes(path) && !isAuthenticated) {
      navigate("/login", {
        state: { from: path === "/login" ? "/" : path },
        replace: true
      });
      return;
    }

    navigate(path);
  };

  return (
    <header role="banner" className="header">
      {/* Logo */}
      <div className="header-left">
        <button
          onClick={() => handleClick("/")}
          aria-label="Accueil"
          className="logo-link"
        >
          <img
            src={logo}
            alt="Oncarya"
            className="logo-image"
            width={40}
            height={40}
          />
          <span className="logo-title">Oncarya</span>
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="header-nav extra" aria-label="Navigation principale">
        <SquareButton className={`${isActive("/") ? "active" : ""}`} onClick={() => handleClick("/")}>
          Accueil
        </SquareButton>
        <SquareButton className={`${isActive("/favoris") ? "active" : ""}`} onClick={() => handleClick("/favoris")}>
          Favoris
        </SquareButton>
        <SquareButton className={`${isActive("/notes") ? "active" : ""}`} onClick={() => handleClick("/notes")}>
          Mes Notes
        </SquareButton>
      </nav>

      <div className="header-right">
        <div className="button-gaps">
          <SquareButton ariaLabel="Rechercher">
            <span className="material-symbols-outlined">search</span>
          </SquareButton>
          <SquareButton 
            ariaLabel="Mode clair ou sombre" 
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }>
            <span className="material-symbols-outlined">dark_mode</span>
          </SquareButton>
        </div>

        <div className="button-gaps extra">
          <SquareButton
            className="sqr-button-dark-background"
            onClick={() => handleClick("/feed")}
          >
            Partager
          </SquareButton>

          {/* 👤 Connexion / Déconnexion */}
          {!user && (
            <SquareButton
              className="sqr-button-dark-background"
              onClick={() => handleClick("/login")}
            >
              Connexion
            </SquareButton>
          )}

          {user && (
            <SquareButton
              className="sqr-button-dark-background"
              onClick={handleLogout}
            >
              Déconnexion
            </SquareButton>
          )}
        </div>
      </div>
    </header>
  );
};
