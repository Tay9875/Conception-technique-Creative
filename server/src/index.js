// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Important pour que le Front parle au Back

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

    app.listen(PORT, () => {
        console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
};

boot().catch((err) => {
    console.error('❌ Erreur au démarrage du serveur :', err);
    process.exit(1);
});