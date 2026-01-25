import "../styles/NotesCard.css";
import { SquareButton } from "./SquareButton.tsx";

export const NoteCard: React.FC = () => {
  return (
    <article className="notecard" aria-labelledby="note-card">
        <div className="note-header">
            <div className="note-header-info">
                <p className="note-title" aria-label="note-title">{title}</p>
                <div className="note-tools">
                    <SquareButton>
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            edit
                        </span>
                    </SquareButton>
                    <SquareButton>
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
          <p className="paragraph">{contenu}</p>
        </div>
    </article>
  );
};
