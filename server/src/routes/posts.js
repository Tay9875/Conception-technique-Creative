// server/src/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 1. RÉCUPÉRER TOUS LES POSTS (GET)
router.get('/', async (req, res) => {
    try {
        // On fait une JOINTURE (JOIN) pour récupérer le prénom/nom de l'auteur du post
        const sql = `
            SELECT posts.*, users.firstname, users.lastname 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            ORDER BY posts.created_at DESC
        `;
        const [posts] = await db.query(sql);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 2. CRÉER UN NOUVEAU POST (POST)
router.post('/', async (req, res) => {
    const { title, description, user_id } = req.body;

    if (!title || !description || !user_id) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    try {
        await db.query(
            'INSERT INTO posts (title, description, user_id) VALUES (?, ?, ?)',
            [title, description, user_id]
        );
        res.status(201).json({ message: "Post publié !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la publication." });
    }
});

module.exports = router;