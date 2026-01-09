// server/src/database/seed.js
require('dotenv').config(); // Charge les variables d'environnement
const db = require('./db'); // Récupère ta connexion existante

async function seed() {
    try {
        console.log("🌱 Démarrage de l'initialisation des données...");
        
        await db.query(`
            INSERT IGNORE INTO roles (id, name) VALUES 
            (1, 'Patient'), 
            (2, 'Ancien Patient'), 
            (3, 'Proche');
        `);
        console.log("✅ Rôles insérés avec succès.");

        await db.query(`
            INSERT IGNORE INTO pathologies (id, name) VALUES 
            (1, 'Cancer du sein'), 
            (2, 'Leucémie'), 
            (3, 'Cancer du poumon'), 
            (4, 'Cancer de la prostate');
        `);
        console.log("✅ Pathologies insérées avec succès.");

        await db.query(`
            INSERT IGNORE INTO tags (id, title) VALUES 
            (1, 'Cancer du sein'),
            (2, 'Cancer de la prostate'),
            (3, 'Cancer du poumon'),
            (4, 'Cancer colorectal'),
            (5, 'Mélanome'),
            (6, 'Cancer de la vessie'),
            (7, 'Lymphome'),
            (8, 'Cancer du rein'),
            (9, 'Cancer de la thyroïde'),
            (10, 'Cancer du pancréas'),
            (11, 'Nutrition'),
            (12, 'Bien-être'),
            (13, 'Soutien moral');
        `);
        console.log("✅ Tags insérés avec succès.");

        console.log("🚀 Base de données prête à l'emploi !");
        return;

    } catch (error) {
        console.error("❌ Une erreur est survenue lors du seeding :", error);
        throw error;
    }
}

module.exports = seed;

if (require.main === module) {
    seed()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}