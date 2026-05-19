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

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async (pw: string) => `hashed:${pw}`),
    compare: vi.fn(async (pw: string, hash: string) => hash === `hashed:${pw}`)
  },
  hash: vi.fn(async (pw: string) => `hashed:${pw}`),
  compare: vi.fn(async (pw: string, hash: string) => hash === `hashed:${pw}`)
}));

let app: any;
let request: any;
let query: Mock;
let bcrypt: any;
let signRefreshToken: any;

beforeAll(async () => {
  request = (await import('supertest')).default;
  ({ app } = await import('../../src/app'));
  query = (await import('../../src/database/db')).pool.query as Mock;
  bcrypt = (await import('bcrypt')).default;
  ({ signRefreshToken } = await import('../../src/middleware/auth'));
});

beforeEach(() => {
  query.mockReset();
  (bcrypt.hash as Mock).mockClear?.();
  (bcrypt.compare as Mock).mockClear?.();
});

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    query
      .mockResolvedValueOnce([[]]) // SELECT email check, empty -> not taken
      .mockResolvedValueOnce([{ insertId: 1 }]); // INSERT user

    const res = await request(app).post('/api/auth/register').send({
      firstname: 'John', lastname: 'Doe', email: 'john@example.com', password: 'Password1234'
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(bcrypt.hash).toHaveBeenCalled();
  });

  it('returns 409 if email already taken', async () => {
    query.mockResolvedValueOnce([[{ id: 1 }]]);
    const res = await request(app).post('/api/auth/register').send({
      firstname: 'John', lastname: 'Doe', email: 'john@example.com', password: 'Password1234'
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PAYLOAD');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in successfully and returns token shape', async () => {
    query
      .mockResolvedValueOnce([[{ id: 1, firstname: 'John', lastname: 'Doe', email: 'john@example.com', password: 'hashed:Password1234', role_id: 1 }]])
      .mockResolvedValueOnce([{}]); // INSERT refresh_tokens

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com', password: 'Password1234'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf('string');
    expect(res.body.data.refreshToken).toBeTypeOf('string');
    expect(res.body.data.user).toMatchObject({ id: 1, firstname: 'John', lastname: 'Doe', role_id: 1 });
  });

  it('returns 401 for bad password', async () => {
    query.mockResolvedValueOnce([[{ id: 1, firstname: 'John', lastname: 'Doe', email: 'john@example.com', password: 'hashed:Password1234', role_id: 1 }]]);

    const res = await request(app).post('/api/auth/login').send({
      email: 'john@example.com', password: 'WrongPassword'
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 when user not found', async () => {
    query.mockResolvedValueOnce([[]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'none@x.com', password: 'Password1234' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns new tokens with a valid refresh token', async () => {
    const refreshToken = signRefreshToken({ id: 1 });

    query
      .mockResolvedValueOnce([[{ id: 99 }]])  // SELECT refresh_tokens row exists
      .mockResolvedValueOnce([{}])             // UPDATE revoke old
      .mockResolvedValueOnce([{}])             // INSERT new refresh token
      .mockResolvedValueOnce([[{ id: 1, email: 'john@x.com', role_id: 1 }]]); // SELECT user

    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTypeOf('string');
    expect(res.body.data.refreshToken).toBeTypeOf('string');
  });

  it('returns 401 for an unverifiable refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'this.is.notvalid' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('returns 401 when token verifies but is not in DB', async () => {
    const refreshToken = signRefreshToken({ id: 1 });
    query.mockResolvedValueOnce([[]]); // SELECT empty
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('204s and revokes the token if valid', async () => {
    query.mockResolvedValueOnce([{}]);
    const res = await request(app).post('/api/auth/logout').send({ refreshToken: 'abcdefghijklmnop' });
    expect(res.status).toBe(204);
  });

  it('204s even without a payload (idempotent)', async () => {
    const res = await request(app).post('/api/auth/logout').send({});
    expect(res.status).toBe(204);
  });
});
