import "../styles/Header.css";
import logo from "../styles/images/logo.png";
import { Button } from "./ui/SquareButton.tsx";
import { SquareButton } from "./SquareButton.tsx";

export const Header: React.FC = () => {
  return (
    <>
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>

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
        <nav
          className="header-nav extra"
          aria-label="Navigation principale"
        >
          <SquareButton>Accueil</SquareButton>
          <SquareButton>Favoris</SquareButton>
          <SquareButton>Mes Notes</SquareButton>
        </nav>

		{/* Actions supplémentaires */}
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
				<SquareButton>Partager</SquareButton>
				<SquareButton>Connexion</SquareButton>
			</div>
        </div>
      </header>
    </>
  );
};
