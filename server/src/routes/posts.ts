import { Router } from 'express';
import { pool } from '../database/db';
import { requireAuth } from '../middleware/auth';
import { idSchema, paginationSchema } from '../schemas/common';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache';
import { asyncHandler, HttpError, ok } from '../lib/http';
import { analyzeContentForModeration } from '../moderation/moderationEngine';
import { saveModerationReview } from '../moderation/moderationRepository';
import { createModerationReviewNotification, createReactionNotification } from '../notifications/notificationService';

const createSchema = z.object({ title: z.string().min(1).max(255), description: z.string().min(1).max(5000), tag_id: z.coerce.number().int().positive() });
const reportSchema = z.object({ reason: z.string().max(255).optional() });

export const postsRouter = Router();

postsRouter.get('/', asyncHandler(async (req, res) => {
  const pg = paginationSchema.safeParse(req.query);
  if (!pg.success) throw new HttpError(400, 'INVALID_PAGINATION', 'Pagination invalide');

  const uid = Number(req.query.user_id || 0);
  const { page, limit } = pg.data;
  const offset = (page - 1) * limit;

  const cacheKey = `posts:${uid}:${page}:${limit}`;
  const cached = await getCache<any>(cacheKey);
  if (cached) return ok(res.setHeader('X-Cache', 'HIT'), cached);

  const [rows] = await pool.query(
    `SELECT posts.id,posts.title,posts.description,posts.created_at,posts.user_id,posts.tag_id,users.firstname,users.lastname,users.profile_status,tags.title AS tag_title,COUNT(DISTINCT likes.id) AS like_count,MAX(CASE WHEN likes.user_id = ? THEN 1 ELSE 0 END) AS is_liked FROM posts JOIN users ON posts.user_id=users.id LEFT JOIN tags ON posts.tag_id=tags.id LEFT JOIN likes ON likes.post_id=posts.id WHERE posts.is_banned=0 GROUP BY posts.id,users.firstname,users.lastname,users.profile_status,tags.title ORDER BY posts.created_at DESC LIMIT ? OFFSET ?`,
    [uid, limit, offset]
  );

  await setCache(cacheKey, rows, 30);
  return ok(res.setHeader('X-Cache', 'MISS'), rows);
}));

postsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  const p = createSchema.safeParse(req.body);
  if (!p.success || !req.user) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');

  const analysis = analyzeContentForModeration({
    content: `${p.data.title}\n${p.data.description}`,
    targetType: 'post',
    authorId: req.user.id
  });

  if (analysis.status !== 'allowed') {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [r] = await conn.query('INSERT INTO posts (title, description, user_id, tag_id, is_banned) VALUES (?, ?, ?, ?, ?)', [
        p.data.title,
        p.data.description,
        req.user.id,
        p.data.tag_id,
        analysis.shouldShadowBan ? 1 : 0
      ]);
      const id = (r as any).insertId;
      await saveModerationReview(conn, { targetId: id, analysis });
      await conn.commit();
      if (analysis.status === 'needs_review') {
        await createModerationReviewNotification({ authorId: req.user.id, targetType: 'post', targetId: id });
      }
      return ok(res, { id }, 201);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  const [r] = await pool.query('INSERT INTO posts (title, description, user_id, tag_id) VALUES (?, ?, ?, ?)', [
    p.data.title,
    p.data.description,
    req.user.id,
    p.data.tag_id
  ]);

  return ok(res, { id: (r as any).insertId }, 201);
}));

postsRouter.post('/:id/like', requireAuth, asyncHandler(async (req, res) => {
  const p = idSchema.safeParse(req.params.id);
  if (!p.success || !req.user) throw new HttpError(400, 'INVALID_ID', 'Identifiant invalide');

  const [e] = await pool.query('SELECT id FROM likes WHERE user_id=? AND post_id=? LIMIT 1', [req.user.id, p.data]);
  if ((e as any[]).length) {
    await pool.query('DELETE FROM likes WHERE user_id=? AND post_id=?', [req.user.id, p.data]);
    return ok(res, { liked: false });
  }

  await pool.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, p.data]);
  const [postRows] = await pool.query('SELECT user_id FROM posts WHERE id = ? LIMIT 1', [p.data]);
  const post = (postRows as any[])[0];
  if (post) {
    await createReactionNotification({ postAuthorId: post.user_id, actorUserId: req.user.id, postId: p.data });
  }
  return ok(res, { liked: true });
}));

postsRouter.post('/:id/report', requireAuth, asyncHandler(async (req, res) => {
  const p = idSchema.safeParse(req.params.id);
  const body = reportSchema.safeParse(req.body);
  if (!p.success || !body.success || !req.user) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('INSERT INTO reports (user_id, post_id) VALUES (?, ?)', [req.user.id, p.data]);
    const [countRows] = await conn.query('SELECT COUNT(*) as count FROM reports WHERE post_id = ?', [p.data]);
    const count = Number((countRows as any[])[0]?.count || 0);

    if (count >= 3) {
      await conn.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [p.data]);
      await conn.commit();
      return ok(res, { banned: true, message: 'Post masqué automatiquement.' });
    }

    await conn.commit();
    return ok(res, { banned: false, message: 'Signalement enregistré.' });
  } catch (error: any) {
    await conn.rollback();
    if (error?.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'ALREADY_REPORTED', 'Vous avez déjà signalé ce post.');
    throw error;
  } finally {
    conn.release();
  }
}));
