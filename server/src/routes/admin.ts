import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import { pool } from '../database/db';
import { asyncHandler, ok } from '../lib/http';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole([4]));

adminRouter.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT id, firstname, lastname, email, role_id, created_at FROM users ORDER BY created_at DESC'
    );
    return ok(res, rows as any);
  })
);

adminRouter.get(
  '/reports',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(`SELECT
                reports.id,
                reports.created_at,
                reports.post_id,
                posts.title AS post_title,
                posts.is_banned,
                users.id AS reporter_id,
                users.firstname AS reporter_firstname,
                users.lastname AS reporter_lastname
            FROM reports
            JOIN posts ON reports.post_id = posts.id
            JOIN users ON reports.user_id = users.id
            ORDER BY reports.created_at DESC`);
    return ok(res, rows as any);
  })
);

adminRouter.patch(
  '/posts/:id/ban',
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    await pool.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [postId]);
    return ok(res, { message: 'Publication bannie avec succès.' });
  })
);

adminRouter.patch(
  '/posts/:id/unban',
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    await pool.query('UPDATE posts SET is_banned = 0 WHERE id = ?', [postId]);
    return ok(res, { message: 'Publication débannie avec succès.' });
  })
);
