import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db';
import { loginSchema, refreshSchema, registerSchema } from '../schemas/auth';
import { requireAuth, signAccessToken, signRefreshToken } from '../middleware/auth';
import { env } from '../config/env';
import { buildRateLimit } from '../middleware/security';
import { zodToFieldErrors } from '../lib/validation';
import { asyncHandler, HttpError, ok } from '../lib/http';
import { createOAuthState, sanitizeReturnTo, verifyOAuthState } from '../auth/oauthState';
import { buildGoogleAuthorizationUrl, fetchGoogleProfile } from '../auth/googleOAuth';
import { findOrCreateGoogleUser, getPublicUserById, issueAppTokens, toPublicUser } from '../auth/authService';

export const authRouter = Router();
authRouter.use(buildRateLimit(15 * 60 * 1000, 40, 'auth'));

authRouter.post('/register', asyncHandler(async (req, res) => {
  const p = registerSchema.safeParse(req.body);
  if (!p.success) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide', zodToFieldErrors(p.error));
  const { firstname, lastname, email, password } = p.data;

  const [u] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
  if ((u as any[]).length) throw new HttpError(409, 'EMAIL_TAKEN', 'Cet email est déjà utilisé.');

  const hash = await bcrypt.hash(password, 12);
  await pool.query('INSERT INTO users (firstname, lastname, email, password, role_id) VALUES (?, ?, ?, ?, 1)', [firstname, lastname, email.toLowerCase(), hash]);
  return ok(res, { message: 'Inscription réussie !' }, 201);
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const p = loginSchema.safeParse(req.body);
  if (!p.success) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide', zodToFieldErrors(p.error));
  const { email, password } = p.data;

  const [rows] = await pool.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role_id, u.avatar_url, u.email_verified, u.profile_status,
            EXISTS(SELECT 1 FROM oauth_accounts oa WHERE oa.user_id = u.id AND oa.provider = 'google') AS has_google
     FROM users u
     WHERE u.email = ?
     LIMIT 1`,
    [email.toLowerCase()]
  );
  const user = (rows as any[])[0];
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
  }

  const publicUser = toPublicUser(user);
  const { token, refreshToken } = await issueAppTokens(pool, publicUser);

  return ok(res, { token, refreshToken, user: publicUser });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const user = await getPublicUserById(pool, req.user.id);
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouve.');
  return ok(res, user);
}));

authRouter.get('/google', asyncHandler(async (req, res) => {
  const state = createOAuthState(req.query.returnTo);
  return res.redirect(302, buildGoogleAuthorizationUrl(state));
}));

authRouter.get('/google/callback', asyncHandler(async (req, res) => {
  const redirectToLogin = (status: 'success' | 'error', params: Record<string, string> = {}) => {
    const url = new URL('/login', env.clientUrl);
    if (status === 'error') {
      url.searchParams.set('oauth', 'error');
      url.searchParams.set('reason', params.reason || 'google');
      return res.redirect(302, url.toString());
    }

    const hash = new URLSearchParams({ oauth: 'success', ...params });
    url.hash = hash.toString();
    return res.redirect(302, url.toString());
  };

  if (req.query.error) return redirectToLogin('error', { reason: 'denied' });

  const state = verifyOAuthState(req.query.state);
  if (!state || typeof req.query.code !== 'string') {
    return redirectToLogin('error', { reason: 'state' });
  }

  let user;
  try {
    const profile = await fetchGoogleProfile(req.query.code);
    user = await findOrCreateGoogleUser(profile);
  } catch (error) {
    if (error instanceof HttpError) {
      const reason = ['GOOGLE_PROFILE_UNVERIFIED', 'GOOGLE_EMAIL_UNVERIFIED'].includes(error.code)
        ? 'unverified'
        : 'provider';
      return redirectToLogin('error', { reason });
    }
    throw error;
  }

  const { token, refreshToken } = await issueAppTokens(pool, user);

  return redirectToLogin('success', {
    token,
    refreshToken,
    user: Buffer.from(JSON.stringify(user), 'utf8').toString('base64url'),
    returnTo: sanitizeReturnTo(state.returnTo)
  });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const p = refreshSchema.safeParse(req.body);
  if (!p.success) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide', zodToFieldErrors(p.error));

  let decoded: { id: number };
  try {
    decoded = jwt.verify(p.data.refreshToken, env.jwtRefreshSecret) as { id: number };
  } catch {
    throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token invalide.');
  }

  const [rows] = await pool.query('SELECT id FROM refresh_tokens WHERE token = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1', [p.data.refreshToken, decoded.id]);
  if (!(rows as any[]).length) throw new HttpError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token invalide.');

  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?', [p.data.refreshToken]);
  const newRefreshToken = signRefreshToken({ id: decoded.id });
  await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at, revoked_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL)', [decoded.id, newRefreshToken]);

  const [u] = await pool.query('SELECT id, email, role_id FROM users WHERE id = ? LIMIT 1', [decoded.id]);
  const usr = (u as any[])[0];
  if (!usr) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé.');

  const token = signAccessToken({ id: usr.id, email: usr.email, role: usr.role_id });
  return ok(res, { token, refreshToken: newRefreshToken });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const p = refreshSchema.safeParse(req.body);
  if (p.success) {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ?', [p.data.refreshToken]);
  }
  return res.status(204).send();
}));
