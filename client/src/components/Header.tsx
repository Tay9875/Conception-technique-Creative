import React, { useState, useEffect } from "react";
import "../styles/Header.css";
import { SquareButton } from "./SquareButton.tsx";
import { useNavigate, useLocation, Link } from "react-router-dom";

type HeaderProps = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
};

export const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Source de vérité utilisateur
  const [user, setUser] = useState<any>(null);

  // Synchronisation au refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleClick = (path: string) => {
    const protectedPaths = ["/favoris", "/notes", "/feed", "/profile"];
    const isAuthenticated = Boolean(user);

    if (protectedPaths.includes(path) && !isAuthenticated) {
      navigate("/login", {
        state: { from: path },
        replace: true,
      });
      return;
    }

    navigate(path);
  };

  return (
    <header role="banner" className="header">
      {/* Lien "Aller au contenu principal" */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Logo / Accueil */}
      <div className="header-left">
        <Link to="/" className="logo-link" aria-label="Accueil">
          <img
            src="/logo.svg"
            alt=""
            className="logo-image"
            width={40}
            height={40}
          />
          <span className="logo-title">Oncarya</span>
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="header-nav extra" aria-label="Navigation principale">
        <ul className="nav-list">
          <li>
            <SquareButton
              className={isActive("/") ? "is-active" : undefined}
              aria-current={isActive("/") ? "page" : undefined}
              onClick={() => handleClick("/")}
            >
              Accueil
            </SquareButton>
          </li>

          <li>
            <SquareButton
              className={isActive("/favoris") ? "is-active" : undefined}
              aria-current={isActive("/favoris") ? "page" : undefined}
              onClick={() => handleClick("/favoris")}
            >
              Favoris
            </SquareButton>
          </li>

          <li>
            <SquareButton
              className={isActive("/notes") ? "is-active" : undefined}
              aria-current={isActive("/notes") ? "page" : undefined}
              onClick={() => handleClick("/notes")}
            >
              Mes notes
            </SquareButton>
          </li>
        </ul>
      </nav>

      {/* Actions */}
      <div className="header-right">
        <div className="button-gaps">
          {/* Thème clair / sombre */}
          <SquareButton
            ariaLabel={
              theme === "light"
                ? "Activer le mode sombre"
                : "Activer le mode clair"
            }
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              dark_mode
            </span>
          </SquareButton>
        </div>

        <div className="button-gaps extra">
          <SquareButton
            className="sqr-button-dark-background"
            onClick={() => handleClick("/feed")}
          >
            Partager
          </SquareButton>

          {!user && (
            <SquareButton
              className="sqr-button-dark-background"
              onClick={() => handleClick("/login")}
            >
              Connexion
            </SquareButton>
          )}

          {user && (
            <>
              <SquareButton
                className={
                  isActive("/profile")
                    ? "sqr-button-dark-background is-active"
                    : "sqr-button-dark-background"
                }
                aria-current={isActive("/profile") ? "page" : undefined}
                onClick={() => handleClick("/profile")}
              >
                <span
                  className="material-symbols-outlined profile-header"
                  aria-hidden="true"
                  ariaLabel="profil"
                >
                  account_circle
                </span>
              </SquareButton>

              <SquareButton
                className="sqr-button-dark-background"
                onClick={handleLogout}
              >
                Déconnexion
              </SquareButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
