// ============================================================
// Working Days Route
// GET  /api/working-days        - list working days for branch
// POST /api/working-days        - set a working/holiday day
// DELETE /api/working-days/:date - reset a day to default (working)
// ============================================================

const router = require('express').Router();
const db     = require('../db');
const { authenticate, authorize } = require('../middleware');

// ── GET /api/working-days?branch_id=&month=&year= ────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    const branchId = req.user.role === 'branch_manager'
      ? req.user.branch_id
      : req.query.branch_id;

    if (!branchId) return res.status(400).json({ error: 'branch_id is required' });

    let query = `SELECT * FROM working_days WHERE branch_id = $1`;
    const params = [branchId];

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`;
      params.push(month, year);
    }

    query += ` ORDER BY date`;

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[working-days] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch working days' });
  }
});

// ── POST /api/working-days ───────────────────────────────────
// Body: { branch_id, date, is_working, note }
router.post('/', authenticate, authorize('super_admin', 'branch_manager'), async (req, res) => {
  try {
    const { date, is_working, note } = req.body;
    const branchId = req.user.role === 'branch_manager'
      ? req.user.branch_id
      : req.body.branch_id;

    if (!branchId || !date) {
      return res.status(400).json({ error: 'branch_id and date are required' });
    }

    const { rows } = await db.query(
      `INSERT INTO working_days (branch_id, date, is_working, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (branch_id, date)
       DO UPDATE SET is_working = EXCLUDED.is_working, note = EXCLUDED.note
       RETURNING *`,
      [branchId, date, is_working !== false, note || null]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('[working-days] POST error:', err.message);
    res.status(500).json({ error: 'Failed to update working day' });
  }
});

// ── DELETE /api/working-days/:date ───────────────────────────
router.delete('/:date', authenticate, authorize('super_admin', 'branch_manager'), async (req, res) => {
  try {
    const branchId = req.user.role === 'branch_manager'
      ? req.user.branch_id
      : req.query.branch_id;

    await db.query(
      `DELETE FROM working_days WHERE branch_id = $1 AND date = $2`,
      [branchId, req.params.date]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('[working-days] DELETE error:', err.message);
    res.status(500).json({ error: 'Failed to delete working day' });
  }
});

module.exports = router;
