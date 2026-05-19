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

beforeAll(async () => {
  request = (await import('supertest')).default;
  ({ app } = await import('../../src/app'));
  query = (await import('../../src/database/db')).pool.query as Mock;
});

beforeEach(() => {
  query.mockReset();
});

describe('GET /api/tags', () => {
  it('returns sorted tags with success envelope', async () => {
    const rows = [
      { id: 1, title: 'Alpha' },
      { id: 2, title: 'Beta' }
    ];
    query.mockResolvedValueOnce([rows]);

    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: rows });
    expect(query).toHaveBeenCalledWith('SELECT id, title FROM tags ORDER BY title ASC');
  });

  it('returns empty array when no tags exist', async () => {
    query.mockResolvedValueOnce([[]]);

    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [] });
  });
});
