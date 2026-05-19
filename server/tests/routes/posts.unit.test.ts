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

const connQuery = vi.fn();
const conn = {
  beginTransaction: vi.fn(async () => {}),
  query: connQuery,
  commit: vi.fn(async () => {}),
  rollback: vi.fn(async () => {}),
  release: vi.fn(() => {})
};

vi.mock('../../src/database/db', () => ({
  pool: {
    query: vi.fn(),
    getConnection: vi.fn(async () => conn)
  },
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
  connQuery.mockReset();
  conn.beginTransaction.mockClear();
  conn.commit.mockClear();
  conn.rollback.mockClear();
  conn.release.mockClear();
});

describe('GET /api/posts', () => {
  it('returns posts for anonymous user', async () => {
    const rows = [{ id: 1, title: 't', description: 'd', created_at: 'x', user_id: 1, tag_id: 1, firstname: 'A', lastname: 'B', tag_title: 'T', like_count: 0, is_liked: 0 }];
    query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: rows });
  });

  it('returns 400 for invalid pagination', async () => {
    const res = await request(app).get('/api/posts?page=0');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PAGINATION');
  });

  it('supports limit/page params', async () => {
    query.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/posts?page=2&limit=5');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/posts', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/posts').send({ title: 't', description: 'd', tag_id: 1 });
    expect(res.status).toBe(401);
  });

  it('returns 201 with { id } when authenticated', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    query.mockResolvedValueOnce([{ insertId: 123 }]);

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hello', description: 'World', tag_id: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: 123 });
  });

  it('creates and shadow-bans high-risk posts without changing the public response', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    connQuery
      .mockResolvedValueOnce([{ insertId: 456 }])
      .mockResolvedValueOnce([{}]);

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Conseil dangereux', description: 'Arrete la chimio et remplace ton traitement par ce produit.', tag_id: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: 456 });
    expect(connQuery.mock.calls[0][0]).toContain('is_banned');
    expect(connQuery.mock.calls[0][1][4]).toBe(1);
    expect(connQuery.mock.calls[1][0]).toContain('moderation_reviews');
    expect(conn.commit).toHaveBeenCalled();
  });

  it('returns 400 for invalid body', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/posts/:id/like', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/posts/1/like');
    expect(res.status).toBe(401);
  });

  it('inserts a like when not yet liked', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    query
      .mockResolvedValueOnce([[]])  // SELECT likes - none
      .mockResolvedValueOnce([{}]); // INSERT like
    const res = await request(app).post('/api/posts/1/like').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ liked: true });
  });

  it('deletes a like when already liked (toggle off)', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    query
      .mockResolvedValueOnce([[{ id: 1 }]]) // already liked
      .mockResolvedValueOnce([{}]);          // DELETE
    const res = await request(app).post('/api/posts/1/like').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ liked: false });
  });
});

describe('POST /api/posts/:id/report', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/posts/1/report').send({ reason: 'spam' });
    expect(res.status).toBe(401);
  });

  it('records a report (under threshold)', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    connQuery
      .mockResolvedValueOnce([{}])                // INSERT report
      .mockResolvedValueOnce([[{ count: 1 }]]);   // SELECT count
    const res = await request(app).post('/api/posts/1/report').set('Authorization', `Bearer ${token}`).send({ reason: 'spam' });
    expect(res.status).toBe(200);
    expect(res.body.data.banned).toBe(false);
    expect(conn.commit).toHaveBeenCalled();
  });

  it('returns 409 on duplicate report (ER_DUP_ENTRY)', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    const dupErr: any = new Error('dup');
    dupErr.code = 'ER_DUP_ENTRY';
    connQuery.mockRejectedValueOnce(dupErr);
    const res = await request(app).post('/api/posts/1/report').set('Authorization', `Bearer ${token}`).send({ reason: 'spam' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_REPORTED');
    expect(conn.rollback).toHaveBeenCalled();
  });

  it('auto-bans post when report count >= 3', async () => {
    const token = signAccessToken({ id: 5, email: 'a@b.com', role: 1 });
    connQuery
      .mockResolvedValueOnce([{}])                  // INSERT
      .mockResolvedValueOnce([[{ count: 3 }]])      // SELECT count = 3
      .mockResolvedValueOnce([{}]);                 // UPDATE posts SET is_banned
    const res = await request(app).post('/api/posts/1/report').set('Authorization', `Bearer ${token}`).send({ reason: 'spam' });
    expect(res.status).toBe(200);
    expect(res.body.data.banned).toBe(true);
  });
});
