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
let signAccessToken: any;
let bcrypt: any;

beforeAll(async () => {
  request = (await import('supertest')).default;
  ({ app } = await import('../../src/app'));
  query = (await import('../../src/database/db')).pool.query as Mock;
  ({ signAccessToken } = await import('../../src/middleware/auth'));
  bcrypt = (await import('bcrypt')).default;
});

beforeEach(() => {
  query.mockReset();
  (bcrypt.hash as Mock).mockClear?.();
  (bcrypt.compare as Mock).mockClear?.();
});

describe('GET /api/users/me', () => {
  it('returns the current user (no password field)', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });
    query.mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: 'hashed:Password1234', role_id: 1, avatar_url: null, email_verified: 0, profile_status: 'patient', has_google: 1 }]]);

    const res = await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: 7,
      firstname: 'A',
      lastname: 'B',
      email: 'a@b.com',
      role_id: 1,
      authProviders: ['password', 'google'],
      hasPassword: true,
      canChangePassword: true,
      profileStatus: 'patient'
    });
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

describe('PATCH /api/users/me', () => {
  it('updates profile status with allowed values', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });
    query
      .mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: 'hashed:Password1234', role_id: 1, avatar_url: null, email_verified: 1, profile_status: 'patient', has_google: 0 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: 'hashed:Password1234', role_id: 1, avatar_url: null, email_verified: 1, profile_status: 'caregiver', has_google: 0 }]]);

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ profileStatus: 'caregiver' });

    expect(res.status).toBe(200);
    expect(res.body.data.profileStatus).toBe('caregiver');
    expect(query.mock.calls[1][0]).toContain('profile_status = ?');
  });

  it('rejects invalid profile status values', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ profileStatus: 'admin' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PAYLOAD');
  });

  it('allows password change when a local password exists', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });
    query
      .mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: 'hashed:OldPassword123', role_id: 1, avatar_url: null, email_verified: 1, profile_status: 'patient', has_google: 0 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: 'hashed:NewPassword123', role_id: 1, avatar_url: null, email_verified: 1, profile_status: 'patient', has_google: 0 }]]);

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'OldPassword123', newPassword: 'NewPassword123' });

    expect(res.status).toBe(200);
    expect(bcrypt.compare).toHaveBeenCalledWith('OldPassword123', 'hashed:OldPassword123');
    expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123', 12);
    expect(query.mock.calls[1][0]).toContain('password = ?');
    expect(res.body.data.canChangePassword).toBe(true);
  });

  it('refuses password change for Google-only accounts', async () => {
    const token = signAccessToken({ id: 7, email: 'a@b.com', role: 1 });
    query.mockResolvedValueOnce([[{ id: 7, firstname: 'A', lastname: 'B', email: 'a@b.com', password: null, role_id: 1, avatar_url: null, email_verified: 1, profile_status: 'prefer_not_to_say', has_google: 1 }]]);

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'whatever', newPassword: 'NewPassword123' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PASSWORD_NOT_AVAILABLE');
    expect(res.body.error.message).toContain('Google');
  });
});
