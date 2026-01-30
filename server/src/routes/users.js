const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/users/:id - retourne le profil utilisateur avec le role_id
router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      'SELECT id, firstname, lastname, email, role_id FROM users WHERE id = ?',
      [userId]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
