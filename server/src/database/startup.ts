import path from 'path';
import knex from 'knex';
import { env } from '../config/env';
import { logger } from '../lib/logger';

export async function runDatabaseStartupTasks() {
  if (!env.migrateOnStart && !env.seedOnStart) return;

  const client = knex({
    client: 'mysql2',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      ssl: env.db.ssl ? (env.db.sslCa ? { ca: env.db.sslCa } : {}) : undefined
    },
    migrations: {
      directory: path.resolve(process.cwd(), 'migrations')
    }
  });

  try {
    if (env.migrateOnStart) {
      logger.info('Running database migrations');
      await client.migrate.latest();
      logger.info('Database migrations completed');
    }

    if (env.seedOnStart) {
      logger.info('Running database seed');
      const { seedDatabase } = await import('./seed.js');
      await seedDatabase();
      logger.info('Database seed completed');
    }
  } finally {
    await client.destroy();
  }
}
