// ============================================================
// Landing Page Settings Route
// GET  /api/public-settings        — public, no auth
// GET  /platform/settings/landing  — platform owner auth
// PUT  /platform/settings/landing  — platform owner auth
// ============================================================
const router = require('express').Router();
const db     = require('../db');
const { authenticatePlatformOwner } = require('../middleware');

// ── Auto-create table if not exists ─────────────────────────
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

// ── Default settings ─────────────────────────────────────────
const DEFAULTS = {
  landing_stats: JSON.stringify({
    academies: { v: "2,400", s: "+" },
    students:  { v: "4.8",   s: "L" },
    fees:      { v: "₹120",  s: "Cr" }
  }),
  landing_pricing: JSON.stringify([
    {
      name: "Starter", price: 999, popular: false,
      desc: "For small institutes getting started.",
      features: ["Up to 100 students", "1 branch & 2 staff members", "Basic fee tracking", "Email support"]
    },
    {
      name: "Growth", price: 2499, popular: true,
      desc: "For established institutes expanding rapidly.",
      features: ["Unlimited students", "Multiple branches & admin roles", "Complete fee & attendance CRM", "Parent SMS/App notifications", "Priority WhatsApp support"]
    }
  ])
};

async function getSetting(key) {
  const { rows } = await db.query('SELECT value FROM platform_settings WHERE key=$1', [key]);
  if (rows[0]) return JSON.parse(rows[0].value);
  return JSON.parse(DEFAULTS[key]);
}

async function setSetting(key, value) {
  await db.query(`
    INSERT INTO platform_settings (key, value) VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `, [key, JSON.stringify(value)]);
}

// ── GET /api/public-settings — public, no auth ───────────────
router.get('/public-settings', async (req, res) => {
  try {
    await ensureTable();
    const [stats, pricing] = await Promise.all([
      getSetting('landing_stats'),
      getSetting('landing_pricing')
    ]);
    res.json({ stats, pricing });
  } catch (err) {
    console.error('[public-settings] Error:', err.message);
    // Return defaults on error so the landing page always works
    res.json({
      stats:   JSON.parse(DEFAULTS.landing_stats),
      pricing: JSON.parse(DEFAULTS.landing_pricing)
    });
  }
});

// ── GET /platform/settings/landing — read current settings ───
router.get('/landing', authenticatePlatformOwner, async (req, res) => {
  try {
    await ensureTable();
    const [stats, pricing] = await Promise.all([
      getSetting('landing_stats'),
      getSetting('landing_pricing')
    ]);
    res.json({ stats, pricing });
  } catch (err) {
    console.error('[platform-settings] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// ── PUT /platform/settings/landing — save settings ───────────
router.put('/landing', authenticatePlatformOwner, async (req, res) => {
  try {
    await ensureTable();
    const { stats, pricing } = req.body;

    if (stats) {
      // Validate shape
      if (!stats.academies || !stats.students || !stats.fees) {
        return res.status(400).json({ error: 'stats must include academies, students, fees' });
      }
      await setSetting('landing_stats', stats);
    }

    if (pricing) {
      if (!Array.isArray(pricing)) {
        return res.status(400).json({ error: 'pricing must be an array' });
      }
      await setSetting('landing_pricing', pricing);
    }

    res.json({ success: true, message: 'Landing page settings saved!' });
  } catch (err) {
    console.error('[platform-settings] Save error:', err.message);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

module.exports = router;
