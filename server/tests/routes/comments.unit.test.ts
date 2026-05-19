import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
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

beforeAll(async () => {
  request = (await import('supertest')).default;
  ({ app } = await import('../../src/app'));
  query = (await import('../../src/database/db')).pool.query as Mock;
  ({ signAccessToken } = await import('../../src/middleware/auth'));
});

beforeEach(() => {
  query.mockReset();
});

describe('GET /api/comments/:postId', () => {
  it('returns comments array', async () => {
    const rows = [
      { id: 1, description: 'hello', created_at: '2026-01-01', user_id: 1, firstname: 'A', lastname: 'B' }
    ];
    query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/comments/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: rows });
  });

  it('returns 400 for non-numeric postId', async () => {
    const res = await request(app).get('/api/comments/abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PARAMS');
  });
});

describe('POST /api/comments', () => {
  it('creates a comment when authenticated with valid body', async () => {
    const token = signAccessToken({ id: 1, email: 'a@b.com', role: 1 });
    query.mockResolvedValueOnce([{ insertId: 42 }]);

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'nice post', post_id: 7 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(query).toHaveBeenCalled();
  });

  it('returns 401 when no auth header', async () => {
    const res = await request(app).post('/api/comments').send({ description: 'x', post_id: 1 });
    expect(res.status).toBe(401);
  });

  it('returns 400 when body invalid (missing description)', async () => {
    const token = signAccessToken({ id: 1, email: 'a@b.com', role: 1 });
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ post_id: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PAYLOAD');
  });
});
