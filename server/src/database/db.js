// server/src/database/db.js
require('dotenv').config({ quiet: true }); // Charge les variables du fichier .env
const mysql = require('mysql2/promise');

// Création d'un pool de connexions (plus performant qu'une simple connexion)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1'
    ? { rejectUnauthorized: false }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Petit test de connexion au démarrage
pool.getConnection()
  .then((conn) => {
    console.log("✅ Connecté à la base de données MySQL avec succès !");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion à la BDD :", err);
  });

module.exports = pool;
