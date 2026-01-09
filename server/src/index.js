// server/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Important pour que le Front parle au Back
const authRoutes = require('./routes/auth');
require('./database/db'); // Test BDD

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Autorise le frontend à se connecter
app.use(express.json()); // Permet de lire le JSON envoyé par le front

// Routes
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});