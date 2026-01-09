const express = require("express");
const router = express.Router();
const db = require("../database/db");
const bcrypt = require("bcrypt");

// To hash password
const SALT_ROUNDS = 10;

// GET all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post("/", async (req, res) => {
  const { firstname, lastname, email, password, birthdate, role_id, pathology_id} = req.body;

  //hashed password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const [result] = await db.query(
      "INSERT INTO users (firstname, lastname, email, password, birthdate, role_id, pathology_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, hashedPassword, birthdate, role_id, pathology_id]
    );
    res.status(201).json({
      message: "Utilisateur créé",
      userId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  const { name, email } = req.body;
  try {
    await db.query(
      "UPDATE users SET name=?, email=? WHERE id=?",
      [name, email, req.params.id]
    );
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
