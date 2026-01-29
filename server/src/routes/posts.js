// server/src/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 1. RÉCUPÉRER TOUS LES POSTS (GET)
router.get('/', async (req, res) => {
    const currentUserId = parseInt(req.query.user_id) || 0; 

    const sql = `
        SELECT 
            posts.*, 
            users.firstname, 
            users.lastname,
            tags.title as tag_title, 
            tags.id as tag_id_from_tag,
            (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as like_count,
            (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?) as is_liked
        FROM posts
        JOIN users ON posts.user_id = users.id
        LEFT JOIN tags ON posts.tag_id = tags.id
        ORDER BY posts.created_at DESC
    `;

    try {
        const [posts] = await db.query(sql, [currentUserId]);
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des posts" });
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

// POST /api/posts/:id/like
router.post('/:id/like', async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.user_id;

    if (!userId) return res.status(401).json({ message: "Non connecté" });

    try {
        const [existingLike] = await db.query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?', 
            [userId, postId]
        );

        if (existingLike.length > 0) {
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            res.json({ liked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;