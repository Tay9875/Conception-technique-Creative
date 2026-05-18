import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { idSchema } from '../schemas/common';
import { pool } from '../database/db';
import { z } from 'zod';
import { asyncHandler, HttpError, ok } from '../lib/http';

const reasonSchema = z.object({ reason: z.string().max(255).optional() });
const listSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });

export const moderationRouter = Router();
moderationRouter.use(requireAuth, requireRole([2, 3]));

moderationRouter.post('/posts/:id/ban', asyncHandler(async (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  const body = reasonSchema.safeParse(req.body);
  if (!id.success || !body.success || !req.user) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [id.data]);
    await conn.query('INSERT INTO moderation_logs (moderator_id, post_id, action, reason) VALUES (?, ?, ?, ?)', [req.user.id, id.data, 'ban', body.data.reason || null]);
    await conn.commit();
    return res.status(204).send();
  } catch {
    await conn.rollback();
    throw new HttpError(500, 'MODERATION_BAN_FAILED', 'Erreur lors du bannissement');
  } finally {
    conn.release();
  }
}));

moderationRouter.post('/posts/:id/unban', asyncHandler(async (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  const body = reasonSchema.safeParse(req.body);
  if (!id.success || !body.success || !req.user) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('UPDATE posts SET is_banned = 0 WHERE id = ?', [id.data]);
    await conn.query('INSERT INTO moderation_logs (moderator_id, post_id, action, reason) VALUES (?, ?, ?, ?)', [req.user.id, id.data, 'unban', body.data.reason || null]);
    await conn.commit();
    return res.status(204).send();
  } catch {
    await conn.rollback();
    throw new HttpError(500, 'MODERATION_UNBAN_FAILED', 'Erreur lors du débannissement');
  } finally {
    conn.release();
  }
}));

moderationRouter.get('/logs', asyncHandler(async (req, res) => {
  const q = listSchema.safeParse(req.query);
  if (!q.success) throw new HttpError(400, 'INVALID_PAGINATION', 'Pagination invalide');

  const { page, limit } = q.data;
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT ml.id, ml.moderator_id, ml.post_id, ml.action, ml.reason, ml.created_at, u.firstname, u.lastname
     FROM moderation_logs ml
     JOIN users u ON u.id = ml.moderator_id
     ORDER BY ml.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return ok(res, rows);
}));
