import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET = '12345678901234567890123456789012';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'app_test';

vi.mock('../../src/database/db', () => ({
  pool: { query: vi.fn(), getConnection: vi.fn() },
  dbHealth: vi.fn().mockResolvedValue(true)
}));

let app: any;
let request: any;
let query: Mock;
let signAccessToken: any;

const token = () => signAccessToken({ id: 7, email: 'a@b.com', role: 1 });

beforeAll(async () => {
  request = (await import('supertest')).default;
  ({ app } = await import('../../src/app'));
  query = (await import('../../src/database/db')).pool.query as Mock;
  ({ signAccessToken } = await import('../../src/middleware/auth'));
});

beforeEach(() => {
  query.mockReset();
});

describe('notifications routes', () => {
  it('returns unread notification count', async () => {
    query.mockResolvedValueOnce([[{ count: 3 }]]);

    const res = await request(app).get('/api/notifications/unread-count').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ count: 3 });
  });

  it('lists in-app notifications', async () => {
    const rows = [{ id: 1, title: 'Nouveau commentaire', read_at: null }];
    query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
  });

  it('returns default preferences', async () => {
    const preferences = { user_id: 7, in_app_enabled: 1, email_enabled: 0, browser_push_enabled: 0, comments_enabled: 1, reactions_enabled: 1, support_enabled: 1, moderation_enabled: 1, system_enabled: 1 };
    query.mockResolvedValueOnce([{}]).mockResolvedValueOnce([[preferences]]);

    const res = await request(app).get('/api/notifications/preferences').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ user_id: 7, in_app_enabled: true, email_enabled: false });
  });

  it('updates preferences', async () => {
    const preferences = { user_id: 7, in_app_enabled: 0, email_enabled: 1, browser_push_enabled: 0, comments_enabled: 1, reactions_enabled: 1, support_enabled: 1, moderation_enabled: 1, system_enabled: 1 };
    query
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[preferences]]);

    const res = await request(app)
      .patch('/api/notifications/preferences')
      .set('Authorization', `Bearer ${token()}`)
      .send({ in_app_enabled: false, email_enabled: true });

    expect(res.status).toBe(200);
    expect(res.body.data.email_enabled).toBe(true);
  });

  it('marks a notification as read', async () => {
    query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app).patch('/api/notifications/12/read').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ read: true });
  });

  it('marks all notifications as read', async () => {
    query.mockResolvedValueOnce([{}]);

    const res = await request(app).patch('/api/notifications/read-all').set('Authorization', `Bearer ${token()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ read: true });
  });
});
