import "../styles/NotesCard.css";
import { SquareButton } from "./SquareButton.tsx";

interface NoteCardProps {
  id: number;
  title: string;
  content: string;
  date: string;
  onDelete: (id: number) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ id, title, content, date, onDelete }) => {
  const titleId = `note-${id}-title`;

  return (
    <article className="notecard" aria-labelledby={titleId}>
      <div className="note-header">
        <div className="note-header-info">
          <h3 id={titleId} className="note-title">{title}</h3>
          <div className="note-tools">
            {/* Suppression uniquement */}
            <SquareButton
              ariaLabel={`Supprimer la note "${title}"`}
              onClick={() => onDelete(id)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">delete</span>
            </SquareButton>
          </div>
        </div>
        <span className="note-created-date">Créée le {date}</span>
      </div>
      <div className="note-content">
        <p className="paragraph">{content}</p>
      </div>
    </article>
  );
};
