export type NotificationType = 'new_comment' | 'reaction' | 'support' | 'moderation' | 'system';

export interface NotificationItem {
  id: number;
  user_id: number;
  actor_user_id: number | null;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  channel: 'in_app' | 'email';
  metadata: unknown;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: number;
  in_app_enabled: boolean;
  email_enabled: boolean;
  browser_push_enabled: boolean;
  comments_enabled: boolean;
  reactions_enabled: boolean;
  support_enabled: boolean;
  moderation_enabled: boolean;
  system_enabled: boolean;
}

export type NotificationPreferencePatch = Partial<
  Pick<
    NotificationPreferences,
    | 'in_app_enabled'
    | 'email_enabled'
    | 'browser_push_enabled'
    | 'comments_enabled'
    | 'reactions_enabled'
    | 'support_enabled'
    | 'moderation_enabled'
    | 'system_enabled'
  >
>;
