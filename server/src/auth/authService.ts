import { pool } from '../database/db';
import { signAccessToken, signRefreshToken } from '../middleware/auth';
import type { GoogleProfile } from './googleOAuth';

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<unknown>;
};

export type PublicUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number;
  avatar_url?: string | null;
  email_verified?: boolean | number;
};

export const toPublicUser = (user: any): PublicUser => ({
  id: user.id,
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  role_id: user.role_id,
  avatar_url: user.avatar_url ?? null,
  email_verified: Boolean(user.email_verified)
});

export const issueAppTokens = async (db: Queryable, user: PublicUser) => {
  const token = signAccessToken({ id: user.id, email: user.email, role: user.role_id });
  const refreshToken = signRefreshToken({ id: user.id });
  await db.query('INSERT INTO refresh_tokens (user_id, token, expires_at, revoked_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL)', [
    user.id,
    refreshToken
  ]);
  return { token, refreshToken };
};

export const findOrCreateGoogleUser = async (profile: GoogleProfile): Promise<PublicUser> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [linkedRows] = await conn.query(
      `SELECT u.id, u.firstname, u.lastname, u.email, u.role_id, u.avatar_url, u.email_verified
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = 'google' AND oa.provider_account_id = ?
       LIMIT 1`,
      [profile.providerAccountId]
    );

    const linkedUser = (linkedRows as any[])[0];
    if (linkedUser) {
      await conn.query(
        `UPDATE oauth_accounts
         SET email = ?, updated_at = CURRENT_TIMESTAMP
         WHERE provider = 'google' AND provider_account_id = ?`,
        [profile.email, profile.providerAccountId]
      );
      await conn.query(
        `UPDATE users
         SET avatar_url = COALESCE(?, avatar_url), email_verified = 1
         WHERE id = ?`,
        [profile.avatarUrl, linkedUser.id]
      );
      await conn.commit();
      return toPublicUser({ ...linkedUser, avatar_url: profile.avatarUrl ?? linkedUser.avatar_url, email_verified: true });
    }

    const [existingRows] = await conn.query(
      'SELECT id, firstname, lastname, email, role_id, avatar_url, email_verified FROM users WHERE email = ? LIMIT 1',
      [profile.email]
    );
    let user = (existingRows as any[])[0];

    if (!user) {
      const [insertResult] = await conn.query(
        `INSERT INTO users (firstname, lastname, email, password, role_id, avatar_url, email_verified)
         VALUES (?, ?, ?, NULL, 1, ?, 1)`,
        [profile.firstname, profile.lastname, profile.email, profile.avatarUrl]
      );
      const userId = (insertResult as any).insertId;
      user = {
        id: userId,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        role_id: 1,
        avatar_url: profile.avatarUrl,
        email_verified: true
      };
    } else {
      await conn.query('UPDATE users SET avatar_url = COALESCE(?, avatar_url), email_verified = 1 WHERE id = ?', [
        profile.avatarUrl,
        user.id
      ]);
      user = { ...user, avatar_url: profile.avatarUrl ?? user.avatar_url, email_verified: true };
    }

    await conn.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id, email)
       VALUES (?, 'google', ?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), email = VALUES(email), updated_at = CURRENT_TIMESTAMP`,
      [user.id, profile.providerAccountId, profile.email]
    );

    await conn.commit();
    return toPublicUser(user);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
