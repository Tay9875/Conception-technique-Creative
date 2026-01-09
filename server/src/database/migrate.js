// server/src/database/migrate.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const migrate = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await connection.query(sql);
    console.log('✅ Base de données initialisée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration :', err);
  } finally {
    await connection.end();
  }
};

migrate();