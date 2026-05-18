const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const getJwtSecret = () => process.env.JWT_SECRET || 'oncarya-dev-jwt-secret-change-me';

router.post('/register', async (req, res) => {
    const { firstname, lastname, email, password, role_id } = req.body;

    try {
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Cet email est deja utilise.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = role_id || 1;

        await db.query(
            'INSERT INTO users (firstname, lastname, email, password, role_id) VALUES (?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'Inscription reussie !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_id },
            getJwtSecret(),
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;
