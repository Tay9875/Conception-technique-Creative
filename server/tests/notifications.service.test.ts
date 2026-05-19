import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = '12345678901234567890123456789012';
process.env.JWT_REFRESH_SECRET = '12345678901234567890123456789012';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'app_test';

vi.mock('../src/database/db', () => ({
  pool: { query: vi.fn() },
  dbHealth: vi.fn().mockResolvedValue(true)
}));

vi.mock('../src/notifications/emailService', () => ({
  sendNotificationEmail: vi.fn(async () => ({ status: 'sent', provider: 'console' }))
}));

const preferenceRow = (overrides: Record<string, number> = {}) => ({
  in_app_enabled: 1,
  email_enabled: 0,
  browser_push_enabled: 0,
  comments_enabled: 1,
  reactions_enabled: 1,
  support_enabled: 1,
  moderation_enabled: 1,
  system_enabled: 1,
  ...overrides
});

describe('notification service', () => {
  let query: Mock;
  let sendNotificationEmail: Mock;

  beforeEach(async () => {
    query = (await import('../src/database/db')).pool.query as Mock;
    sendNotificationEmail = (await import('../src/notifications/emailService')).sendNotificationEmail as Mock;
    query.mockReset();
    sendNotificationEmail.mockClear();
  });

  it('does not notify users about their own actions', async () => {
    const { createCommentNotification } = await import('../src/notifications/notificationService');

    const result = await createCommentNotification({ postAuthorId: 5, actorUserId: 5, postId: 10 });

    expect(result.skippedReason).toBe('self');
    expect(query).not.toHaveBeenCalled();
    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('creates an in-app notification and skips email when email is disabled', async () => {
    const { createCommentNotification } = await import('../src/notifications/notificationService');
    query
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[preferenceRow()]])
      .mockResolvedValueOnce([{ insertId: 42 }]);

    const result = await createCommentNotification({ postAuthorId: 8, actorUserId: 5, postId: 10 });

    expect(result.inAppNotificationId).toBe(42);
    expect(result.emailNotificationId).toBeNull();
    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('sends email only when the email channel is enabled', async () => {
    const { createReactionNotification } = await import('../src/notifications/notificationService');
    query
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[preferenceRow({ in_app_enabled: 0, email_enabled: 1 })]])
      .mockResolvedValueOnce([[{ email: 'alice@example.com', firstname: 'Alice' }]])
      .mockResolvedValueOnce([{ insertId: 55 }])
      .mockResolvedValueOnce([{}]);

    const result = await createReactionNotification({ postAuthorId: 8, actorUserId: 5, postId: 10 });

    expect(result.inAppNotificationId).toBeNull();
    expect(result.emailNotificationId).toBe(55);
    expect(sendNotificationEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'alice@example.com' }));
  });

  it('respects per-type preferences', async () => {
    const { createCommentNotification } = await import('../src/notifications/notificationService');
    query
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[preferenceRow({ comments_enabled: 0 })]]);

    const result = await createCommentNotification({ postAuthorId: 8, actorUserId: 5, postId: 10 });

    expect(result.skippedReason).toBe('type_disabled');
    expect(sendNotificationEmail).not.toHaveBeenCalled();
  });
});
