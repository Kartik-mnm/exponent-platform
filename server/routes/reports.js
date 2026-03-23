const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware");

// Multi-tenant safe: all queries scoped to req.academyId

// Dashboard summary
router.get("/dashboard", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const aid = req.academyId;
    const bid = req.user.role === "branch_manager" ? req.user.branch_id : null;
    const branchCond   = bid ? "AND branch_id=$2" : "";
    const branchParams = bid ? [aid, bid] : [aid];

    const [students, collected, due, overdue, recentPayments] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM students WHERE status='active' AND academy_id=$1 ${branchCond}`, branchParams),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE academy_id=$1 ${branchCond}`, branchParams),
      db.query(`SELECT COALESCE(SUM(amount_due - amount_paid),0) AS total FROM fee_records WHERE status IN ('pending','partial','overdue') AND academy_id=$1 ${branchCond}`, branchParams),
      db.query(`SELECT COUNT(*) FROM fee_records WHERE status='overdue' AND academy_id=$1 ${branchCond}`, branchParams),
      db.query(
        `SELECT p.receipt_no, p.amount, p.paid_on, p.payment_mode,
                s.name AS student_name, br.name AS branch_name
         FROM payments p
         JOIN students s ON s.id=p.student_id
         JOIN branches br ON br.id=p.branch_id
         WHERE p.academy_id=$1 ${bid ? "AND p.branch_id=$2" : ""}
         ORDER BY p.paid_on DESC LIMIT 8`, branchParams
      ),
    ]);

    res.json({
      active_students: parseInt(students.rows[0].count),
      total_collected: parseFloat(collected.rows[0].total),
      total_due:       parseFloat(due.rows[0].total),
      overdue_count:   parseInt(overdue.rows[0].count),
      recent_payments: recentPayments.rows,
    });
  } catch (e) {
    console.error("Dashboard report error:", e.message);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// Collection report by branch
router.get("/by-branch", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { rows } = await db.query(
      `SELECT br.name AS branch,
              COUNT(DISTINCT s.id) AS students,
              COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.branch_id=br.id AND p.academy_id=$1), 0) AS collected,
              COALESCE((SELECT SUM(fr.amount_due - fr.amount_paid) FROM fee_records fr WHERE fr.branch_id=br.id AND fr.academy_id=$1 AND fr.status != 'paid'), 0) AS pending
       FROM branches br
       LEFT JOIN students s ON s.branch_id=br.id AND s.status='active' AND s.academy_id=$1
       WHERE br.academy_id=$1
       GROUP BY br.id, br.name ORDER BY br.id`,
      [req.academyId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load branch report" });
  }
});

// Monthly collection trend
router.get("/monthly-trend", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const bid = req.user.role === "branch_manager" ? req.user.branch_id : null;
    const cond   = bid ? "AND p.branch_id=$2" : "";
    const params = bid ? [req.academyId, bid] : [req.academyId];
    const { rows } = await db.query(
      `SELECT TO_CHAR(p.paid_on,'Mon YYYY') AS month,
              DATE_TRUNC('month', p.paid_on) AS month_sort,
              COALESCE(SUM(p.amount),0) AS collected
       FROM payments p WHERE p.academy_id=$1 ${cond}
       GROUP BY month, month_sort ORDER BY month_sort DESC LIMIT 12`, params
    );
    res.json(rows.reverse());
  } catch (e) {
    res.status(500).json({ error: "Failed to load monthly trend" });
  }
});

// Overdue list
router.get("/overdue", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const bid = req.user.role === "branch_manager" ? req.user.branch_id : null;
    const cond   = bid ? "AND fr.branch_id=$2" : "";
    const params = bid ? [req.academyId, bid] : [req.academyId];
    const { rows } = await db.query(
      `SELECT fr.*, s.name AS student_name, s.phone, s.parent_phone,
              b.name AS batch_name, br.name AS branch_name
       FROM fee_records fr
       JOIN students s ON s.id=fr.student_id
       LEFT JOIN batches b ON b.id=s.batch_id
       JOIN branches br ON br.id=fr.branch_id
       WHERE fr.status='overdue' AND fr.academy_id=$1 ${cond}
       ORDER BY fr.due_date ASC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to load overdue list" });
  }
});

module.exports = router;
