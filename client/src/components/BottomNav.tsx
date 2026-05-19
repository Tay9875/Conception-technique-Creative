import { NavLink } from "react-router-dom";
import "../styles/BottomNav.css";

export default function BottomNav() {
  return (
    <nav
      className="bottom-nav"
      aria-label="Navigation mobile"
    >
      <ul className="bottom-nav-list">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              home
            </span>
            <span className="bottom-nav-text">Accueil</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              edit_note
            </span>
            <span className="bottom-nav-text">Notes</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `bottom-nav-main ${isActive ? "is-active" : ""}`
            }
            aria-label="Partager un contenu"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              add
            </span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/mes_articles"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              auto_stories
            </span>
            <span className="bottom-nav-text">Mes articles</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              person
            </span>
            <span className="bottom-nav-text">Profil</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
