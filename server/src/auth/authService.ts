import { pool } from '../database/db';
import { signAccessToken, signRefreshToken } from '../middleware/auth';
import { HttpError } from '../lib/http';
import type { GoogleProfile } from './googleOAuth';

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<unknown>;
};

export const PROFILE_STATUS_VALUES = ['patient', 'former_patient', 'caregiver', 'prefer_not_to_say'] as const;
export type ProfileStatus = (typeof PROFILE_STATUS_VALUES)[number];
export type AuthProvider = 'password' | 'google';

export type PublicUser = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role_id: number;
  avatar_url?: string | null;
  email_verified?: boolean | number;
  authProviders: AuthProvider[];
  hasPassword: boolean;
  canChangePassword: boolean;
  profileStatus: ProfileStatus;
};

export const roleIdToProfileStatus = (roleId: unknown): ProfileStatus => {
  if (Number(roleId) === 1) return 'patient';
  if (Number(roleId) === 2) return 'former_patient';
  if (Number(roleId) === 3) return 'caregiver';
  return 'prefer_not_to_say';
};

export const normalizeProfileStatus = (status: unknown, roleId?: unknown): ProfileStatus => {
  if (typeof status === 'string' && (PROFILE_STATUS_VALUES as readonly string[]).includes(status)) {
    return status as ProfileStatus;
  }
  return roleIdToProfileStatus(roleId);
};

const parseProviders = (user: any, hasPassword: boolean): AuthProvider[] => {
  if (Array.isArray(user.authProviders)) {
    return user.authProviders.filter((provider: unknown): provider is AuthProvider =>
      provider === 'password' || provider === 'google'
    );
  }

  const providers: AuthProvider[] = [];
  if (hasPassword) providers.push('password');
  if (Boolean(user.has_google) || Boolean(user.hasGoogle)) providers.push('google');
  return providers;
};

export const toPublicUser = (user: any): PublicUser => ({
  id: Number(user.id),
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  role_id: Number(user.role_id),
  avatar_url: user.avatar_url ?? null,
  email_verified: Boolean(user.email_verified),
  authProviders: parseProviders(
    user,
    user.hasPassword !== undefined ? Boolean(user.hasPassword) : Boolean(user.has_password) || Boolean(user.password)
  ),
  hasPassword: user.hasPassword !== undefined ? Boolean(user.hasPassword) : Boolean(user.has_password) || Boolean(user.password),
  canChangePassword: user.canChangePassword !== undefined
    ? Boolean(user.canChangePassword)
    : Boolean(user.hasPassword !== undefined ? user.hasPassword : user.has_password || user.password),
  profileStatus: normalizeProfileStatus(user.profileStatus ?? user.profile_status, user.role_id)
});

export const getPublicUserById = async (db: Queryable, id: number): Promise<PublicUser | null> => {
  const [rows] = await db.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role_id, u.avatar_url, u.email_verified, u.profile_status,
            EXISTS(SELECT 1 FROM oauth_accounts oa WHERE oa.user_id = u.id AND oa.provider = 'google') AS has_google
     FROM users u
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  ) as any;

  const user = (rows as any[])[0];
  return user ? toPublicUser(user) : null;
};

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
  if (!profile.emailVerified) {
    throw new HttpError(
      403,
      'GOOGLE_EMAIL_UNVERIFIED',
      'Google doit confirmer votre adresse email avant de lier ce compte.'
    );
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [linkedRows] = await conn.query(
      `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role_id, u.avatar_url, u.email_verified, u.profile_status,
              1 AS has_google
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
         SET avatar_url = COALESCE(avatar_url, ?), email_verified = 1
         WHERE id = ?`,
        [profile.avatarUrl, linkedUser.id]
      );
      const refreshedUser = await getPublicUserById(conn, linkedUser.id);
      await conn.commit();
      return refreshedUser ?? toPublicUser({ ...linkedUser, email_verified: true, has_google: 1 });
    }

    const [insertResult] = await conn.query(
      `INSERT INTO users (firstname, lastname, email, password, role_id, avatar_url, email_verified, profile_status)
       VALUES (?, ?, ?, NULL, 1, ?, 1, 'prefer_not_to_say')
       ON DUPLICATE KEY UPDATE
         id = LAST_INSERT_ID(id),
         avatar_url = COALESCE(avatar_url, VALUES(avatar_url)),
         email_verified = 1`,
      [profile.firstname, profile.lastname, profile.email, profile.avatarUrl]
    );
    const userId = Number((insertResult as any).insertId);

    await conn.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_account_id, email)
       VALUES (?, 'google', ?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email), updated_at = CURRENT_TIMESTAMP`,
      [userId, profile.providerAccountId, profile.email]
    );

    const [finalRows] = await conn.query(
      `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role_id, u.avatar_url, u.email_verified, u.profile_status,
              1 AS has_google
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = 'google' AND oa.provider_account_id = ?
       LIMIT 1`,
      [profile.providerAccountId]
    );
    const user = (finalRows as any[])[0];
    if (!user) throw new HttpError(500, 'GOOGLE_LINK_FAILED', 'Association Google impossible.');

    await conn.commit();
    return toPublicUser(user);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};
