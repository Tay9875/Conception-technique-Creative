import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

const setBaseEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.JWT_SECRET = '12345678901234567890123456789012';
  process.env.JWT_REFRESH_SECRET = '12345678901234567890123456789012';
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = '3306';
  process.env.DB_USER = 'root';
  process.env.DB_PASSWORD = 'root';
  process.env.DB_NAME = 'app_test';
};

describe('env loader', () => {
  beforeEach(() => {
    vi.resetModules();
    for (const k of Object.keys(process.env)) {
      if (!(k in ORIGINAL_ENV)) delete process.env[k];
    }
    Object.assign(process.env, ORIGINAL_ENV);
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('loads correctly with all required vars present', async () => {
    setBaseEnv();
    const { env } = await import('../../src/config/env');
    expect(env.nodeEnv).toBe('test');
    expect(env.corsOrigin).toBe('http://localhost:3000');
    expect(env.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(env.jwtRefreshSecret.length).toBeGreaterThanOrEqual(32);
    expect(env.db.host).toBe('127.0.0.1');
    expect(env.db.port).toBe(3306);
    expect(env.db.user).toBe('root');
    expect(env.db.password).toBe('root');
    expect(env.db.name).toBe('app_test');
    expect(env.isProd).toBe(false);
    expect(env.port).toBeTypeOf('number');
  });

  it('uses test fallbacks when JWT secrets are missing in test', async () => {
    setBaseEnv();
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    const { env } = await import('../../src/config/env');
    expect(env.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(env.jwtRefreshSecret.length).toBeGreaterThanOrEqual(32);
  });

  it('throws when a required var is missing (CORS_ORIGIN)', async () => {
    setBaseEnv();
    delete process.env.CORS_ORIGIN;
    await expect(import('../../src/config/env')).rejects.toThrow(/Missing env: CORS_ORIGIN/);
  });

  // NOTE: DB_HOST/DB_USER/DB_PASSWORD/DB_NAME are present in .env so we can't easily
  // remove them at runtime (dotenv.config will reload them). CORS_ORIGIN is not in .env
  // and exercises the same `must()` branch.

  it('reads DB_SSL flag truthy', async () => {
    setBaseEnv();
    process.env.DB_SSL = 'true';
    const { env } = await import('../../src/config/env');
    expect(env.db.ssl).toBe(true);
  });

  it('marks isProd correctly when NODE_ENV=production with valid secrets', async () => {
    setBaseEnv();
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'abcdefghijabcdefghijabcdefghij123';
    process.env.JWT_REFRESH_SECRET = 'abcdefghijabcdefghijabcdefghij456';
    const { env } = await import('../../src/config/env');
    expect(env.isProd).toBe(true);
    expect(env.nodeEnv).toBe('production');
  });
});
