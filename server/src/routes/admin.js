const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_A_METTRE_DANS_ENV';

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        return res.status(401).json({ message: 'Token manquant.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token invalide.' });
        }
        req.user = user;
        next();
    });
}

function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== 4) {
        return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
    }
    next();
}

router.use(authenticateToken, adminOnly);

router.get('/users', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, firstname, lastname, email, role_id, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
    }
});

router.get('/reports', async (req, res) => {
    try {
        const [reports] = await db.query(
            `SELECT
                reports.id,
                reports.created_at,
                reports.post_id,
                posts.title AS post_title,
                posts.is_banned,
                users.id AS reporter_id,
                users.firstname AS reporter_firstname,
                users.lastname AS reporter_lastname
            FROM reports
            JOIN posts ON reports.post_id = posts.id
            JOIN users ON reports.user_id = users.id
            ORDER BY reports.created_at DESC`
        );
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des signalements.' });
    }
});

router.patch('/posts/:id/ban', async (req, res) => {
    const postId = req.params.id;
    try {
        await db.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [postId]);
        res.json({ message: 'Publication bannie avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du bannissement de la publication.' });
    }
});

router.patch('/posts/:id/unban', async (req, res) => {
    const postId = req.params.id;
    try {
        await db.query('UPDATE posts SET is_banned = 0 WHERE id = ?', [postId]);
        res.json({ message: 'Publication débannie avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du débanissement de la publication.' });
    }
});

module.exports = router;
