// server/src/database/seed.js
require('dotenv').config(); // Charge les variables d'environnement
const db = require('./db'); // Récupère ta connexion existante

async function seed() {
    try {
        console.log("🌱 Démarrage de l'initialisation des données...");

        /* * ÉTAPE 1 : LES RÔLES
         * On utilise INSERT IGNORE pour ne pas créer d'erreur si les données existent déjà.
         * On force l'ID pour être sûr que 1 = Patient.
         */
        await db.query(`
            INSERT IGNORE INTO roles (id, name) VALUES 
            (1, 'Patient'), 
            (2, 'Ancien Patient'), 
            (3, 'Proche');
        `);
        console.log("✅ Rôles insérés avec succès.");

        /* * ÉTAPE 2 : LES PATHOLOGIES
         */
        await db.query(`
            INSERT IGNORE INTO pathologies (id, name) VALUES 
            (1, 'Cancer du sein'), 
            (2, 'Leucémie'), 
            (3, 'Cancer du poumon'), 
            (4, 'Cancer de la prostate');
        `);
        console.log("✅ Pathologies insérées avec succès.");

        console.log("🚀 Base de données prête à l'emploi !");
        process.exit(0); // Arrête le script proprement

    } catch (error) {
        console.error("❌ Une erreur est survenue lors du seeding :", error);
        process.exit(1); // Arrête le script avec une erreur
    }
}

seed();