// ============================================================
// EXPONENT PLATFORM - Platform Auth Routes
// POST /platform/auth/login
// GET  /platform/auth/me
// ============================================================

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const { authRateLimit } = require('../middleware');

// POST /platform/auth/login
// Rate limited: 10 attempts per 15 minutes per IP
router.post('/login', authRateLimit, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Sanitize inputs
  const cleanEmail = String(email).trim().toLowerCase();
  if (cleanEmail.length > 254) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM platform_admins WHERE email = $1 AND is_active = true',
      [cleanEmail]
    );

    // Always run bcrypt even if user not found to prevent timing attacks
    const dummyHash = '$2b$10$invalidhashfortimingprotection000000000000000000000000';
    const hash = rows[0]?.password_hash || dummyHash;
    const valid = await bcrypt.compare(password, hash);

    if (!rows[0] || !valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db.query(
      'UPDATE platform_admins SET last_login_at = NOW() WHERE id = $1',
      [rows[0].id]
    );

    const token = jwt.sign(
      { id: rows[0].id, email: rows[0].email, name: rows[0].name, role: 'platform_owner', academy_id: null },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, admin: { id: rows[0].id, email: rows[0].email, name: rows[0].name } });
  } catch (err) {
    console.error('[platform-auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /platform/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'platform_owner') {
      return res.status(403).json({ error: 'Not a platform owner' });
    }
    const { rows } = await db.query(
      'SELECT id, email, name, last_login_at FROM platform_admins WHERE id = $1',
      [decoded.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Admin not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
