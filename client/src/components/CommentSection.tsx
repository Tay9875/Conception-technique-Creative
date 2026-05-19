import { useCallback, useEffect, useState } from 'react';
import '../styles/CommentSection.css';
import { CommentCard } from './CommentCard';
import CommentForm from './CommentForm';
import { API_URL } from '../config/api';
import { apiFetch } from '../lib/apiClient';
import type { Comment, SessionUser } from '../types';

interface CommentSectionProps {
  id?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  articleId: number;
  user: SessionUser | null;
}

interface CommentSubmitData {
  titre?: string;
  contenu: string;
}

export const CommentSection = ({ isOpen, articleId, user }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const fetchComments = useCallback(async () => {
    try {
      const data = await apiFetch<Comment[]>(`${API_URL}/comments/${articleId}`);
      setComments(data || []);
    } catch (error) {
      console.error('Erreur chargement commentaires', error);
    }
  }, [articleId]);

  useEffect(() => {
    if (isOpen && articleId) fetchComments();
  }, [isOpen, articleId, fetchComments]);

  const handleAddComment = async (formData: CommentSubmitData): Promise<void> => {
    const textContent = formData.contenu;
    if (!user || !user.id) {
      alert('Vous devez être connecté pour commenter.');
      return;
    }
    if (!textContent) return;

    try {
      await apiFetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({ description: textContent, post_id: articleId }),
      });
      await fetchComments();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <section className="comment-section" id="comments-container">
      <div aria-live="polite" className="comments-container">
        <div style={{ marginBottom: '20px' }}>
          <CommentForm onSubmit={handleAddComment} />
        </div>
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <CommentCard
              key={c.id || i}
              author={c.firstname ? `${c.firstname} ${c.lastname ?? ''}` : 'Utilisateur'}
              date={c.created_at}
              content={c.description}
            />
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
            Soyez le premier à commenter !
          </p>
        )}
      </div>
    </section>
  );
};
