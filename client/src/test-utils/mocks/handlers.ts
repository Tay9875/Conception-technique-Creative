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
];
