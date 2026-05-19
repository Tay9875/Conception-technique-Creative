import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MesArticles.css';
import AccessibleModal from './components/AccessibleModal';
import FeedForm from './components/FeedForm';
import { Header } from './components/Header';
import { Container } from './components/Container';
import { Empty } from './components/Empty';
import { SquareButton } from './components/SquareButton';
import { Footer } from './components/Footer';
import { BlogCard } from './components/BlogCard';
import { API_URL } from './config/api';
import { apiFetch } from './lib/apiClient';
import type { CreatePostPayload, PostWithDetails, SessionUser, Tag } from './types';

interface MesArticlesProps {
  user: SessionUser | null;
}

type SortLabel = 'Récents' | 'Populaires';

function MesArticles({ user }: MesArticlesProps) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [articles, setArticles] = useState<PostWithDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState<SortLabel>('Récents');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await apiFetch<Tag[]>(`${API_URL}/tags`);
        setTags(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMyArticles = async () => {
      if (!user || !user.id) return;
      try {
        const data = await apiFetch<PostWithDetails[]>(`${API_URL}/posts?user_id=${user.id}`);
        const myPosts = data.filter((post) => Number(post.user_id) === Number(user.id));
        setArticles(myPosts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTags();
    if (user && user.id) {
      fetchMyArticles();
    }
  }, [user]);

  const handleNoteSubmit = async (data: CreatePostPayload): Promise<void> => {
    if (!user || !user.id) return;

    try {
      await apiFetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(data),
      });

      setIsModalOpen(false);

      const refreshed = await apiFetch<PostWithDetails[]>(`${API_URL}/posts?user_id=${user.id}`);
      setArticles(refreshed.filter((post) => Number(post.user_id) === Number(user.id)));
      setSelectedTag(null);
      setActiveSort('Récents');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = (): void => {
    navigate('/');
  };

  const filtered = selectedTag
    ? articles.filter((article) => article.tag_id === selectedTag)
    : articles;

  const displayedArticles = [...filtered].sort((a, b) => {
    if (activeSort === 'Populaires') {
      return (b.like_count || 0) - (a.like_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main>
        <section className="articles-section">
          <div className="articles-section-container">
            <div className="articles-section-lien">
              <Link to="/" className="retour" aria-label="Retour à la page d'accueil">
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_back
                </span>
                Retour aux conseils
              </Link>
            </div>

            <div className="articles-section-heading">
              <div className="articles-heading">
                <h1 className="note-heading">Mes Articles</h1>
                <p className="paragraph">Apportez un soutien en partageant vos conseils</p>
              </div>

              <div className="nouvel-article">
                <SquareButton
                  className="sqr-button-dark-background no-resize"
                  onClick={() => navigate('/feed')}
                  aria-label="Créer un nouvel article"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    add
                  </span>
                  Nouvel Article
                </SquareButton>
              </div>
            </div>
          </div>
        </section>

        <Container
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        >
          {displayedArticles.length > 0 ? (
            displayedArticles.map((article) => (
              <BlogCard key={article.id} article={article} user={user} />
            ))
          ) : (
            <Empty aria-label="Aucun article disponible">
              <p className="empty-text">
                Vous n'avez pas encore publié d'articles ou aucun ne correspond au filtre.
              </p>
              <SquareButton
                className="sqr-button-dark-background"
                onClick={handleClick}
                aria-label="Découvrir des conseils et revenir à l'accueil"
              >
                Découvrir des conseils
              </SquareButton>
            </Empty>
          )}
        </Container>
      </main>

      {isModalOpen && (
        <AccessibleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nouvel Article"
        >
          <FeedForm tags={tags} onSubmit={handleNoteSubmit} />
        </AccessibleModal>
      )}

      <Footer />
    </>
  );
}

export default MesArticles;
