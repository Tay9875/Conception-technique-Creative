// server/src/routes/tags.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Récupérer la liste complète des tags
router.get('/', async (req, res) => {
    try {
        const [tags] = await db.query('SELECT * FROM tags ORDER BY title ASC');
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des tags" });
    }
});

module.exports = router;