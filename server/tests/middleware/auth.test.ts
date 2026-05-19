import { describe, it, expect, vi, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET = '12345678901234567890123456789012';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'app_test';

let signAccessToken: any;
let signRefreshToken: any;
let requireAuth: any;
let env: any;
let jwt: any;

beforeAll(async () => {
  ({ signAccessToken, signRefreshToken, requireAuth } = await import('../../src/middleware/auth'));
  ({ env } = await import('../../src/config/env'));
  jwt = (await import('jsonwebtoken')).default;
});

const mockRes = () => {
  const res: any = {};
  res.statusCode = 200;
  res.status = vi.fn((c: number) => { res.statusCode = c; return res; });
  res.json = vi.fn((b: unknown) => { res.body = b; return res; });
  return res;
};

describe('requireAuth', () => {
  it('returns 401 when no Authorization header', () => {
    const req: any = { headers: {} };
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header is not Bearer-prefixed', () => {
    const req: any = { headers: { authorization: 'Basic xyz' } };
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    const req: any = { headers: { authorization: 'Bearer not.a.token' } };
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next() for a valid token', () => {
    const token = signAccessToken({ id: 42, email: 'a@b.com', role: 1 });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 42, email: 'a@b.com', role: 1 });
  });
});

describe('signAccessToken / signRefreshToken', () => {
  it('produces a JWT verifiable with the configured access secret', () => {
    const token = signAccessToken({ id: 1, email: 'a@b.com', role: 1 });
    expect(typeof token).toBe('string');
    const decoded = jwt.verify(token, env.jwtSecret) as any;
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe(1);
  });

  it('produces a refresh JWT verifiable with the refresh secret', () => {
    const token = signRefreshToken({ id: 5 });
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as any;
    expect(decoded.id).toBe(5);
  });
});
