import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Notes.css";
import AccessibleModal from "./components/AccessibleModal.tsx";
import { NoteCard } from "./components/NoteCard.tsx";
import NoteForm from "./components/NoteForm.tsx";
import { Header } from "./components/Header.tsx";
import { Empty } from "./components/Empty.tsx";
import { SquareButton } from "./components/SquareButton.tsx";
import { Footer } from "./components/Footer.tsx";

function Notes({ user }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const API_URL = "https://conception-technique-creative-backend.onrender.com/api";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  // --- Récupération des notes ---
  const fetchNotes = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(`${API_URL}/notes?user_id=${user.id}`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Erreur récupération notes :", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  // --- Création de note ---
  const handleNoteSubmit = async (data) => {
    if (!user || !user.id) return alert("Vous devez être connecté pour créer une note.");

    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, title: data.titre, content: data.contenu }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes(prev => [newNote, ...prev]); // ajout en tête
        setIsModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.message || "Erreur création note");
      }
    } catch (error) {
      console.error("Erreur création note :", error);
    }
  };

  // --- Suppression de note ---
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette note ?")) return;

    try {
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      } else {
        const err = await response.json();
        alert(err.message || "Erreur suppression note");
      }
    } catch (error) {
      console.error("Erreur suppression note :", error);
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main id="main-content">
        <section className="notes-section">
          <div className="notes-section-container">
            <div className="notes-section-lien">
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
          {notes.length > 0 ? (
            notes.map(note => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                date={new Date(note.created_at).toLocaleDateString("fr-FR")}
                onDelete={handleDeleteNote}
              />
            ))
          ) : (
            <Empty aria-label="Pas de notes disponibles">
              <p className="empty-text">Vous n'avez pas encore de notes personnelles.</p>
            </Empty>
          )}

          <AccessibleModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Nouvelle note"
          >
            <NoteForm onSubmit={handleNoteSubmit} />
          </AccessibleModal>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Notes;
