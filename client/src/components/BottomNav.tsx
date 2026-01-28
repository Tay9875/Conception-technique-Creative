import { NavLink } from "react-router-dom";
import "../styles/BottomNav.css";

export default function BottomNav() {
  return (
    <nav
      className="bottom-nav"
      aria-label="Navigation principale mobile"
    >
      <ul className="bottom-nav-list">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
            aria-current={({ isActive }) =>
              isActive ? "page" : undefined
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
            to="/favoris"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
            aria-current={({ isActive }) =>
              isActive ? "page" : undefined
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              favorite
            </span>
            <span className="bottom-nav-text">Favoris</span>
          </NavLink>
        </li>

        {/* Action principale */}
        <li>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `bottom-nav-main ${isActive ? "is-active" : ""}`
            }
            aria-current={({ isActive }) =>
              isActive ? "page" : undefined
            }
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              add
            </span>
            <span className="visually-hidden">
              Partager un contenu
            </span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/notes"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
            aria-current={({ isActive }) =>
              isActive ? "page" : undefined
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
            to="/profil"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "is-active" : ""}`
            }
            aria-current={({ isActive }) =>
              isActive ? "page" : undefined
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
