// server/src/routes/posts.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY_A_METTRE_DANS_ENV';

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return next();

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return next();
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

// 1. RÉCUPÉRER TOUS LES POSTS (GET)
router.get('/', authenticateToken, async (req, res) => {
    const currentUserId = parseInt(req.query.user_id) || 0;
    const showBanned = req.query.show_banned === '1' && req.user?.role === 4;

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
        ${showBanned ? '' : 'WHERE posts.is_banned = 0'}
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

router.patch('/:id/ban', authenticateToken, adminOnly, async (req, res) => {
    const postId = req.params.id;

    try {
        await db.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [postId]);
        res.json({ message: 'Post banni avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du bannissement du post.' });
    }
});

router.patch('/:id/unban', authenticateToken, adminOnly, async (req, res) => {
    const postId = req.params.id;

    try {
        await db.query('UPDATE posts SET is_banned = 0 WHERE id = ?', [postId]);
        res.json({ message: 'Post débanni avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors du débanissement du post." });
    }
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  const postId = req.params.id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        posts.id,
        posts.title,
        posts.description,
        tags.title AS tag_title
      FROM posts
      LEFT JOIN tags ON posts.tag_id = tags.id
      WHERE posts.id = ?
      `,
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Article introuvable" });
    }

    const post = rows[0];

    res.json({
      id: post.id,
      title: post.title,
      description: post.description,
      tag: post.tag_title ? { title: post.tag_title } : null,
    });
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

// POST /api/posts/:id/report (Signaler un post)
router.post('/:id/report', async (req, res) => {
    const postId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) return res.status(401).json({ message: "Vous devez être connecté pour signaler." });

    try {
        await db.query(
            'INSERT INTO reports (user_id, post_id) VALUES (?, ?)', 
            [user_id, postId]
        );

        const [rows] = await db.query(
            'SELECT COUNT(*) as count FROM reports WHERE post_id = ?', 
            [postId]
        );
        const reportCount = rows[0].count;

        if (reportCount >= 3) {
            await db.query('UPDATE posts SET is_banned = 1 WHERE id = ?', [postId]);
            
            return res.json({ 
                message: "Signalement pris en compte. Ce post a été supprimé automatiquement par la communauté.", 
                banned: true 
            });
        }

        res.json({ message: "Signalement pris en compte.", banned: false });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Vous avez déjà signalé ce post." });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur serveur lors du signalement." });
    }
});

module.exports = router;