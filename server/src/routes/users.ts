import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { pool } from '../database/db';
import { asyncHandler, HttpError, ok } from '../lib/http';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const [rows] = await pool.query('SELECT id, firstname, lastname, email, role_id FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  const u = (rows as any[])[0];
  if (!u) throw new HttpError(404, 'USER_NOT_FOUND', 'Utilisateur non trouvé');
  return ok(res, u);
}));
