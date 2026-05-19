import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Favoris.css';
import { Header } from './components/Header';
import { Container } from './components/Container';
import { Empty } from './components/Empty';
import { SquareButton } from './components/SquareButton';
import { Footer } from './components/Footer';

function Favoris() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleClick = (): void => {
    navigate('/');
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main>
        <section className="section">
          <div className="section-container">
            <div className="section-heading">
              <h1>Mes conseils sauvegardés</h1>
            </div>
            <div className="section-paragraph">
              <p>
                Retrouvez tous les conseils que vous avez sauvegardés pour les relire facilement.
              </p>
            </div>
          </div>
        </section>

        <Container>
          <Empty aria-label="Pas de conseils disponibles">
            <p className="empty-text">Malheureusement, il n'y a pas encore de conseils.</p>
            <SquareButton
              className="sqr-button-dark-background"
              onClick={handleClick}
              aria-label="Découvrir des conseils et revenir à l'accueil"
            >
              Découvrir des conseils
            </SquareButton>
          </Empty>
        </Container>
      </main>

      <Footer />
    </>
  );
}

export default Favoris;
