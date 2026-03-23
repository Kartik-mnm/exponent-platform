const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware");

// Multi-tenant safe: all queries scoped to req.academyId

// List fee records
router.get("/", authenticate, async (req, res) => {
  try {
    const { student_id, status } = req.query;
    let conditions = [`fr.academy_id=$1`]; let params = [req.academyId]; let idx = 2;
    if (req.user.role === "student") {
      conditions.push(`fr.student_id=$${idx++}`); params.push(req.user.id);
    } else {
      if (req.user.role === "branch_manager") { conditions.push(`fr.branch_id=$${idx++}`); params.push(req.user.branch_id); }
      if (student_id) { conditions.push(`fr.student_id=$${idx++}`); params.push(student_id); }
      if (status)     { conditions.push(`fr.status=$${idx++}`);     params.push(status); }
    }
    const where = "WHERE " + conditions.join(" AND ");
    const { rows } = await db.query(
      `SELECT fr.*, s.name AS student_name, s.phone, b.name AS batch_name, br.name AS branch_name
       FROM fee_records fr
       JOIN students s ON s.id = fr.student_id
       LEFT JOIN batches b ON b.id = s.batch_id
       JOIN branches br ON br.id = fr.branch_id
       ${where} ORDER BY fr.due_date DESC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch fee records" });
  }
});

// Create fee record
router.post("/", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { student_id, amount_due, due_date, period_label } = req.body;
    if (!student_id || !amount_due || !due_date || !period_label)
      return res.status(400).json({ error: "student_id, amount_due, due_date and period_label are required" });
    const { rows: sRows } = await db.query(
      "SELECT branch_id FROM students WHERE id=$1 AND academy_id=$2", [student_id, req.academyId]
    );
    if (!sRows[0]) return res.status(404).json({ error: "Student not found" });
    const { rows } = await db.query(
      `INSERT INTO fee_records (student_id, branch_id, amount_due, due_date, period_label, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [student_id, sRows[0].branch_id, amount_due, due_date, period_label, req.academyId]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to create fee record" });
  }
});

// Bulk generate monthly fee records
router.post("/generate", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  const { branch_id, month, year } = req.body;
  if (!month || !year) return res.status(400).json({ error: "month and year are required" });
  const bid = req.user.role === "super_admin" ? branch_id : req.user.branch_id;
  const label = new Date(year, month - 1).toLocaleString("en-IN", { month: "long", year: "numeric" });

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: students } = await client.query(
      `SELECT s.*, bt.fee_monthly, bt.fee_quarterly, bt.fee_yearly, bt.fee_course
       FROM students s LEFT JOIN batches bt ON bt.id=s.batch_id
       WHERE s.branch_id=$1 AND s.status='active' AND s.academy_id=$2`, [bid, req.academyId]
    );
    let created = 0;
    for (const s of students) {
      let amt = 0;
      if (s.fee_type === "monthly")        amt = s.fee_monthly || 0;
      else if (s.fee_type === "quarterly") amt = s.fee_quarterly || 0;
      else if (s.fee_type === "yearly")    amt = s.fee_yearly || 0;
      else amt = s.fee_course || 0;
      amt = amt - (amt * (s.discount / 100));
      const dueDate = `${year}-${String(month).padStart(2,"0")}-${String(s.due_day||10).padStart(2,"0")}`;
      const { rows: exist } = await client.query(
        "SELECT id FROM fee_records WHERE student_id=$1 AND period_label=$2 AND academy_id=$3",
        [s.id, label, req.academyId]
      );
      if (exist.length === 0 && amt > 0) {
        await client.query(
          "INSERT INTO fee_records (student_id, branch_id, amount_due, due_date, period_label, academy_id) VALUES ($1,$2,$3,$4,$5,$6)",
          [s.id, bid, amt, dueDate, label, req.academyId]
        );
        created++;
      }
    }
    await client.query("COMMIT");
    res.json({ created, label });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Fee generation failed" });
  } finally { client.release(); }
});

// Mark overdue
router.patch("/mark-overdue", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const today = new Date().toISOString().split("T")[0];
    const { rowCount } = await db.query(
      `UPDATE fee_records SET status='overdue' WHERE status='pending' AND due_date < $1 AND academy_id=$2`,
      [today, req.academyId]
    );
    res.json({ updated: rowCount });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark overdue records" });
  }
});

module.exports = router;
