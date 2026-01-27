import { useNavigate, } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Favoris.css';
import { Header } from './components/Header.tsx';
import { Container } from './components/Container.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { Empty } from './components/Empty.tsx';
import { SquareButton } from './components/SquareButton.tsx';
import { Footer } from './components/Footer.tsx';

function Favoris() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
      () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <>
    <Header theme={theme} setTheme={setTheme}/>
    <section className="favoris-section">
        <div className="favoris-container">
            <div className="favoris-section-heading">
                    <h4>Mes conseils sauvegardés</h4>
            </div>
            <div className="favoris-section-paragraph">
                <p>Retrouvez tous les conseils que vous avez sauvegardés pour les relire facilement.</p>
            </div>
        </div>
    </section>
    <Container>
      <Empty aria-label="Pas de conseils disponibles">
        <p className="empty-text">Malheureusement, il n'y a pas encore de conseils.</p>
        <SquareButton className="sqr-button-dark-background" ariaLabel="Découvrez des conseils">
          <span>Découvrir des conseils</span>
        </SquareButton>
      </Empty>
    </Container>
    <Footer />
    </>
  );
}

export default Favoris;
