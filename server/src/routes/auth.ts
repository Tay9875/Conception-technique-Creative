import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database/db';
import { loginSchema, refreshSchema, registerSchema } from '../schemas/auth';
import { signAccessToken, signRefreshToken } from '../middleware/auth';
import { env } from '../config/env';
import { buildRateLimit } from '../middleware/security';
import { zodToFieldErrors } from '../lib/validation';
import { asyncHandler, HttpError, ok } from '../lib/http';

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

  const [rows] = await pool.query('SELECT id, firstname, lastname, email, password, role_id FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
  const user = (rows as any[])[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email ou mot de passe incorrect.');
  }

  const token = signAccessToken({ id: user.id, email: user.email, role: user.role_id });
  const refreshToken = signRefreshToken({ id: user.id });
  await pool.query('INSERT INTO refresh_tokens (user_id, token, expires_at, revoked_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), NULL)', [user.id, refreshToken]);

  return ok(res, { token, refreshToken, user: { id: user.id, firstname: user.firstname, lastname: user.lastname, role_id: user.role_id } });
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
