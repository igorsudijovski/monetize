const express = require('express');
const router = express.Router();
const db = require('../db');

// validate license
router.post('/validate', async (req, res) => {
  const { key, productId } = req.body;
  if (!key) return res.status(400).json({ valid: false, error: 'Missing key' });
  const r = await db.query('SELECT * FROM licenses WHERE key=$1', [key]);
  const lic = r.rows[0];
  if (!lic) return res.json({ valid: false, error: 'Not found' });
  if (productId && lic.product_id !== productId) return res.json({ valid: false, error: 'Product mismatch' });
  if (lic.status !== 'active') return res.json({ valid: false, error: lic.status });
  if (lic.expires_at && new Date(lic.expires_at) < new Date()) return res.json({ valid: false, error: 'expired' });
  res.json({ valid: true, status: lic.status, expiresAt: lic.expires_at });
});

module.exports = router;
