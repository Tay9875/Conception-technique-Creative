import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/BlogCard.css";
import { API_URL } from "../config/api";
import { apiFetch } from "../lib/apiClient";

const Tag = ({ children }: { children: React.ReactNode }) => <span className="tag-badge">{children}</span>;

interface Article { id: number; title: string; description: string; created_at: string; firstname?: string; lastname?: string; tag_title?: string; like_count?: number; is_liked?: number; tag?: { title: string }; role_id?: number; }
interface BlogCardProps { article: Article; user?: any; }

export const BlogCard: React.FC<BlogCardProps> = ({ article, user }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(article.is_liked === 1);
  const [likesCount, setLikesCount] = useState(article.like_count || 0);
  const [isVisible, setIsVisible] = useState(true);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user?.id) return alert("Veuillez vous connecter pour aimer un article.");
    const optimistic = !isLiked;
    setIsLiked(optimistic);
    setLikesCount((prev) => (optimistic ? prev + 1 : prev - 1));
    try {
      const data = await apiFetch(`${API_URL}/posts/${article.id}/like`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setIsLiked(data.liked);
    } catch (error) { console.error(error); }
  };

  const handleReport = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user?.id) return alert("Veuillez vous connecter pour signaler un contenu.");
    if (!window.confirm("Voulez-vous vraiment signaler ce contenu comme inapproprié ?")) return;
    try {
      const data = await apiFetch(`${API_URL}/posts/${article.id}/report`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify({}) });
      alert(data.message);
      if (data.banned) setIsVisible(false);
    } catch (error: any) { alert(`Erreur : ${error.message}`); }
  };

  if (!isVisible) return null;
  const authorName = article.firstname && article.lastname ? `${article.firstname} ${article.lastname}` : "Anonyme";
  const displayTag = article.tag_title || (article.tag ? article.tag.title : null);
  const roleLabel = article.role_id === 1 ? 'Patient' : article.role_id === 2 ? 'Ancien Patient' : article.role_id === 3 ? 'Proche' : 'Inconnu';

  return (
    <article className="blogcard" tabIndex={0} onClick={() => navigate(`/article/${article.id}`)}>
      <div className="text">
        <div className="blogcard-tags">{displayTag && <Tag>{displayTag}</Tag>}</div>
        <div className="blogcard-container"><header className="heading"><h3 className="blogcard-title">{article.title}</h3></header><p className="blogcard-paragraph">{article.description}</p></div>
        <footer className="blogcard-tools">
          <div className="blogcard-infos"><p className="blogcard-author">{authorName} {article.role_id && <span>[ {roleLabel} ]</span>}</p><time className="date">{new Date(article.created_at).toLocaleDateString("fr-FR")}</time></div>
          <div className="blogcard-action">
            <button type="button" className="transparent-btn" onClick={handleLike}><span className="material-symbols-outlined">{isLiked ? "favorite" : "favorite_border"}</span><span>{likesCount}</span></button>
            <Link to={`/article/${article.id}#comments`} className="transparent-btn" onClick={(e) => e.stopPropagation()}><span className="material-symbols-outlined">sms</span></Link>
            <button type="button" className="transparent-btn" onClick={handleReport}><span className="material-symbols-outlined">flag</span></button>
          </div>
        </footer>
      </div>
    </article>
  );
};
