import "../styles/NotesCard.css";
import { SquareButton } from "./SquareButton.tsx";

export const NoteCard: React.FC = () => {
  return (
    <article className="notecard" aria-labelledby="note-card">
        <div className="note-header">
            <div className="note-header-info">
                <p className="note-title" aria-label="note-title">Titre</p>
                <div className="note-tools">
                    <SquareButton ariaLabel="modify note">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            edit
                        </span>
                    </SquareButton>
                    <SquareButton ariaLabel="delete note">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            delete
                        </span>
                    </SquareButton>
                </div>
            </div>
            <span className="note-created-date" aria-label="note-created-date">9 Janvier 2026</span>
        </div>
        <div className="note-content">
          <p className="paragraph">Contenu</p>
        </div>
    </article>
  );
};
