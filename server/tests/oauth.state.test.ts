import { beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('oauth state helpers', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('round-trips a signed internal return path', async () => {
    const { createOAuthState, verifyOAuthState } = await import('../src/auth/oauthState');

    const state = createOAuthState('/feed');
    const payload = verifyOAuthState(state);

    expect(payload?.returnTo).toBe('/feed');
  });

  it('rejects tampered state', async () => {
    const { createOAuthState, verifyOAuthState } = await import('../src/auth/oauthState');

    const state = `${createOAuthState('/feed')}x`;

    expect(verifyOAuthState(state)).toBeNull();
  });

  it('sanitizes external redirects', async () => {
    const { createOAuthState, verifyOAuthState } = await import('../src/auth/oauthState');

    const payload = verifyOAuthState(createOAuthState('https://evil.example/phish'));

    expect(payload?.returnTo).toBe('/');
  });
});
