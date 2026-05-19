import './Article.css';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Header } from './components/Header';
import AccessibleModal from './components/AccessibleModal';
import { SquareButton } from './components/SquareButton';
import { Tag as TagBadge } from './components/Tags';
import ReportForm from './components/ReportForm';
import { CommentSection } from './components/CommentSection';
import { API_URL } from './config/api';
import { apiFetch } from './lib/apiClient';
import type { LikeResponse, PostWithDetails, ReportResponse, SessionUser } from './types';

interface ArticleProps {
  user: SessionUser | null;
}

function Article({ user }: ArticleProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [article, setArticle] = useState<PostWithDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const posts = await apiFetch<PostWithDetails[]>(`${API_URL}/posts`);
        const found = posts.find((post) => String(post.id) === String(id));
        if (!found) throw new Error('Article introuvable');

        setArticle(found);
        setIsLiked(found.is_liked === 1);
        setLikesCount(found.like_count || 0);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger l’article.');
      }
    };

    fetchArticle();
  }, [id]);

  const handleLike = async (): Promise<void> => {
    if (!user || !user.id) {
      alert('Veuillez vous connecter pour aimer un article.');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

    try {
      await apiFetch<LikeResponse>(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      });
    } catch (err) {
      console.error('Erreur like:', err);
      setIsLiked(!newLikedState);
      setLikesCount((prev) => (newLikedState ? prev - 1 : prev + 1));
    }
  };

  const handleReport = async (): Promise<void> => {
    if (!user || !user.id) {
      alert('Veuillez vous connecter pour signaler.');
      return;
    }

    try {
      const data = await apiFetch<ReportResponse>(`${API_URL}/posts/${id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({}),
      });

      alert(data.message || 'Signalement pris en compte.');
      setIsModalOpen(false);
      if (data.banned) {
        alert('Cet article a été supprimé par la communauté suite aux signalements.');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!article && !error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: '2rem' }}>Chargement de l’article…</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header theme={theme} setTheme={setTheme} />
        <p style={{ padding: '2rem' }}>{error}</p>
      </>
    );
  }

  const currentArticle = article as PostWithDetails;
  const tagTitle = currentArticle.tag_title ?? null;

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <section className="article-container">
        <article className="article">
          <Link to="/" className="article-link">
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Retour aux articles
          </Link>

          <main className="article-text" id="main-content">
            {tagTitle && (
              <div className="tags">
                <TagBadge>{tagTitle}</TagBadge>
              </div>
            )}

            <div className="main-container">
              <header className="article-detail-heading">
                <h1 id="article-title" className="article-title">
                  {currentArticle.title}
                </h1>
                <div
                  className="article-meta"
                  style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}
                >
                  Par {currentArticle.firstname} {currentArticle.lastname} • Le{' '}
                  {new Date(currentArticle.created_at).toLocaleDateString()}
                </div>
              </header>

              <p className="article-content">{currentArticle.description}</p>
            </div>
          </main>

          {user && user.id && (
            <section className="article-tools" aria-label="Actions sur l'article">
              <div className="article-appreciation">
                <SquareButton
                  className="sqr-button-dark-background"
                  aria-label={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={isLiked}
                  onClick={handleLike}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {isLiked ? 'favorite' : 'favorite_border'}
                  </span>
                  <span style={{ marginLeft: '5px', fontSize: '0.9rem' }}>{likesCount}</span>
                </SquareButton>

                <SquareButton
                  className="sqr-button-dark-background"
                  aria-expanded={commentsOpen}
                  aria-controls="comments-container"
                  aria-haspopup="menu"
                  aria-label="Afficher ou masquer les commentaires"
                  onClick={() => setCommentsOpen((prev) => !prev)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    sms
                  </span>
                </SquareButton>
              </div>

              <SquareButton
                className="sqr-button-dark-background"
                aria-label="Signaler cet article"
                onClick={() => setIsModalOpen(true)}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  report
                </span>
              </SquareButton>
            </section>
          )}

          {commentsOpen && (
            <CommentSection
              id="comments-container"
              isOpen={commentsOpen}
              articleId={currentArticle.id}
              user={user}
            />
          )}
        </article>
      </section>

      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signaler cet article"
      >
        <ReportForm onCancel={() => setIsModalOpen(false)} onSubmit={handleReport} />
      </AccessibleModal>
    </>
  );
}

export default Article;
