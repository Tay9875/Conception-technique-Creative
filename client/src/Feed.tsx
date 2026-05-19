import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './components/Header';
import FeedForm from './components/FeedForm';
import './Feed.css';
import { API_URL } from './config/api';
import { apiFetch } from './lib/apiClient';
import type { CreatePostPayload, CreatePostResponse, SessionUser, Tag } from './types';

interface FeedProps {
  user: SessionUser | null;
  onLogout?: () => void;
}

export default function Feed(_props: FeedProps) {
  const navigate = useNavigate();

  const [tags, setTags] = useState<Tag[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

  const statusRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    apiFetch<Tag[]>(`${API_URL}/tags`).then(setTags).catch(console.error);
  }, []);

  useEffect(() => {
    if (statusMessage) {
      statusRef.current?.focus();
    }
  }, [statusMessage]);

  const handleCreatePost = async (payload: CreatePostPayload): Promise<void> => {
    setError(false);
    setStatusMessage('');

    try {
      await apiFetch<CreatePostResponse>(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(payload),
      });

      setStatusMessage('Article publié avec succès 🎉');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      console.error(err);
      setError(true);
      setStatusMessage('Une erreur est survenue lors de la publication.');
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main className="feed-container" id="main-content">
        <section className="feed-card" aria-labelledby="feed-title">
          <header className="feed-header">
            <h1 className="feed-h1">Créer un article</h1>
            <p>Partage ton expérience avec la communauté</p>
          </header>

          {statusMessage && (
            <p
              ref={statusRef}
              tabIndex={-1}
              aria-live="assertive"
              className={`status-message ${error ? 'error' : 'success'}`}
            >
              {statusMessage}
            </p>
          )}

          <FeedForm tags={tags} onSubmit={handleCreatePost} />
        </section>
      </main>
    </>
  );
}
