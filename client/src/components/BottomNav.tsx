import { NavLink } from "react-router-dom";
import "../styles/BottomNav.css";
import { Button } from "./Button.tsx";

export default function BottomNav() {
  return (
    <nav
      className="bottom-nav"
      aria-label="Navigation principale mobile"
    >
      <NavLink
        to="/"
        className="bottom-nav-item"
        aria-label="Accueil"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          home
        </span>
        <span className="bottom-nav-text">Accueil</span>
      </NavLink>

      <NavLink
        to="/favoris"
        className="bottom-nav-item"
        aria-label="Favoris"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          favorite
        </span>
        <span className="bottom-nav-text">Favoris</span>
      </NavLink>

      {/* ⭐ BOUTON PARTAGER */}
      <NavLink
        to="/feed"
        className="bottom-nav-main"
        aria-label="Partager un contenu"
      >
        <Button ariaLabel="bouton ajouter" className="dark-addon">
            <span className="material-symbols-outlined " aria-hidden="true">
          add
        </span>
        </Button>
      </NavLink>

      <NavLink
        to="/notes"
        className="bottom-nav-item"
        aria-label="Mes notes"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          edit_note
        </span>
        <span className="bottom-nav-text">Notes</span>
      </NavLink>

      <NavLink
        to="/profil"
        className="bottom-nav-item"
        aria-label="Mon profil"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          person
        </span>
        <span className="bottom-nav-text">Profil</span>
      </NavLink>
    </nav>
  );
}
