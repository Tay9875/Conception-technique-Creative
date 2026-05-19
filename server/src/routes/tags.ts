import { Router } from 'express';
import { pool } from '../database/db';
import { getCache, setCache } from '../lib/cache';
import { asyncHandler, ok } from '../lib/http';

export const tagsRouter = Router();

tagsRouter.get('/', asyncHandler(async (_req, res) => {
  const key = 'tags:all';
  const cached = await getCache<any[]>(key);
  if (cached) return ok(res.setHeader('X-Cache', 'HIT'), cached);

  const [rows] = await pool.query('SELECT id, title FROM tags ORDER BY title ASC');
  await setCache(key, rows, 300);
  return ok(res.setHeader('X-Cache', 'MISS'), rows);
}));
