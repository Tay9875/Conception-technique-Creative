import { useState, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/BlogCard.css';
import { API_URL } from '../config/api';
import { apiFetch, ApiError } from '../lib/apiClient';
import type { LikeResponse, PostWithDetails, ProfileStatus, ReportResponse, SessionUser } from '../types';

const TagBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="tag-badge">{children}</span>
);

interface BlogCardProps {
  article: PostWithDetails & { role_id?: number; tag?: { title: string } };
  user?: SessionUser | null;
}

const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  patient: 'Patient',
  former_patient: 'Ancien patient',
  caregiver: 'Proche ou aidant',
  prefer_not_to_say: 'Non précisé',
};

const getProfileStatusLabel = (article: BlogCardProps['article']) => {
  if (article.profile_status) return PROFILE_STATUS_LABELS[article.profile_status];
  if (article.role_id === 1) return 'Patient';
  if (article.role_id === 2) return 'Ancien patient';
  if (article.role_id === 3) return 'Proche';
  return null;
};

export const BlogCard = ({ article, user }: BlogCardProps) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState<boolean>(article.is_liked === 1);
  const [likesCount, setLikesCount] = useState<number>(article.like_count || 0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleLike = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (!user?.id) {
      alert('Veuillez vous connecter pour aimer un article.');
      return;
    }
    const optimistic = !isLiked;
    setIsLiked(optimistic);
    setLikesCount((prev) => (optimistic ? prev + 1 : prev - 1));
    try {
      const data = await apiFetch<LikeResponse>(`${API_URL}/posts/${article.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
      });
      setIsLiked(data.liked);
    } catch (error) {
      console.error(error);
      setIsLiked(!optimistic);
      setLikesCount((prev) => (optimistic ? prev - 1 : prev + 1));
    }
  };

  const handleReport = async (e: MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.stopPropagation();
    if (!user?.id) {
      alert('Veuillez vous connecter pour signaler un contenu.');
      return;
    }
    if (!window.confirm('Voulez-vous vraiment signaler ce contenu comme inapproprié ?')) return;
    try {
      const data = await apiFetch<ReportResponse>(`${API_URL}/posts/${article.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({}),
      });
      alert(data.message);
      if (data.banned) setIsVisible(false);
    } catch (error) {
      const apiErr = error as ApiError;
      alert(`Erreur : ${apiErr.message}`);
    }
  };

  if (!isVisible) return null;
  const authorName =
    article.firstname && article.lastname
      ? `${article.firstname} ${article.lastname}`
      : 'Anonyme';
  const displayTag = article.tag_title ?? article.tag?.title ?? null;
  const profileStatusLabel = getProfileStatusLabel(article);

  return (
    <article className="blogcard" tabIndex={0} onClick={() => navigate(`/article/${article.id}`)}>
      <div className="text">
        <div className="blogcard-tags">{displayTag && <TagBadge>{displayTag}</TagBadge>}</div>
        <div className="blogcard-container">
          <header className="heading">
            <h3 className="blogcard-title">{article.title}</h3>
          </header>
          <p className="blogcard-paragraph">{article.description}</p>
        </div>
        <footer className="blogcard-tools">
          <div className="blogcard-infos">
            <p className="blogcard-author">
              {authorName} {profileStatusLabel && <span>[ {profileStatusLabel} ]</span>}
            </p>
            <time className="date">
              {new Date(article.created_at).toLocaleDateString('fr-FR')}
            </time>
          </div>
          <div className="blogcard-action">
            <button type="button" className="transparent-btn" onClick={handleLike}>
              <span className="material-symbols-outlined">
                {isLiked ? 'favorite' : 'favorite_border'}
              </span>
              <span>{likesCount}</span>
            </button>
            <Link
              to={`/article/${article.id}#comments`}
              className="transparent-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined">sms</span>
            </Link>
            <button type="button" className="transparent-btn" onClick={handleReport}>
              <span className="material-symbols-outlined">flag</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
};
