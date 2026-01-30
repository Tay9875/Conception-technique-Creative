const express = require('express');
const router = express.Router();
const db = require('../database/db');

// --- 1. RÉCUPÉRER TOUTES LES NOTES ---
router.get('/', async (req, res) => {
    try {
        const [notes] = await db.query(`
            SELECT 
                notes.*, 
                users.firstname, 
                users.lastname
            FROM notes
            JOIN users ON notes.user_id = users.id
            ORDER BY notes.created_at DESC
        `);
        res.json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des notes" });
    }
});

// --- 2. RÉCUPÉRER LA NOTE D'UN UTILISATEUR ---
router.get('/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('SELECT * FROM notes WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Note introuvable pour cet utilisateur" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// --- 3. CRÉER OU METTRE À JOUR UNE NOTE ---
router.post('/', async (req, res) => {
    const { title, content, user_id } = req.body;

    if (!title || !content || !user_id) {
        return res.status(400).json({ message: "Tous les champs (title, content, user_id) sont requis" });
    }

    try {
        // Vérifier si l'utilisateur a déjà une note
        const [existing] = await db.query('SELECT * FROM notes WHERE user_id = ?', [user_id]);
        if (existing.length > 0) {
            // Update
            await db.query('UPDATE notes SET title = ?, content = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ?', [title, content, user_id]);
            return res.json({ message: "Note mise à jour avec succès" });
        }

        // Insert
        const [result] = await db.query('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)', [title, content, user_id]);
        res.status(201).json({ message: "Note créée avec succès", id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Une note existe déjà pour cet utilisateur" });
        }
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// --- 4. SUPPRIMER UNE NOTE ---
router.delete('/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [result] = await db.query('DELETE FROM notes WHERE user_id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Aucune note trouvée pour cet utilisateur" });
        }
        res.json({ message: "Note supprimée avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
