import { pool } from '../database/db';
import { sendNotificationEmail } from './emailService';
import {
  booleanPreference,
  CreateNotificationInput,
  preferenceFlagByType
} from './notificationTypes';
import {
  createNotificationRecord,
  getNotificationPreferences,
  getUserEmailForNotification,
  logNotificationDelivery
} from './notificationRepository';

export type NotificationCreateResult = {
  inAppNotificationId: number | null;
  emailNotificationId: number | null;
  skippedReason?: 'self' | 'type_disabled' | 'channels_disabled' | 'missing_email';
};

const isTypeEnabled = (preferences: Awaited<ReturnType<typeof getNotificationPreferences>>, type: CreateNotificationInput['type']) => {
  const flag = preferenceFlagByType[type];
  return booleanPreference(preferences[flag]);
};

export const createNotification = async (input: CreateNotificationInput): Promise<NotificationCreateResult> => {
  if (input.actorUserId && input.actorUserId === input.userId) {
    return { inAppNotificationId: null, emailNotificationId: null, skippedReason: 'self' };
  }

  const preferences = await getNotificationPreferences(input.userId);
  if (!isTypeEnabled(preferences, input.type)) {
    return { inAppNotificationId: null, emailNotificationId: null, skippedReason: 'type_disabled' };
  }

  const wantsInApp = booleanPreference(preferences.in_app_enabled);
  const wantsEmail = booleanPreference(preferences.email_enabled);
  if (!wantsInApp && !wantsEmail) {
    return { inAppNotificationId: null, emailNotificationId: null, skippedReason: 'channels_disabled' };
  }

  let inAppNotificationId: number | null = null;
  let emailNotificationId: number | null = null;

  if (wantsInApp) {
    inAppNotificationId = await createNotificationRecord(pool, { ...input, channel: 'in_app', readAt: null });
  }

  if (wantsEmail) {
    const recipient = await getUserEmailForNotification(input.userId);
    if (!recipient?.email) {
      return { inAppNotificationId, emailNotificationId: null, skippedReason: 'missing_email' };
    }

    emailNotificationId = inAppNotificationId ?? (await createNotificationRecord(pool, {
      ...input,
      channel: 'email',
      readAt: new Date()
    }));

    try {
      const result = await sendNotificationEmail({
        to: recipient.email,
        title: input.title,
        body: input.body,
        href: input.href
      });
      await logNotificationDelivery(emailNotificationId, 'email', result.status, null);
    } catch (error) {
      await logNotificationDelivery(emailNotificationId, 'email', 'failed', error instanceof Error ? error.message : 'EMAIL_FAILED');
    }
  }

  return { inAppNotificationId, emailNotificationId };
};

export const createCommentNotification = async (input: {
  postAuthorId: number;
  actorUserId: number;
  postId: number;
}) =>
  createNotification({
    userId: input.postAuthorId,
    actorUserId: input.actorUserId,
    type: 'new_comment',
    title: 'Nouveau commentaire',
    body: 'Quelqu un a reagi a votre partage sur Oncarya.',
    href: `/article/${input.postId}#comments`,
    metadata: { postId: input.postId }
  });

export const createReactionNotification = async (input: {
  postAuthorId: number;
  actorUserId: number;
  postId: number;
}) =>
  createNotification({
    userId: input.postAuthorId,
    actorUserId: input.actorUserId,
    type: 'reaction',
    title: 'Votre partage a ete utile',
    body: 'Un membre a indique que votre contenu lui a apporte quelque chose.',
    href: `/article/${input.postId}`,
    metadata: { postId: input.postId }
  });

export const createModerationReviewNotification = async (input: {
  authorId: number;
  targetType: 'post' | 'comment';
  targetId: number;
}) =>
  createNotification({
    userId: input.authorId,
    type: 'moderation',
    title: 'Contenu en verification',
    body: 'Votre contenu peut necessiter une verification pour garder un espace sur et bienveillant.',
    href: input.targetType === 'post' ? `/article/${input.targetId}` : null,
    metadata: { targetType: input.targetType, targetId: input.targetId }
  });
