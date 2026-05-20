import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import { SquareButton } from './SquareButton';
import type { SessionUser } from '../types';
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from './NotificationBell';


export type Theme = 'light' | 'dark';

interface HeaderProps {
  theme: Theme | string;
  setTheme: (theme: Theme) => void;
}

function readStoredUser(): SessionUser | null {
  const saved = localStorage.getItem('user');
  if (!saved) return null;
  try {
    return JSON.parse(saved) as SessionUser;
  } catch {
    return null;
  }
}

export const Header = ({ theme, setTheme }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string): boolean => location.pathname === path;
  const isDark = theme === 'dark';

  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const handleLogout = (): void => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  const handleClick = (path: string): void => {
    const protectedPaths = ['/favoris', '/notes', '/feed', '/profile', '/admin'];
    const isAuthenticated = Boolean(user);

    if (protectedPaths.includes(path) && !isAuthenticated) {
      navigate('/login', { state: { from: path }, replace: true });
      return;
    }

    navigate(path);
  };

  return (
    <header role="banner" className="header">
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      <div className="header-left">
        <Link to="/" className="logo-link" aria-label="Accueil">
          <img src="/logo.svg" alt="" className="logo-image" width={40} height={40} />
          <span className="logo-title">Oncarya</span>
        </Link>
      </div>

      <nav className="header-nav extra" aria-label="Navigation principale">
        <ul className="nav-list">
          <li>
            <SquareButton
              className={isActive('/') ? 'is-active' : undefined}
              aria-current={isActive('/') ? 'page' : undefined}
              onClick={() => handleClick('/')}
            >
              Accueil
            </SquareButton>
          </li>

          <li>
            <SquareButton
              className={isActive('/notes') ? 'is-active' : undefined}
              aria-current={isActive('/notes') ? 'page' : undefined}
              onClick={() => handleClick('/notes')}
            >
              Mes notes
            </SquareButton>
          </li>

          <li>
            <SquareButton
              className={isActive('/mes_articles') ? 'is-active' : undefined}
              aria-current={isActive('/mes_articles') ? 'page' : undefined}
              onClick={() => {
                if (!user) {
                  navigate('/login', { state: { from: '/mes_articles' }, replace: true });
                } else {
                  handleClick('/mes_articles');
                }
              }}
            >
              Mes articles
            </SquareButton>
          </li>
        </ul>
      </nav>

      <div className="header-right">
        <GlobalSearch />
        <NotificationBell user={user} />

        <div className="button-gaps">
          <SquareButton
            className="theme-btn"
            ariaLabel={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </SquareButton>
        </div>

        <div className="button-gaps extra">
          <SquareButton
            ariaLabel="Ajouter un article"
            className="sqr-button-dark-background"
            onClick={() => handleClick('/feed')}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              add_circle
            </span>
          </SquareButton>

          {!user && (
            <SquareButton
              className="sqr-button-dark-background"
              onClick={() => handleClick('/login')}
            >
              Connexion
            </SquareButton>
          )}

          {user && (
            <>
              <SquareButton
                className={isActive('/profile') ? 'sqr-button-dark-background is-active' : 'sqr-button-dark-background'}
                aria-current={isActive('/profile') ? 'page' : undefined}
                aria-label="Mon profil"
                onClick={() => handleClick('/profile')}
              >
                <span className="material-symbols-outlined profile-header" aria-hidden="true">
                  account_circle
                </span>
              </SquareButton>

              {user.role_id === 4 && (
                <SquareButton
                  className={isActive('/admin') ? 'sqr-button-dark-background is-active' : 'sqr-button-dark-background'}
                  aria-current={isActive('/admin') ? 'page' : undefined}
                  onClick={() => handleClick('/admin')}
                >
                  Admin
                </SquareButton>
              )}

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
