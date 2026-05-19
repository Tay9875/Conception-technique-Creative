import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';

const run = async () => {
  const c = await mysql.createConnection({ host: env.db.host, port: env.db.port, user: env.db.user, password: env.db.password, database: env.db.name, ssl: env.db.ssl ? (env.db.sslCa ? { ca: env.db.sslCa } : undefined) : undefined });
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  for (const stmt of sql.split(';').map((s) => s.trim()).filter(Boolean)) await c.query(stmt);
  await c.end();
};

run().catch(() => process.exit(1));
