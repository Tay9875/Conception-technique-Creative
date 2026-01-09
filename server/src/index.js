// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- IMPORTS DES ROUTES ---
const authRoutes = require('./routes/auth'); // C'est cette ligne qui te manquait !
const postRoutes = require('./routes/posts'); // Et celle-ci pour les posts
const tagsRoutes = require('./routes/tags');
const commentsRoutes = require('./routes/comments');
require('./database/db'); // Test BDD

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
app.use('/api/tags', tagsRoutes);
app.use('/api/comments', commentsRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});