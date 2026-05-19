import { NavLink } from 'react-router-dom';
import '../styles/BottomNav.css';

interface BottomNavItem {
  to: string;
  icon: string;
  label: string;
  hideLabel?: boolean;
  mainAction?: boolean;
}

const items: BottomNavItem[] = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/notes', icon: 'edit_note', label: 'Notes' },
  { to: '/feed', icon: 'add', label: 'Partager un contenu', hideLabel: true, mainAction: true },
  { to: '/mes_articles', icon: 'auto_stories', label: 'Mes Articles' },
  { to: '/profile', icon: 'person', label: 'Profil' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale mobile">
      <ul className="bottom-nav-list">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${item.mainAction ? 'bottom-nav-main' : 'bottom-nav-item'} ${
                  isActive ? 'is-active' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className={item.hideLabel ? 'visually-hidden' : 'bottom-nav-text'}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
