import dotenv from 'dotenv';
dotenv.config();

const must = (v: string | undefined, n: string) => {
  if (!v) throw new Error(`Missing env: ${n}`);
  return v;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const TEST_JWT_SECRET = 'test_jwt_secret_32_chars_minimum__a';
const TEST_JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_32_chars__b';

const normalizeSecret = (value: string | undefined, fallback: string) => {
  if (isTest && (!value || value.length < 32)) return fallback;
  return value;
};

const corsOrigin = must(process.env.CORS_ORIGIN, 'CORS_ORIGIN');
const jwtSecret = must(normalizeSecret(process.env.JWT_SECRET, TEST_JWT_SECRET), 'JWT_SECRET');
const jwtRefreshSecret = must(normalizeSecret(process.env.JWT_REFRESH_SECRET, TEST_JWT_REFRESH_SECRET), 'JWT_REFRESH_SECRET');

export const env = {
  nodeEnv,
  isProd,
  port: Number(process.env.PORT || 3000),
  corsOrigin,
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || corsOrigin.split(',')[0],
  appBaseUrl: process.env.APP_BASE_URL || process.env.CLIENT_URL || process.env.FRONTEND_URL || corsOrigin.split(',')[0],
  jwtSecret,
  jwtRefreshSecret,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || ''
  },
  oauthStateSecret: process.env.OAUTH_STATE_SECRET || jwtSecret,
  email: {
    mode: process.env.EMAIL_MODE || (process.env.RESEND_API_KEY ? 'resend' : 'console'),
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
    replyTo: process.env.EMAIL_REPLY_TO || ''
  },
  db: {
    host: must(process.env.DB_HOST, 'DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: must(process.env.DB_USER, 'DB_USER'),
    password: must(process.env.DB_PASSWORD, 'DB_PASSWORD'),
    name: must(process.env.DB_NAME, 'DB_NAME'),
    ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1',
    sslCa: process.env.DB_SSL_CA
  },
  redisUrl: process.env.REDIS_URL || '',
  metricsToken: process.env.METRICS_TOKEN || '',
  migrateOnStart: process.env.MIGRATE_ON_START === 'true' || process.env.MIGRATE_ON_START === '1',
  seedOnStart: process.env.SEED_ON_START === 'true' || process.env.SEED_ON_START === '1'
};

if (env.jwtSecret.length < 32) throw new Error('JWT_SECRET must be >= 32 chars');
if (env.jwtRefreshSecret.length < 32) throw new Error('JWT_REFRESH_SECRET must be >= 32 chars');
