import "../styles/Header.css";
import logo from "../styles/images/logo.png";
import { Button } from "./ui/button.tsx";

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
          <Button>Accueil</Button>
          <Button>Favoris</Button>
          <Button>Mes Notes</Button>
        </nav>

		{/* Actions supplémentaires */}
        <div className="header-right">
			<div>
				<Button>Recherche</Button>
          		<Button>Theme</Button>
			</div>
			<div className="extra">
				<Button>Partager</Button>
				<Button>Connexion</Button>
			</div>
        </div>
      </header>
    </>
  );
};
