// server/src/routes/comments.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 1. Récupérer les commentaires d'un post spécifique
router.get('/:postId', async (req, res) => {
    try {
        const sql = `
            SELECT comments.*, users.firstname, users.lastname 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE post_id = ? 
            ORDER BY comments.created_at ASC
        `;
        const [comments] = await db.query(sql, [req.params.postId]);
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 2. Ajouter un commentaire
router.post('/', async (req, res) => {
    const { description, user_id, post_id } = req.body;

    if (!description || !user_id || !post_id) {
        return res.status(400).json({ message: "Champs manquants." });
    }

    try {
        await db.query(
            'INSERT INTO comments (description, user_id, post_id) VALUES (?, ?, ?)',
            [description, user_id, post_id]
        );
        res.status(201).json({ message: "Commentaire ajouté !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

module.exports = router;