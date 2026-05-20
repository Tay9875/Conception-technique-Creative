import { env } from '../config/env';
import { logger } from '../lib/logger';

export type NotificationEmailInput = {
  to: string;
  title: string;
  body: string;
  href?: string | null;
};

export type EmailSendResult = {
  status: 'sent' | 'skipped';
  provider: 'resend' | 'console' | 'disabled';
};

const safeHref = (href?: string | null) => {
  if (!href || !href.startsWith('/') || href.startsWith('//') || href.includes('://') || href.includes('\\')) {
    return env.appBaseUrl;
  }
  return new URL(href, env.appBaseUrl).toString();
};

const buildTextEmail = (input: NotificationEmailInput) => [
  input.title,
  '',
  input.body,
  '',
  `Voir dans Oncarya : ${safeHref(input.href)}`,
  '',
  'Vous pouvez modifier vos preferences de notifications depuis votre profil.'
].join('\n');

export const sendNotificationEmail = async (input: NotificationEmailInput): Promise<EmailSendResult> => {
  if (env.email.mode === 'disabled') return { status: 'skipped', provider: 'disabled' };

  const subject = `Oncarya - ${input.title}`;
  const text = buildTextEmail(input);

  if (env.email.mode !== 'resend') {
    logger.info({ to: input.to, subject }, 'Notification email logged in console mode');
    return { status: 'sent', provider: 'console' };
  }

  if (!env.email.resendApiKey || !env.email.from) {
    logger.warn('Resend email mode is enabled but RESEND_API_KEY or EMAIL_FROM is missing');
    return { status: 'skipped', provider: 'resend' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.email.resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.email.from,
      to: [input.to],
      subject,
      text,
      reply_to: env.email.replyTo || undefined
    })
  });

  if (!response.ok) {
    throw new Error(`RESEND_EMAIL_FAILED_${response.status}`);
  }

  return { status: 'sent', provider: 'resend' };
};
