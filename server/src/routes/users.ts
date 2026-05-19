import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { pool } from '../database/db';
import { toPublicUser } from '../auth/authService';
import { asyncHandler, HttpError, ok } from '../lib/http';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const [rows] = await pool.query(
    'SELECT id, firstname, lastname, email, role_id, avatar_url, email_verified FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );
  const user = (rows as any[])[0];
  if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouve.');
  return ok(res, toPublicUser(user));
}));
