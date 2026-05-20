export type NotificationType = 'new_comment' | 'reaction' | 'support' | 'moderation' | 'system';
export type NotificationChannel = 'in_app' | 'email';
export type DeliveryStatus = 'sent' | 'skipped' | 'failed';

export type NotificationPreferences = {
  user_id: number;
  in_app_enabled: boolean | number;
  email_enabled: boolean | number;
  browser_push_enabled: boolean | number;
  comments_enabled: boolean | number;
  reactions_enabled: boolean | number;
  support_enabled: boolean | number;
  moderation_enabled: boolean | number;
  system_enabled: boolean | number;
};

export type NotificationRow = {
  id: number;
  user_id: number;
  actor_user_id: number | null;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  channel: NotificationChannel;
  metadata: unknown;
  read_at: string | Date | null;
  created_at: string | Date;
};

export type CreateNotificationInput = {
  userId: number;
  actorUserId?: number | null;
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
  metadata?: Record<string, unknown> | null;
};

export const preferenceFlagByType: Record<NotificationType, keyof NotificationPreferences> = {
  new_comment: 'comments_enabled',
  reaction: 'reactions_enabled',
  support: 'support_enabled',
  moderation: 'moderation_enabled',
  system: 'system_enabled'
};

export const defaultNotificationPreferences = (userId: number): NotificationPreferences => ({
  user_id: userId,
  in_app_enabled: true,
  email_enabled: false,
  browser_push_enabled: false,
  comments_enabled: true,
  reactions_enabled: true,
  support_enabled: true,
  moderation_enabled: true,
  system_enabled: true
});

export const booleanPreference = (value: unknown) => value === true || value === 1;
