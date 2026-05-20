import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../config/env';

type OAuthStatePayload = {
  returnTo: string;
  expiresAt: number;
};

const base64UrlEncode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const base64UrlDecode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload: string) =>
  createHmac('sha256', env.oauthStateSecret).update(payload).digest('base64url');

export const sanitizeReturnTo = (value: unknown) => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.includes('://') || value.includes('\\')) return '/';
  return value.slice(0, 200);
};

export const createOAuthState = (returnTo: unknown) => {
  const payload: OAuthStatePayload = {
    returnTo: sanitizeReturnTo(returnTo),
    expiresAt: Date.now() + 10 * 60 * 1000
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
};

export const verifyOAuthState = (state: unknown): OAuthStatePayload | null => {
  if (typeof state !== 'string') return null;
  const [encoded, signature] = state.split('.');
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as OAuthStatePayload;
    if (!payload.expiresAt || payload.expiresAt < Date.now()) return null;
    return { returnTo: sanitizeReturnTo(payload.returnTo), expiresAt: payload.expiresAt };
  } catch {
    return null;
  }
};
