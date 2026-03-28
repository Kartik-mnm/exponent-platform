const router  = require('express').Router();
const db      = require('../db');
const bcrypt  = require('bcryptjs');
const { authRateLimit } = require('../middleware');

// POST /api/onboarding/signup
// Rate limited — max 10 attempts per IP per 15 mins
router.post('/signup', authRateLimit, async (req, res) => {
  const { owner_name, email, phone, academy_name, password } = req.body;

  // Validate all fields
  if (!owner_name || !email || !phone || !academy_name || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Sanitize
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName  = String(owner_name).trim().slice(0, 120);
  const cleanAcad  = String(academy_name).trim().slice(0, 120);
  const cleanPhone = String(phone).replace(/[\s\-+().]/g, '').slice(0, 20);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if email already used
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1', [cleanEmail]
    );
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // 2. Create academy record
    const slug = cleanAcad
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);

    let academyId = null;
    try {
      const { rows: aRows } = await client.query(
        `INSERT INTO academies (name, slug, phone, email, plan, is_active, trial_ends_at)
         VALUES ($1, $2, $3, $4, 'trial', true, $5) RETURNING id`,
        [cleanAcad, slug, cleanPhone, cleanEmail, trialEnds]
      );
      academyId = aRows[0].id;
    } catch (e) {
      console.warn('[onboarding] academies table error:', e.message);
    }

    // 3. Create default branch
    let branchId = null;
    try {
      const { rows: bRows } = await client.query(
        `INSERT INTO branches (name, academy_id) VALUES ($1, $2) RETURNING id`,
        [cleanAcad + ' - Main Branch', academyId]
      );
      branchId = bRows[0].id;
    } catch (e) {
      console.warn('[onboarding] branch creation error:', e.message);
    }

    // 4. Create super_admin user — password is bcrypt hashed, never stored plain
    const hash = await bcrypt.hash(password, 12); // 12 rounds for extra security
    const { rows: uRows } = await client.query(
      `INSERT INTO users (name, email, password, role, branch_id, academy_id)
       VALUES ($1, $2, $3, 'super_admin', $4, $5) RETURNING id, name, email, role`,
      [cleanName, cleanEmail, hash, branchId, academyId]
    );

    await client.query('COMMIT');

    // 5. Send owner notification (non-blocking)
    sendOwnerNotification({ owner_name: cleanName, email: cleanEmail, phone: cleanPhone, academy_name: cleanAcad }).catch(console.error);

    res.status(201).json({
      message:   'Academy created successfully!',
      academy:   { id: academyId, name: cleanAcad, slug, trial_ends_at: trialEnds },
      user:      { id: uRows[0].id, name: uRows[0].name, email: uRows[0].email, role: uRows[0].role },
      login_url: 'https://acadfee.onrender.com',
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[onboarding] Signup error:', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  } finally {
    client.release();
  }
});

// POST /api/onboarding/lead — Quick Setup
router.post('/lead', authRateLimit, async (req, res) => {
  const { name, phone, academy_name } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const cleanName  = String(name).trim().slice(0, 120);
  const cleanPhone = String(phone).replace(/[\s\-+().]/g, '').slice(0, 20);
  const cleanAcad  = String(academy_name || name + "'s Academy").trim().slice(0, 120);

  try {
    try {
      await db.query(
        `INSERT INTO academies (name, slug, phone, plan, is_active)
         VALUES ($1, $2, $3, 'lead', false)`,
        [cleanAcad, 'lead-' + Date.now().toString(36), cleanPhone]
      );
    } catch (e) {
      console.log('[onboarding] Lead received (no academies table):', { cleanName, cleanPhone });
    }

    // Non-blocking owner notification
    sendOwnerNotification({ owner_name: cleanName, phone: cleanPhone, academy_name: cleanAcad, type: 'lead' }).catch(console.error);

    res.json({ success: true, message: 'Lead saved. We will contact you within 24 hours.' });
  } catch (err) {
    console.error('[onboarding] Lead error:', err.message);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// ── Owner notification (email via Resend) ────────────────────
async function sendOwnerNotification({ owner_name, email, phone, academy_name, type = 'signup' }) {
  const ownerEmail = process.env.OWNER_EMAIL;
  const resendKey  = process.env.RESEND_API_KEY;
  if (!ownerEmail || !resendKey) return;

  const subject = type === 'signup'
    ? `🎉 New Academy Signup: ${academy_name}`
    : `📋 New Lead: ${academy_name}`;

  const html = type === 'signup'
    ? `<h2>New Academy Created!</h2>
       <p><b>Academy:</b> ${academy_name}</p>
       <p><b>Owner:</b> ${owner_name}</p>
       <p><b>Phone:</b> ${phone}</p>
       <p><b>Email:</b> ${email}</p>
       <p>Academy is live ✅ — 7 day trial started.</p>`
    : `<h2>New Lead Received!</h2>
       <p><b>Name:</b> ${owner_name}</p>
       <p><b>Phone:</b> ${phone}</p>
       <p><b>Academy:</b> ${academy_name}</p>
       <p>Follow up within 24 hours.</p>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'Exponent Platform <noreply@yourdomain.com>',
      to:      [ownerEmail],
      subject,
      html,
    }),
  });

  console.log(`[onboarding] Owner alert sent to ${ownerEmail}`);
}

module.exports = router;
