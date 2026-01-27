// server/src/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 1. RÉCUPÉRER TOUS LES POSTS (GET)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.firstname, users.lastname, tags.title as tag_title, tags.id as tag_id
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN post_tags ON posts.id = post_tags.post_id
            LEFT JOIN tags ON post_tags.tag_id = tags.id
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
    const { title, description, user_id, tag_id } = req.body; // On récupère tag_id

    if (!title || !description || !user_id || !tag_id) {
        return res.status(400).json({ message: "Tous les champs (et le tag) sont requis." });
    }

    try {
        // A. On insère le post
        const [result] = await db.query(
            'INSERT INTO posts (title, description, user_id) VALUES (?, ?, ?)',
            [title, description, user_id]
        );
        
        const newPostId = result.insertId;

        // B. On associe le tag au post dans la table de liaison
        await db.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            [newPostId, tag_id]
        );

        res.status(201).json({ message: "Post publié avec succès !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la publication." });
    }
});

module.exports = router;