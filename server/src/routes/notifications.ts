import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { idSchema, paginationSchema } from '../schemas/common';
import { asyncHandler, HttpError, ok } from '../lib/http';
import {
  getNotificationPreferences,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences
} from '../notifications/notificationRepository';

const preferencesPatchSchema = z.object({
  in_app_enabled: z.boolean().optional(),
  email_enabled: z.boolean().optional(),
  browser_push_enabled: z.boolean().optional(),
  comments_enabled: z.boolean().optional(),
  reactions_enabled: z.boolean().optional(),
  support_enabled: z.boolean().optional(),
  moderation_enabled: z.boolean().optional(),
  system_enabled: z.boolean().optional()
}).strict();

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const pg = paginationSchema.safeParse(req.query);
  if (!pg.success) throw new HttpError(400, 'INVALID_PAGINATION', 'Pagination invalide');
  const rows = await listNotifications(req.user.id, pg.data.page, pg.data.limit);
  return ok(res, rows);
}));

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const count = await getUnreadNotificationCount(req.user.id);
  return ok(res, { count });
}));

notificationsRouter.get('/preferences', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const preferences = await getNotificationPreferences(req.user.id);
  return ok(res, preferences);
}));

notificationsRouter.patch('/preferences', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const payload = preferencesPatchSchema.safeParse(req.body);
  if (!payload.success) throw new HttpError(400, 'INVALID_PAYLOAD', 'Payload invalide');
  const preferences = await updateNotificationPreferences(req.user.id, payload.data);
  return ok(res, preferences);
}));

notificationsRouter.patch('/read-all', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  await markAllNotificationsRead(req.user.id);
  return ok(res, { read: true });
}));

notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Authentification requise.');
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) throw new HttpError(400, 'INVALID_ID', 'Identifiant invalide');
  const updated = await markNotificationRead(req.user.id, id.data);
  if (!updated) throw new HttpError(404, 'NOTIFICATION_NOT_FOUND', 'Notification introuvable');
  return ok(res, { read: true });
}));
