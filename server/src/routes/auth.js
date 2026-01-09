// server/src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Pour crypter les mots de passe
const jwt = require('jsonwebtoken'); // Pour créer le token de connexion
const db = require('../database/db'); // Ta connexion BDD

// INSCRIPTION
router.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, role_id } = req.body;

    try {
        // 1. Vérifier si l'email existe déjà
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // 2. Hacher le mot de passe (Sécurité)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insérer l'utilisateur (Par défaut role_id = 1 Patient si non précisé, pour l'exemple)
        const role = role_id || 1; 
        
        await db.query(
            'INSERT INTO users (firstname, lastname, email, password, role_id) VALUES (?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, role]
        );

        res.status(201).json({ message: "Inscription réussie !" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// CONNEXION
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Chercher l'utilisateur
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = users[0];

        // 2. Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // 3. Créer un token (Badge d'accès)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_id },
            'SECRET_KEY_A_METTRE_DANS_ENV', // Idéalement, mets ça dans ton .env
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, firstname: user.firstname, lastname: user.lastname } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

module.exports = router;