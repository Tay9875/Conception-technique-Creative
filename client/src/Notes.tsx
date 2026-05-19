import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Notes.css';
import AccessibleModal from './components/AccessibleModal';
import NoteForm, { NoteFormData } from './components/NoteForm';
import { Header } from './components/Header';
import { Empty } from './components/Empty';
import { SquareButton } from './components/SquareButton';
import { Footer } from './components/Footer';

function Notes() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleNoteSubmit = (data: NoteFormData): void => {
    console.log('Nouvelle note :', data);
    setIsModalOpen(false);
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main id="main-content">
        <section className="notes-section">
          <div className="notes-section-container">
            <div className="notes-section-lien">
              <span></span>
              <Link to="/" className="retour" aria-label="Retour à la page d'accueil">
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_back
                </span>
                Retour aux conseils
              </Link>
            </div>

            <div className="notes-section-heading">
              <div className="notes-heading">
                <h1 className="note-heading">Mes Notes Personnelles</h1>
                <p className="paragraph">
                  Notez vos réflexions, questions à poser au médecin, ou idées personnelles
                </p>
              </div>

              <div className="nouvelle-note">
                <SquareButton
                  className="sqr-button-dark-background no-resize"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Créer une nouvelle note"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    add
                  </span>
                  Nouvelle note
                </SquareButton>
              </div>
            </div>

            <div className="notes-section-infos">
              <p>
                Vos notes personnelles sont privées et stockées localement sur votre appareil.
              </p>
            </div>
          </div>
        </section>

        <section className="notes-container">
          <AccessibleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Nouvelle note"
          >
            <NoteForm onSubmit={handleNoteSubmit} />
          </AccessibleModal>

          <Empty aria-label="Pas de conseils disponibles">
            <p className="empty-text">Vous n'avez pas encore de notes personnelles.</p>
          </Empty>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Notes;
