// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- IMPORTS DES ROUTES ---
const authRoutes = require('./routes/auth'); // C'est cette ligne qui te manquait !
const postRoutes = require('./routes/posts'); // Et celle-ci pour les posts
require('./database/db'); // Test BDD

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- DÉCLARATION DES ROUTES ---
app.use('/api/auth', authRoutes); // Utilise l'import authRoutes
app.use('/api/posts', postRoutes); // Utilise l'import postRoutes

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});