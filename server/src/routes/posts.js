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
    // On récupère les infos
    const { title, description, user_id, tag_id } = req.body; 

    // Validation
    if (!title || !description || !user_id || !tag_id) {
        return res.status(400).json({ message: "Tous les champs (et le tag) sont requis." });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO posts (title, description, user_id, tag_id) VALUES (?, ?, ?, ?)',
            [title, description, user_id, tag_id]
        );
        
        // On renvoie l'ID du nouveau post
        res.status(201).json({ 
            id: result.insertId, 
            message: "Post publié avec succès !" 
        });

    } catch (error) {
        console.error("Erreur insertion post:", error);
        res.status(500).json({ message: "Erreur lors de la publication." });
    }
});

// POST /api/posts/:id
router.post('/:id', async (req, res) => {
    const postId = req.params.id;
    const userId = req.body.user_id;

    if (!userId) return res.status(401).json({ message: "Non connecté" });

    try {
        const [existingLike] = await db.query(
            'SELECT * FROM likes WHERE user_id = ? AND post_id = ?', 
            [userId, postId]
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
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