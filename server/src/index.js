require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');

const pkg = require('../package.json');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const tagsRoutes = require('./routes/tags');
const commentsRoutes = require('./routes/comments');
const usersRoutes = require('./routes/users');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = configuredOrigins.length > 0
    ? {
        origin(origin, callback) {
            if (!origin || configuredOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Origin not allowed by CORS'));
        }
    }
    : undefined;

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

const shouldMigrateOnStart = () => {
    const value = process.env.MIGRATE_ON_START;
    return value === 'true' || value === '1' || value === 'yes';
};

const shouldSeedOnStart = () => {
    const value = process.env.SEED_ON_START;
    return value === 'true' || value === '1' || value === 'yes';
};

const validateProductionConfig = () => {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required when NODE_ENV=production');
    }
};

const healthPayload = () => ({
    status: 'ok',
    service: 'oncarya-api',
    version: process.env.APP_VERSION || pkg.version,
    commit: process.env.APP_COMMIT_SHA || null
});

app.get('/health', (req, res) => {
    res.json(healthPayload());
});

app.get('/api/health', (req, res) => {
    res.json(healthPayload());
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);

if (process.env.ENABLE_DB_FIX_ROUTE === 'true') {
    app.get('/api/fix-db-structure', async (req, res) => {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS tags (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(50) NOT NULL UNIQUE
                )
            `);

            try {
                await db.query('ALTER TABLE posts ADD COLUMN tag_id INT NULL');
                await db.query('ALTER TABLE posts ADD CONSTRAINT fk_posts_tags FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE SET NULL');
                console.log('Colonne tag_id ajoutee.');
            } catch (e) {
                console.log('La colonne tag_id existe probablement deja :', e.message);
            }

            try {
                await db.query('ALTER TABLE posts ADD COLUMN is_banned TINYINT(1) DEFAULT 0');
                console.log('Colonne is_banned ajoutee.');
            } catch (e) {
                console.log('La colonne is_banned existe probablement deja :', e.message);
            }

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

            res.send('Base de donnees mise a jour avec succes.');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erreur lors de la mise a jour : ' + error.message);
        }
    });
}

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: 'Internal server error' });
});

const boot = async () => {
    validateProductionConfig();

    if (shouldMigrateOnStart()) {
        const migrate = require('./database/migrate');
        await migrate();
    }

    if (shouldSeedOnStart()) {
        const seed = require('./database/seed');
        await seed();
    }

    app.listen(PORT, () => {
        console.log(`Serveur lance sur http://localhost:${PORT}`);
    });
};

boot().catch((err) => {
    console.error("Erreur lors du demarrage de l'application :", err);
    process.exit(1);
});
