import { app } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { runDatabaseStartupTasks } from './database/startup';

async function start() {
  await runDatabaseStartupTasks();
  app.listen(env.port, () => logger.info({ port: env.port }, 'Server started'));
}

start().catch((err) => {
  logger.error({ err }, 'Server startup failed');
  process.exit(1);
});
