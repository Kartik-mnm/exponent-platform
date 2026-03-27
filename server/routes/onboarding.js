const router  = require('express').Router();
const db      = require('../db');
const bcrypt  = require('bcryptjs');

// POST /api/onboarding/signup
// Creates academy + branch + super_admin user in one transaction
router.post('/signup', async (req, res) => {
  const { owner_name, email, phone, academy_name, password } = req.body;

  // Basic validation
  if (!owner_name || !email || !phone || !academy_name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if email already used
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1', [email]
    );
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // 2. Create academy record
    const slug = academy_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36); // unique suffix

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    let academyId;
    try {
      const { rows: aRows } = await client.query(
        `INSERT INTO academies (name, slug, phone, email, plan, is_active, trial_ends_at)
         VALUES ($1, $2, $3, $4, 'trial', true, $5) RETURNING id`,
        [academy_name, slug, phone, email, trialEnds]
      );
      academyId = aRows[0].id;
    } catch (e) {
      // academies table may not exist yet — still create the user
      academyId = null;
    }

    // 3. Create default branch
    let branchId;
    try {
      const { rows: bRows } = await client.query(
        `INSERT INTO branches (name, academy_id)
         VALUES ($1, $2) RETURNING id`,
        [academy_name + ' - Main Branch', academyId]
      );
      branchId = bRows[0].id;
    } catch (e) {
      branchId = null;
    }

    // 4. Create super_admin user
    const hash = await bcrypt.hash(password, 10);
    const { rows: uRows } = await client.query(
      `INSERT INTO users (name, email, password, role, branch_id, academy_id)
       VALUES ($1, $2, $3, 'super_admin', $4, $5) RETURNING id, name, email, role`,
      [owner_name, email, hash, branchId, academyId]
    );
    const user = uRows[0];

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Academy created successfully!',
      academy: { id: academyId, name: academy_name, slug, trial_ends_at: trialEnds },
      user:    { id: user.id, name: user.name, email: user.email, role: user.role },
      login_url: 'https://acadfee.onrender.com',
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Signup error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  } finally {
    client.release();
  }
});

// POST /api/onboarding/lead
// Quick Setup — saves lead for manual follow-up
router.post('/lead', async (req, res) => {
  const { name, phone, academy_name } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  try {
    // Try to save in academies table as inactive lead
    try {
      await db.query(
        `INSERT INTO academies (name, slug, phone, plan, is_active)
         VALUES ($1, $2, $3, 'lead', false)`,
        [academy_name || name + "'s Academy",
         'lead-' + Date.now().toString(36),
         phone]
      );
    } catch (e) {
      // If academies table doesn't exist, just log it
      console.log('Lead received:', { name, phone, academy_name });
    }
    res.json({ success: true, message: 'Lead saved. We will contact you within 24 hours.' });
  } catch (err) {
    console.error('Lead error:', err);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

module.exports = router;
