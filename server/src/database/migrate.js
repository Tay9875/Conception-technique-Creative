// server/src/database/migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const migrate = async () => {
  const connection = await mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
      ? { rejectUnauthorized: false }
      : undefined,
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await connection.query(sql);
    console.log('✅ Migrations appliquées avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration :', err);
    throw err;
  } finally {
    await connection.end();
  }
};

module.exports = migrate;

if (require.main === module) {
  migrate().catch(() => process.exit(1));
}