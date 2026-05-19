import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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

export const buildRateLimit = (windowMs: number, max: number, prefix: string) => {
  if (redis) {
    const r = redis;
    return rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({ sendCommand: (...args: string[]) => (r.call(...(args as [string, ...string[]])) as Promise<any>), prefix: `rl:${prefix}:` })
    });
  }
  return rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
};
