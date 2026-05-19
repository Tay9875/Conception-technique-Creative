import '../styles/CommentCard.css';

interface CommentCardProps {
  author: string;
  date: string;
  content: string;
}

export const CommentCard = ({ author, date, content }: CommentCardProps) => {
  return (
    <article className="comment-card" aria-labelledby={`comment-${author}-${date}`}>
      <header className="comment-header">
        <span className="material-symbols-outlined" aria-hidden="true">
          person
        </span>
        <p id={`comment-${author}-${date}`} className="comment-author">{author}</p>
        <time className="comment-date" dateTime={date}>
          {new Date(date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>
      <div className="comment-content">
        <p>{content}</p>
      </div>
    </article>
  );
};
