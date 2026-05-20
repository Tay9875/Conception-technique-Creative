import helmet from 'helmet';
import compression from 'compression';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../lib/cache';

export const helmetMw = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  referrerPolicy: { policy: 'no-referrer' }
});

export const compressionMw = compression();

const firstHeaderValue = (value: string | string[] | undefined) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(',')[0]?.trim();
};

const rateLimitKeyGenerator = (req: Request) => {
  const cloudflareIp = firstHeaderValue(req.headers['cf-connecting-ip']);
  if (cloudflareIp) return `cf:${cloudflareIp}`;

  const realIp = firstHeaderValue(req.headers['x-real-ip']);
  if (realIp) return `real:${realIp}`;

  return ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
};

export const buildRateLimit = (windowMs: number, max: number, prefix: string) => {
  if (redis) {
    const r = redis;
    return rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: rateLimitKeyGenerator,
      store: new RedisStore({ sendCommand: (...args: string[]) => (r.call(...(args as [string, ...string[]])) as Promise<any>), prefix: `rl:${prefix}:` })
    });
  }
  return rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, keyGenerator: rateLimitKeyGenerator });
};
