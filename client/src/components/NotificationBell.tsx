import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Popover from '@radix-ui/react-popover';
import '../styles/NotificationBell.css';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../lib/notifications';
import type { NotificationItem, SessionUser } from '../types';

interface NotificationBellProps {
  user: SessionUser | null;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export function NotificationBell({ user }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCount = async () => {
    if (!user) return;
    try {
      const data = await fetchUnreadNotificationCount();
      setUnreadCount(data.count);
    } catch {
      setUnreadCount(0);
    }
  };

  const loadItems = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchNotifications();
      setItems(data);
    } catch {
      setError('Notifications indisponibles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCount();
  }, [user?.id]);

  useEffect(() => {
    if (open) loadItems();
  }, [open]);

  if (!user) return null;

  const handleRead = async (item: NotificationItem) => {
    if (!item.read_at) {
      await markNotificationAsRead(item.id);
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    if (item.href) {
      setOpen(false);
      navigate(item.href);
    }
  };

  const handleReadAll = async () => {
    await markAllNotificationsAsRead();
    setItems((current) =>
      current.map((entry) => ({ ...entry, read_at: entry.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="notification-trigger"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ''}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            notifications
          </span>
          <span className="notification-live sr-only" aria-live="polite">
            {unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Aucune notification non lue'}
          </span>
          {unreadCount > 0 && (
            <span className="notification-badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="notification-popover" align="end" sideOffset={10}>
          <header className="notification-popover-header">
            <div>
              <h2>Notifications</h2>
              <p>{unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est a jour'}</p>
            </div>
            <button type="button" className="notification-link-button" onClick={handleReadAll}>
              Tout lire
            </button>
          </header>

          {loading && (
            <div className="notification-skeleton" aria-label="Chargement des notifications">
              <span />
              <span />
              <span />
            </div>
          )}

          {error && !loading && (
            <div className="notification-empty" role="status">
              <p>{error}</p>
              <button type="button" onClick={loadItems}>
                Reessayer
              </button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="notification-empty" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">
                check_circle
              </span>
              <p>Aucune notification pour le moment.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <ul className="notification-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`notification-item ${item.read_at ? '' : 'is-unread'}`}
                    onClick={() => handleRead(item)}
                  >
                    <span className="notification-item-dot" aria-hidden="true" />
                    <span className="notification-item-text">
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                      <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Popover.Arrow className="notification-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
