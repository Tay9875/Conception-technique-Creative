import { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import './Notes.css';
import AccessibleModal from "./components/AccessibleModal.tsx";
import NoteForm from "./components/NoteForm.tsx";
import { Header } from './components/Header.tsx';
import { Container } from './components/Container.tsx';
import { BlogCard } from './components/BlogCard.tsx';
import { Empty } from './components/Empty.tsx';
import { SquareButton } from './components/SquareButton.tsx';
import { Footer } from './components/Footer.tsx';

function Notes() {
  const navigate = useNavigate();

  // État pour savoir si la modale est ouverte
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fonction appelée quand le formulaire est soumis
  const handleNoteSubmit = (data) => {
    console.log("Nouvelle note :", data);
    setIsModalOpen(false); // fermer la modale après soumission
  };

  return (
    <>
    <Header />
    <section className="notes-section">
      <div className="notes-section-container">
        <div className="notes-section-lien">
          <span></span>
          <Link to="/" className="retour">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              arrow_back
            </span>
            Retour aux conseils
            </Link>
        </div>
        <div className="notes-section-heading">
          <div className="notes-heading">
            <h2 className="heading">Mes Notes Personnelles</h2>
            <p className="paragraph">Notez vos réflexions, questions à poser au médecin, ou idées personnelles</p>
          </div>
          <div className="nouvelle-note" onClick={() => setIsModalOpen(true)}>
            <SquareButton className="sqr-button-dark-background">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                add
              </span>
               Nouvelle note</SquareButton>
          </div>
        </div>
        <div className="notes-section-infos">
          <p>Vos notes personnelles sont privées et stockées localement sur votre appareil.</p>
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
    <Footer />
    </>
  );
}

export default Notes;
