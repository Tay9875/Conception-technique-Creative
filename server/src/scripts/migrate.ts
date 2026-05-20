import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';

dotenv.config();

const k = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'oncarya',
    password: process.env.DB_PASSWORD || 'oncarya',
    database: process.env.DB_NAME || 'oncarya'
  },
  migrations: { directory: path.resolve(__dirname, '../../migrations') }
});

k.migrate
  .latest()
  .then(([batchNo, migrations]) => {
    console.log(`✓ Executed ${migrations.length} migrations`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Migration failed:', err.message);
    process.exit(1);
  });
