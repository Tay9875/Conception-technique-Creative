import { pool } from '../database/db';
import {
  CreateNotificationInput,
  defaultNotificationPreferences,
  NotificationChannel,
  NotificationPreferences
} from './notificationTypes';

type Queryable = {
  query: (sql: string, values?: unknown[]) => Promise<any>;
};

const preferenceColumns = [
  'in_app_enabled',
  'email_enabled',
  'browser_push_enabled',
  'comments_enabled',
  'reactions_enabled',
  'support_enabled',
  'moderation_enabled',
  'system_enabled'
] as const;

export type NotificationPreferencePatch = Partial<Record<(typeof preferenceColumns)[number], boolean>>;

const normalizePreferenceRow = (userId: number, row?: any): NotificationPreferences => {
  if (!row) return defaultNotificationPreferences(userId);
  return {
    user_id: userId,
    in_app_enabled: Boolean(row.in_app_enabled),
    email_enabled: Boolean(row.email_enabled),
    browser_push_enabled: Boolean(row.browser_push_enabled),
    comments_enabled: Boolean(row.comments_enabled),
    reactions_enabled: Boolean(row.reactions_enabled),
    support_enabled: Boolean(row.support_enabled),
    moderation_enabled: Boolean(row.moderation_enabled),
    system_enabled: Boolean(row.system_enabled)
  };
};

export const ensureNotificationPreferences = async (userId: number) => {
  await pool.query(
    `INSERT IGNORE INTO notification_preferences
      (user_id, in_app_enabled, email_enabled, browser_push_enabled, comments_enabled, reactions_enabled, support_enabled, moderation_enabled, system_enabled)
     VALUES (?, 1, 0, 0, 1, 1, 1, 1, 1)`,
    [userId]
  );
};

export const getNotificationPreferences = async (userId: number) => {
  await ensureNotificationPreferences(userId);
  const [rows] = await pool.query('SELECT * FROM notification_preferences WHERE user_id = ? LIMIT 1', [userId]);
  return normalizePreferenceRow(userId, (rows as any[])[0]);
};

export const updateNotificationPreferences = async (userId: number, patch: NotificationPreferencePatch) => {
  await ensureNotificationPreferences(userId);
  const entries = Object.entries(patch).filter(([key]) => preferenceColumns.includes(key as any));
  if (entries.length) {
    const assignments = entries.map(([key]) => `${key} = ?`).join(', ');
    await pool.query(
      `UPDATE notification_preferences SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [...entries.map(([, value]) => (value ? 1 : 0)), userId]
    );
  }
  return getNotificationPreferences(userId);
};

export const listNotifications = async (userId: number, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT id, user_id, actor_user_id, type, title, body, href, channel, metadata, read_at, created_at
     FROM notifications
     WHERE user_id = ? AND channel = 'in_app'
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows as any[];
};

export const getUnreadNotificationCount = async (userId: number) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as count
     FROM notifications
     WHERE user_id = ? AND channel = 'in_app' AND read_at IS NULL`,
    [userId]
  );
  return Number((rows as any[])[0]?.count || 0);
};

export const markNotificationRead = async (userId: number, notificationId: number) => {
  const [result] = await pool.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
     WHERE id = ? AND user_id = ? AND channel = 'in_app'`,
    [notificationId, userId]
  );
  return Number((result as any).affectedRows || 0) > 0;
};

export const markAllNotificationsRead = async (userId: number) => {
  await pool.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
     WHERE user_id = ? AND channel = 'in_app' AND read_at IS NULL`,
    [userId]
  );
};

export const createNotificationRecord = async (
  db: Queryable,
  input: CreateNotificationInput & { channel: NotificationChannel; readAt?: Date | null }
) => {
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, actor_user_id, type, title, body, href, channel, metadata, read_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.userId,
      input.actorUserId || null,
      input.type,
      input.title.slice(0, 120),
      input.body.slice(0, 500),
      input.href || null,
      input.channel,
      input.metadata ? JSON.stringify(input.metadata) : null,
      input.readAt || null
    ]
  );
  return Number((result as any).insertId);
};

export const logNotificationDelivery = async (
  notificationId: number,
  channel: 'email',
  status: 'sent' | 'skipped' | 'failed',
  error?: string | null
) => {
  await pool.query(
    `INSERT INTO notification_deliveries (notification_id, channel, status, error, sent_at)
     VALUES (?, ?, ?, ?, ?)`,
    [notificationId, channel, status, error ? error.slice(0, 500) : null, status === 'sent' ? new Date() : null]
  );
};

export const getUserEmailForNotification = async (userId: number) => {
  const [rows] = await pool.query('SELECT email, firstname FROM users WHERE id = ? LIMIT 1', [userId]);
  return (rows as any[])[0] as { email: string; firstname: string } | undefined;
};
