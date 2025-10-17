const express = require('express');
const router = express.Router();
const db = require('../db');

// list products
router.get('/', async (req, res) => {
  const r = await db.query('SELECT p.*, u.name as creator_name FROM products p LEFT JOIN users u ON p.creator_id = u.id ORDER BY p.created_at DESC');
  res.json(r.rows);
});

// create product (requires session/auth)
router.post('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, description, price_cents, currency='usd' } = req.body;
  if (!name || !price_cents) return res.status(400).json({ error: 'Missing fields' });
  const r = await db.query('INSERT INTO products (creator_id, name, description, price_cents, currency) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [req.user.id, name, description, price_cents, currency]);
  res.json(r.rows[0]);
});

module.exports = router;
