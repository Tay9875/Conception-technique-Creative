import './Accueil.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from './components/Header';
import { Container } from './components/Container';
import { BlogCard } from './components/BlogCard';
import { Empty } from './components/Empty';
import { Footer } from './components/Footer';
import BottomNav from './components/BottomNav';
import { API_URL } from './config/api';
import { apiFetch } from './lib/apiClient';
import type { PostWithDetails, SessionUser, Tag } from './types';

interface AccueilProps {
  user: SessionUser | null;
}

type SortLabel = 'Récents' | 'Populaires';

function Accueil({ user }: AccueilProps) {
  const [searchParams] = useSearchParams();
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [articles, setArticles] = useState<PostWithDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [activeSort, setActiveSort] = useState<SortLabel>('Récents');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await apiFetch<PostWithDetails[]>(`${API_URL}/posts`);
        setArticles(data);
      } catch (error) {
        console.error(error);
      }
    };
    const fetchTags = async () => {
      try {
        const data = await apiFetch<Tag[]>(`${API_URL}/tags`);
        setTags(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchArticles();
    fetchTags();
  }, []);

  useEffect(() => {
    const tag = Number(searchParams.get('tag'));
    setSelectedTag(Number.isFinite(tag) && tag > 0 ? tag : null);
  }, [searchParams]);

  const authorFilter = searchParams.get('author')?.trim().toLowerCase();

  const filteredByTag = selectedTag
    ? articles.filter((article) => article.tag_id === selectedTag)
    : articles;

  const filtered = authorFilter
    ? filteredByTag.filter((article) =>
        `${article.firstname || ''} ${article.lastname || ''}`.trim().toLowerCase() === authorFilter
      )
    : filteredByTag;

  const displayedArticles = [...filtered].sort((a, b) => {
    if (activeSort === 'Populaires') {
      return (b.like_count || 0) - (a.like_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <section className="section">
        <div className="section-container">
          <div className="section-heading">
            <h1>Partageons nos expériences, soutenons-nous mutuellement</h1>
          </div>
          <div className="section-paragraph">
            <p>
              Bienvenue sur notre espace d'entraide où les patients peuvent échanger des conseils et
              se soutenir.
            </p>
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
            <p className="empty-text">Aucun article ne correspond à ce filtre.</p>
          </Empty>
        )}
      </Container>

      <Footer />
      <BottomNav />
    </>
  );
}

export default Accueil;
