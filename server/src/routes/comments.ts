import { Router } from 'express';
import { pool } from '../database/db';
import { requireAuth } from '../middleware/auth';
import { idSchema, paginationSchema } from '../schemas/common';
import { z } from 'zod';
import { asyncHandler, HttpError, ok } from '../lib/http';
import { analyzeContentForModeration } from '../moderation/moderationEngine';
import { saveModerationReview } from '../moderation/moderationRepository';

const createSchema = z.object({ description: z.string().min(1).max(2000), post_id: z.coerce.number().int().positive() });

export const commentsRouter = Router();

commentsRouter.get('/:postId', asyncHandler(async (req, res) => {
  const id = idSchema.safeParse(req.params.postId);
  const pg = paginationSchema.safeParse(req.query);
  if (!id.success || !pg.success) throw new HttpError(400, 'INVALID_PARAMS', 'Parametres invalides');

  const { page, limit } = pg.data;
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    'SELECT comments.id, comments.description, comments.created_at, comments.user_id, users.firstname, users.lastname FROM comments JOIN users ON comments.user_id=users.id WHERE comments.post_id=? AND comments.is_banned=0 ORDER BY comments.created_at ASC LIMIT ? OFFSET ?',
    [id.data, limit, offset]
  );
  return ok(res, rows);
}));

commentsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  const p = createSchema.safeParse(req.body);
  if (!p.success || !req.user) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');

  const analysis = analyzeContentForModeration({
    content: p.data.description,
    targetType: 'comment',
    authorId: req.user.id
  });

  if (analysis.status !== 'allowed') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.query('INSERT INTO comments (description, user_id, post_id, is_banned) VALUES (?, ?, ?, ?)', [
        p.data.description,
        req.user.id,
        p.data.post_id,
        analysis.shouldShadowBan ? 1 : 0
      ]);
      await saveModerationReview(conn, { targetId: (r as any).insertId, analysis });
      await conn.commit();
      return ok(res, { message: 'Commentaire ajoute' }, 201);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  await pool.query('INSERT INTO comments (description, user_id, post_id) VALUES (?, ?, ?)', [p.data.description, req.user.id, p.data.post_id]);
  return ok(res, { message: 'Commentaire ajoute' }, 201);
}));

