import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const must = (v: string | undefined, n: string) => {
  if (!v) throw new Error(`Missing env: ${n}`);
  return v;
};

const dbHost = must(process.env.DB_HOST, 'DB_HOST');
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = must(process.env.DB_USER, 'DB_USER');
const dbPassword = must(process.env.DB_PASSWORD, 'DB_PASSWORD');
const dbName = must(process.env.DB_NAME, 'DB_NAME');
const dbSslEnabled = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const dbSslCa = process.env.DB_SSL_CA;

export const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: dbSslEnabled ? (dbSslCa ? { ca: dbSslCa } : undefined) : undefined,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 100
});

export const dbHealth = async () => {
  await pool.query('SELECT 1');
  return true;
};
