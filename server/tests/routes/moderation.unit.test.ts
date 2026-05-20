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

const modToken = () => signAccessToken({ id: 1, email: 'mod@example.com', role: 3 });

describe('Moderation routes RBAC', () => {
  it('returns 401 without auth on ban', async () => {
    const res = await request(app).post('/api/moderation/posts/1/ban').send({});
    expect(res.status).toBe(401);
  });

  it('returns 403 with insufficient role on ban', async () => {
    const token = signAccessToken({ id: 1, email: 'a@b.com', role: 1 });
    const res = await request(app).post('/api/moderation/posts/1/ban').set('Authorization', `Bearer ${token}`).send({});
    expect(res.status).toBe(403);
  });
});

describe('POST /api/moderation/posts/:id/ban', () => {
  it('bans a post (204) when moderator role', async () => {
    connQuery.mockResolvedValueOnce([{}]).mockResolvedValueOnce([{}]);
    const res = await request(app).post('/api/moderation/posts/1/ban').set('Authorization', `Bearer ${modToken()}`).send({ reason: 'spam' });
    expect(res.status).toBe(204);
    expect(conn.commit).toHaveBeenCalled();
  });

  it('returns 500 on db error during ban (rolls back)', async () => {
    connQuery.mockRejectedValueOnce(new Error('db fail'));
    const res = await request(app).post('/api/moderation/posts/1/ban').set('Authorization', `Bearer ${modToken()}`).send({ reason: 'x' });
    expect(res.status).toBe(500);
    expect(conn.rollback).toHaveBeenCalled();
  });

  it('returns 400 for invalid id', async () => {
    const res = await request(app).post('/api/moderation/posts/abc/ban').set('Authorization', `Bearer ${modToken()}`).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/moderation/posts/:id/unban', () => {
  it('unbans a post (204)', async () => {
    connQuery.mockResolvedValueOnce([{}]).mockResolvedValueOnce([{}]);
    const res = await request(app).post('/api/moderation/posts/1/unban').set('Authorization', `Bearer ${modToken()}`).send({});
    expect(res.status).toBe(204);
  });

  it('returns 500 on db error during unban', async () => {
    connQuery.mockRejectedValueOnce(new Error('db fail'));
    const res = await request(app).post('/api/moderation/posts/1/unban').set('Authorization', `Bearer ${modToken()}`).send({});
    expect(res.status).toBe(500);
    expect(conn.rollback).toHaveBeenCalled();
  });
});

describe('GET /api/moderation/logs', () => {
  it('returns logs list', async () => {
    const rows = [
      { id: 1, moderator_id: 1, post_id: 2, action: 'ban', reason: null, created_at: 'now', firstname: 'A', lastname: 'B' }
    ];
    query.mockResolvedValueOnce([rows]);
    const res = await request(app).get('/api/moderation/logs').set('Authorization', `Bearer ${modToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
  });

  it('returns 400 for invalid pagination', async () => {
    const res = await request(app).get('/api/moderation/logs?page=0').set('Authorization', `Bearer ${modToken()}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/moderation/queue', () => {
  it('returns moderation review queue', async () => {
    const rows = [
      { id: 1, target_type: 'post', target_id: 10, status: 'needs_review', priority: 'high' }
    ];
    query.mockResolvedValueOnce([rows]);
    const res = await request(app).get('/api/moderation/queue').set('Authorization', `Bearer ${modToken()}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(rows);
  });
});
