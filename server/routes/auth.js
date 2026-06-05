// ============================================================
// EXPONENT PLATFORM - Auth Routes
// POST /api/auth/login
// GET  /api/auth/me
// POST /api/auth/logout
// ============================================================

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const { authRateLimit, authenticate } = require('../middleware');

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', authRateLimit, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.password, u.role, u.branch_id, u.academy_id,
              a.name AS academy_name, a.slug AS academy_slug
       FROM users u
       LEFT JOIN academies a ON a.id = u.academy_id
       WHERE u.email = $1`,
      [String(email).trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      {
        id:         user.id,
        email:      user.email,
        role:       user.role,
        branch_id:  user.branch_id,
        academy_id: user.academy_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id:           user.id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        branch_id:    user.branch_id,
        academy_id:   user.academy_id,
        academy_name: user.academy_name,
        academy_slug: user.academy_slug,
      },
    });
  } catch (err) {
    console.error('[auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.academy_id,
              a.name AS academy_name, a.slug AS academy_slug, a.logo_url,
              a.plan, a.is_active, a.trial_ends_at
       FROM users u
       LEFT JOIN academies a ON a.id = u.academy_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[auth] Me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
// JWT is stateless — client just drops the token
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
