import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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

const conn = {
  beginTransaction: vi.fn(async () => {}),
  query: vi.fn(),
  commit: vi.fn(async () => {}),
  rollback: vi.fn(async () => {}),
  release: vi.fn(() => {})
};

vi.mock('../src/database/db', () => ({
  pool: {
    query: vi.fn(),
    getConnection: vi.fn(async () => conn)
  },
  dbHealth: vi.fn().mockResolvedValue(true)
}));

const googleProfile = {
  providerAccountId: 'google-123',
  email: 'alice@example.com',
  emailVerified: true,
  firstname: 'Alice',
  lastname: 'Google',
  avatarUrl: 'https://cdn.example/avatar.png'
};

let findOrCreateGoogleUser: typeof import('../src/auth/authService').findOrCreateGoogleUser;
let pool: typeof import('../src/database/db').pool;

beforeAll(async () => {
  ({ findOrCreateGoogleUser } = await import('../src/auth/authService'));
  ({ pool } = await import('../src/database/db'));
});

beforeEach(() => {
  conn.query.mockReset();
  conn.beginTransaction.mockClear();
  conn.commit.mockClear();
  conn.rollback.mockClear();
  conn.release.mockClear();
  (pool.getConnection as unknown as Mock).mockClear();
});

describe('findOrCreateGoogleUser', () => {
  it('creates a Google-only user and oauth account for a new verified email', async () => {
    conn.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 10 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          id: 10,
          firstname: 'Alice',
          lastname: 'Google',
          email: 'alice@example.com',
          password: null,
          role_id: 1,
          avatar_url: 'https://cdn.example/avatar.png',
          email_verified: 1,
          profile_status: 'prefer_not_to_say',
          has_google: 1
        }
      ]]);

    const user = await findOrCreateGoogleUser(googleProfile);

    expect(user).toMatchObject({
      id: 10,
      email: 'alice@example.com',
      authProviders: ['google'],
      hasPassword: false,
      canChangePassword: false,
      profileStatus: 'prefer_not_to_say',
      email_verified: true
    });
    expect(conn.query.mock.calls[1][0]).toContain('password, role_id, avatar_url, email_verified, profile_status');
    expect(conn.query.mock.calls[2][0]).toContain('oauth_accounts');
    expect(JSON.stringify(conn.query.mock.calls)).not.toContain('access_token');
    expect(conn.commit).toHaveBeenCalledTimes(1);
  });

  it('links Google to an existing password account without overwriting local profile fields', async () => {
    conn.query
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 4 }])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          id: 4,
          firstname: 'Local',
          lastname: 'Account',
          email: 'alice@example.com',
          password: 'hashed-password',
          role_id: 1,
          avatar_url: 'https://cdn.example/local.png',
          email_verified: 1,
          profile_status: 'caregiver',
          has_google: 1
        }
      ]]);

    const user = await findOrCreateGoogleUser(googleProfile);
    const upsertSql = conn.query.mock.calls[1][0] as string;

    expect(user.firstname).toBe('Local');
    expect(user.lastname).toBe('Account');
    expect(user.hasPassword).toBe(true);
    expect(user.authProviders).toEqual(['password', 'google']);
    expect(user.profileStatus).toBe('caregiver');
    expect(upsertSql).not.toContain('firstname = VALUES(firstname)');
    expect(upsertSql).not.toContain('lastname = VALUES(lastname)');
    expect(upsertSql).not.toContain('password = VALUES(password)');
  });

  it('returns the already linked user when provider/account id exists', async () => {
    conn.query
      .mockResolvedValueOnce([[
        {
          id: 7,
          firstname: 'Linked',
          lastname: 'User',
          email: 'linked@example.com',
          password: null,
          role_id: 1,
          avatar_url: null,
          email_verified: 1,
          profile_status: 'patient',
          has_google: 1
        }
      ]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          id: 7,
          firstname: 'Linked',
          lastname: 'User',
          email: 'linked@example.com',
          password: null,
          role_id: 1,
          avatar_url: 'https://cdn.example/avatar.png',
          email_verified: 1,
          profile_status: 'patient',
          has_google: 1
        }
      ]]);

    const user = await findOrCreateGoogleUser(googleProfile);

    expect(user.id).toBe(7);
    expect(user.authProviders).toEqual(['google']);
    expect(conn.query.mock.calls[0][0]).toContain('provider_account_id');
    expect(conn.query.mock.calls[2][0]).toContain('COALESCE(avatar_url, ?)');
    expect(conn.commit).toHaveBeenCalledTimes(1);
  });

  it('does not auto-link when the Google email is not verified', async () => {
    await expect(findOrCreateGoogleUser({ ...googleProfile, emailVerified: false })).rejects.toMatchObject({
      code: 'GOOGLE_EMAIL_UNVERIFIED'
    });

    expect(pool.getConnection).not.toHaveBeenCalled();
  });
});
