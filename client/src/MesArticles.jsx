import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./MesArticles.css";
import AccessibleModal from "./components/AccessibleModal.tsx";
import { NoteCard } from "./components/NoteCard.tsx";
import NoteForm from "./components/NoteForm.tsx";
import { Header } from "./components/Header.tsx";
import { Container } from "./components/Container.tsx";
import { Empty } from "./components/Empty.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { Footer } from "./components/Footer.tsx";

function MesArticles() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNoteSubmit = (data) => {
    console.log("Nouvelle note :", data);
    setIsModalOpen(false);
  };

  const handleClick = () => {
    navigate("/"); // Redirige vers l'accueil
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main>
        <section className="articles-section">
          <div className="articles-section-container">
            <div className="articles-section-lien">
              <span></span>
              <Link
                to="/"
                className="retour"
                aria-label="Retour à la page d'accueil"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_back
                </span>
                Retour aux conseils
              </Link>
            </div>

            <div className="articles-section-heading">
              <div className="articles-heading">
                <h1 className="note-heading">Mes Articles</h1>
                <p className="paragraph">
                  Apportez un soutien en partageant vos conseils
                </p>
              </div>

              <div className="nouvel-article">
                <SquareButton
                  className="sqr-button-dark-background no-resize"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Créer un nouvel article"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    add
                  </span>
                  Nouvel Article
                </SquareButton>
              </div>
            </div>
          </div>
        </section>

        <Container>
          <Empty aria-label="Pas de conseils disponibles">
            <p className="empty-text">
              Malheureusement, il n'y a pas encore de conseils.
            </p>
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

export default MesArticles;
