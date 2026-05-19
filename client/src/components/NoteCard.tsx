import '../styles/NotesCard.css';
import { SquareButton } from './SquareButton';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const NoteCard = ({ id, title, content, date }: NoteCardProps) => {
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
