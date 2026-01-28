import "../styles/NotesCard.css";
import { SquareButton } from "./SquareButton.tsx";

export const NoteCard: React.FC<{ id: string; title: string; content: string; date: string }> = ({ id, title, content, date }) => {
  const titleId = `note-${id}-title`;

  return (
    <article className="notecard" aria-labelledby={titleId}>
      <div className="note-header">
        <div className="note-header-info">
          <h3 id={titleId} className="note-title">{title}</h3>
          <div className="note-tools">
            <SquareButton ariaLabel={`Modifier la note "${title}"`}>
              <span className="material-symbols-outlined" aria-hidden="true">edit</span>
            </SquareButton>
            <SquareButton ariaLabel={`Supprimer la note "${title}"`}>
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
