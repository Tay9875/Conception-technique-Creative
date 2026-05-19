import { http, HttpResponse } from 'msw';
import { API_URL } from '../../config/api';
import {
  mockComments,
  mockLoginResponse,
  mockPostsList,
  mockTags,
  mockUser,
} from '../helpers/fixtures';

export const handlers = [
  http.post(`${API_URL}/auth/login`, () =>
    HttpResponse.json({ success: true, data: mockLoginResponse })
  ),
  http.post(`${API_URL}/auth/register`, () =>
    HttpResponse.json({ success: true, data: { message: 'Inscription réussie !' } }, { status: 201 })
  ),
  http.get(`${API_URL}/posts`, () =>
    HttpResponse.json({ success: true, data: mockPostsList })
  ),
  http.post(`${API_URL}/posts`, () =>
    HttpResponse.json({ success: true, data: { id: 999 } }, { status: 201 })
  ),
  http.post(`${API_URL}/posts/:id/like`, () =>
    HttpResponse.json({ success: true, data: { liked: true } })
  ),
  http.post(`${API_URL}/posts/:id/report`, () =>
    HttpResponse.json({
      success: true,
      data: { banned: false, message: 'Signalement enregistré.' },
    })
  ),
  http.get(`${API_URL}/comments/:postId`, () =>
    HttpResponse.json({ success: true, data: mockComments })
  ),
  http.post(`${API_URL}/comments`, () =>
    HttpResponse.json({ success: true, data: { id: 999 } }, { status: 201 })
  ),
  http.get(`${API_URL}/tags`, () =>
    HttpResponse.json({ success: true, data: mockTags })
  ),
  http.get(`${API_URL}/users/:id`, () =>
    HttpResponse.json({ success: true, data: mockUser })
  ),
  http.get(`${API_URL}/auth/me`, () =>
    HttpResponse.json({ success: true, data: mockUser })
  ),
  http.get(`${API_URL}/notifications/unread-count`, () =>
    HttpResponse.json({ success: true, data: { count: 2 } })
  ),
  http.get(`${API_URL}/notifications`, () =>
    HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          user_id: 1,
          actor_user_id: 2,
          type: 'new_comment',
          title: 'Nouveau commentaire',
          body: 'Quelqu un a reagi a votre partage sur Oncarya.',
          href: '/article/10#comments',
          channel: 'in_app',
          metadata: null,
          read_at: null,
          created_at: '2026-05-19T10:00:00Z',
        },
      ],
    })
  ),
  http.patch(`${API_URL}/notifications/:id/read`, () =>
    HttpResponse.json({ success: true, data: { read: true } })
  ),
  http.patch(`${API_URL}/notifications/read-all`, () =>
    HttpResponse.json({ success: true, data: { read: true } })
  ),
  http.get(`${API_URL}/notifications/preferences`, () =>
    HttpResponse.json({
      success: true,
      data: {
        user_id: 1,
        in_app_enabled: true,
        email_enabled: false,
        browser_push_enabled: false,
        comments_enabled: true,
        reactions_enabled: true,
        support_enabled: true,
        moderation_enabled: true,
        system_enabled: true,
      },
    })
  ),
  http.patch(`${API_URL}/notifications/preferences`, async ({ request }) =>
    HttpResponse.json({
      success: true,
      data: {
        user_id: 1,
        in_app_enabled: false,
        email_enabled: true,
        browser_push_enabled: false,
        comments_enabled: true,
        reactions_enabled: true,
        support_enabled: true,
        moderation_enabled: true,
        system_enabled: true,
        ...((await request.json()) as Record<string, unknown>),
      },
    })
  ),
];
