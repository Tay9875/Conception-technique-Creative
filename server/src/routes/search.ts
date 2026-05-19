import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, HttpError, ok } from '../lib/http';
import { normalizeSearchText, searchGlobal } from '../services/search';

const searchQuerySchema = z.object({
  q: z.string().transform((value) => value.trim()).pipe(z.string().min(2).max(80)),
  limit: z.coerce.number().int().min(1).max(20).default(10)
});

export const searchRouter = Router();

searchRouter.get('/', asyncHandler(async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new HttpError(400, 'INVALID_SEARCH_QUERY', 'La recherche doit contenir entre 2 et 80 caracteres.');
  }

  const query = normalizeSearchText(parsed.data.q);
  const results = await searchGlobal(query, parsed.data.limit);
  return ok(res, { query: parsed.data.q, results });
}));
