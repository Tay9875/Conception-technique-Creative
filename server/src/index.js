// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- IMPORTS DES ROUTES ---
const authRoutes = require('./routes/auth'); // C'est cette ligne qui te manquait !
const postRoutes = require('./routes/posts'); // Et celle-ci pour les posts
const tagsRoutes = require('./routes/tags');
const postRoutes = require('./routes/notes');
const commentsRoutes = require('./routes/comments');
const db = require('./database/db'); // Import du pool de connexion DB

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Autorise le frontend à se connecter
app.use(express.json()); // Permet de lire le JSON envoyé par le front

const shouldMigrateOnStart = () => {
    const value = process.env.MIGRATE_ON_START;
    return value === 'true' || value === '1' || value === 'yes';
};

const shouldSeedOnStart = () => {
    const value = process.env.SEED_ON_START;
    return value === 'true' || value === '1' || value === 'yes';
};

const boot = async () => {
    if (shouldMigrateOnStart()) {
        const migrate = require('./database/migrate');
        await migrate();
    }

    if (shouldSeedOnStart() || shouldMigrateOnStart()) {
        const seed = require('./database/seed');
        await seed();
    }

    require('./database/db'); // Test BDD

    // Routes
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
};

boot().catch((err) => {
    console.error("❌ Erreur lors du démarrage de l'application :", err);
    process.exit(1);
});

// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes); // Utilise l'import authRoutes
app.use('/api/posts', postRoutes); // Utilise l'import postRoutes
app.use('api/notes', noteRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/comments', commentsRoutes);

// --- ROUTE TEMPORAIRE POUR METTRE À JOUR LA BDD SUR RENDER ---
app.get('/api/fix-db-structure', async (req, res) => {
    try {
        // 1. Créer la table tags si elle n'existe pas
        await db.query(`
            CREATE TABLE IF NOT EXISTS tags (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(50) NOT NULL UNIQUE
            )
        `);

        // 2. Ajouter la colonne tag_id à posts (si elle manque, ça plantera pas grâce au try/catch ou on peut ignorer l'erreur)
        try {
            await db.query(`ALTER TABLE posts ADD COLUMN tag_id INT NULL`);
            await db.query(`ALTER TABLE posts ADD CONSTRAINT fk_posts_tags FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL`);
            console.log("Colonne tag_id ajoutée !");
        } catch (e) {
            console.log("La colonne tag_id existe probablement déjà :", e.message);
        }

        // 3. Ajouter la colonne is_banned
        try {
            await db.query(`ALTER TABLE posts ADD COLUMN is_banned TINYINT(1) DEFAULT 0`);
            console.log("Colonne is_banned ajoutée !");
        } catch (e) {
            console.log("La colonne is_banned existe probablement déjà :", e.message);
        }

        // 4. Créer la table notes si elle n'existe pas
        await db.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(50) NOT NULL,
                content VARCHAR(255) NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // 5. Créer la table Likes
        await db.query(`
            CREATE TABLE IF NOT EXISTS likes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                post_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, post_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        `);

        res.send("Base de données mise à jour avec succès !");
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour : " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});