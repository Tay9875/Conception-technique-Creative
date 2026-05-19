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

describe('GET /api/users/me', () => {
  it('returns the current user (no password field)', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });
    query.mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', role_id: 1 }]]);

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', role_id: 1 });
    expect(res.body.data.password).toBeUndefined();
  });

  it('returns 404 when user does not exist in DB', async () => {
    const token = signAccessToken({ id: 999, email: 'gone@x.com', role: 1 });
    query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('returns 401 when no auth header', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
