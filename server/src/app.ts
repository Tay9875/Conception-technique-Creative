import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { env } from './config/env';
import { logger } from './lib/logger';
import { dbHealth } from './database/db';
import { authRouter } from './routes/auth';
import { postsRouter } from './routes/posts';
import { commentsRouter } from './routes/comments';
import { tagsRouter } from './routes/tags';
import { usersRouter } from './routes/users';
import { moderationRouter } from './routes/moderation';
import { adminRouter } from './routes/admin';
import { searchRouter } from './routes/search';
import { buildRateLimit, compressionMw, helmetMw } from './middleware/security';
import { fail, HttpError } from './lib/http';
import { metrics } from './lib/metrics';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 2);
app.use((req, _res, next) => { req.requestId = randomUUID(); next(); });
app.use((req, res, next) => {
  res.on('finish', () => metrics.incHttp(req.method, req.path, res.statusCode));
  next();
});
app.use(pinoHttp({ logger }));
app.use(helmetMw as express.RequestHandler);
app.use(compressionMw as express.RequestHandler);

const allowedOrigins = env.corsOrigin.split(',').map((s) => s.trim()).filter(Boolean);
const isSamePublicHost = (origin: string, req: express.Request) => {
  try {
    const originUrl = new URL(origin);
    const forwardedHost = req.headers['x-forwarded-host'];
    const publicHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.headers.host;
    return originUrl.host === publicHost;
  } catch {
    return false;
  }
};

app.use(cors((req, callback) => {
  callback(null, {
    origin: (origin, originCallback) => {
      if (!origin) return originCallback(null, true);
      if (!env.isProd) return originCallback(null, true);
      return originCallback(null, allowedOrigins.includes(origin) || isSamePublicHost(origin, req));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}));

app.use(express.json({ limit: '100kb' }));
app.use(buildRateLimit(60_000, 120, 'global'));

app.get('/health', async (_req, res) => {
  try {
    await dbHealth();
    return res.status(200).json({ ok: true, db: 'up' });
  } catch {
    return res.status(503).json({ ok: false, db: 'down' });
  }
});

app.get('/metrics', async (req, res) => {
  if (env.isProd && env.metricsToken) {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    if (token !== env.metricsToken) return fail(res, 401, 'UNAUTHORIZED', 'Metrics unauthorized');
  }
  res.setHeader('Content-Type', metrics.contentType);
  res.end(await metrics.render());
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/users', usersRouter);
app.use('/api/moderation', moderationRouter);
app.use('/api/admin', adminRouter);
app.use('/api/search', searchRouter);

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) return fail(res, err.status, err.code, err.message, err.details);
  logger.error({ err, requestId: req.requestId }, 'Unhandled error');
  return fail(res, 500, 'INTERNAL_ERROR', 'Erreur interne.', { requestId: req.requestId });
});
