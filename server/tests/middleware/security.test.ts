import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET = '12345678901234567890123456789012';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'app_test';

let buildRateLimit: any;
let helmetMw: any;
let compressionMw: any;

beforeAll(async () => {
  ({ buildRateLimit, helmetMw, compressionMw } = await import('../../src/middleware/security'));
});

describe('helmetMw', () => {
  it('adds standard security headers', async () => {
    const app = express();
    app.use(helmetMw);
    app.get('/', (_req, res) => res.send('ok'));

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });
});

describe('compressionMw', () => {
  it('returns a middleware function', () => {
    expect(typeof compressionMw).toBe('function');
  });
});

describe('buildRateLimit', () => {
  it('rejects with 429 after exceeding `max` in window (in-memory store)', async () => {
    const app = express();
    app.use(buildRateLimit(60_000, 2, 'unit_test')); // 2 requests / minute
    app.get('/', (_req, res) => res.send('ok'));

    const r1 = await request(app).get('/');
    const r2 = await request(app).get('/');
    const r3 = await request(app).get('/');

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
  });

  it('sets ratelimit headers (standardHeaders)', async () => {
    const app = express();
    app.use(buildRateLimit(60_000, 10, 'unit_headers'));
    app.get('/', (_req, res) => res.send('ok'));

    const res = await request(app).get('/');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});
