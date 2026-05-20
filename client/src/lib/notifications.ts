import { API_URL } from '../config/api';
import { apiFetch } from './apiClient';
import type {
  NotificationItem,
  NotificationPreferencePatch,
  NotificationPreferences,
} from '../types';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

export const fetchNotifications = () =>
  apiFetch<NotificationItem[]>(`${API_URL}/notifications`, {
    headers: authHeaders(),
  });

export const fetchUnreadNotificationCount = () =>
  apiFetch<{ count: number }>(`${API_URL}/notifications/unread-count`, {
    headers: authHeaders(),
  });

export const markNotificationAsRead = (id: number) =>
  apiFetch<{ read: boolean }>(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });

export const markAllNotificationsAsRead = () =>
  apiFetch<{ read: boolean }>(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: authHeaders(),
  });

export const fetchNotificationPreferences = () =>
  apiFetch<NotificationPreferences>(`${API_URL}/notifications/preferences`, {
    headers: authHeaders(),
  });

export const updateNotificationPreferences = (patch: NotificationPreferencePatch) =>
  apiFetch<NotificationPreferences>(`${API_URL}/notifications/preferences`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });
