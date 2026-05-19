import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

let _redis: Redis | null = null;
if (env.redisUrl) {
  try {
    const client = new Redis(env.redisUrl);
    client.on('error', (err) => {
      logger.warn({ err }, 'Redis client error — disabling cache');
      try {
        client.quit().catch(() => {});
      } catch {}
      _redis = null;
    });
    _redis = client;
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize Redis, cache disabled');
    _redis = null;
  }
}

export const redis = _redis;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
