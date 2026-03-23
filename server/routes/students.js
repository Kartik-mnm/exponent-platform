const router = require("express").Router();
const db = require("../db");
const { authenticate, authorize } = require("../middleware");

// Multi-tenant safe: all queries scoped to req.academyId

const BRANCH_PREFIX = {
  "favinagar": "RN", "ravinagar": "RN",
  "dattawadi": "DW", "dattwadi":  "DW",
  "dabha":     "DB", "dhabha":    "DB",
};
function getRollPrefix(branchName) {
  if (!branchName) return "NA";
  const lower = branchName.toLowerCase();
  for (const [key, prefix] of Object.entries(BRANCH_PREFIX)) {
    if (lower.includes(key)) return prefix;
  }
  return branchName.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase() || "NA";
}

// Backfill roll numbers
router.post("/backfill-roll-numbers", authenticate, authorize("super_admin"), async (req, res) => {
  try {
    const { rows: students } = await db.query(
      `SELECT s.id, s.branch_id, br.name AS branch_name
       FROM students s JOIN branches br ON br.id = s.branch_id
       WHERE s.roll_no IS NULL AND s.academy_id=$1
       ORDER BY s.branch_id, s.id ASC`, [req.academyId]
    );
    const { rows: existing } = await db.query(
      `SELECT branch_id, MAX(CAST(REGEXP_REPLACE(roll_no, '[^0-9]', '', 'g') AS INTEGER)) AS max_serial
       FROM students WHERE roll_no IS NOT NULL AND academy_id=$1 GROUP BY branch_id`, [req.academyId]
    );
    const maxSerial = {};
    existing.forEach((r) => { maxSerial[r.branch_id] = r.max_serial || 0; });

    let updated = 0;
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");
      for (const s of students) {
        const prefix = getRollPrefix(s.branch_name);
        const serial = (maxSerial[s.branch_id] || 0) + 1;
        maxSerial[s.branch_id] = serial;
        const rollNo = `${prefix}${String(serial).padStart(4, "0")}`;
        await client.query(`UPDATE students SET roll_no=$1 WHERE id=$2 AND roll_no IS NULL`, [rollNo, s.id]);
        updated++;
      }
      await client.query("COMMIT");
      res.json({ updated, message: `Roll numbers assigned to ${updated} students` });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally { client.release(); }
  } catch (e) {
    res.status(500).json({ error: "Failed to backfill roll numbers: " + e.message });
  }
});

// List students
router.get("/", authenticate, async (req, res) => {
  try {
    if (req.user.role === "student") {
      const { rows } = await db.query(
        `SELECT s.*, b.name AS batch_name, br.name AS branch_name
         FROM students s
         LEFT JOIN batches b ON b.id = s.batch_id
         LEFT JOIN branches br ON br.id = s.branch_id
         WHERE s.id=$1 AND s.academy_id=$2`, [req.user.id, req.academyId]
      );
      return res.json(rows);
    }
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    let conditions = [`s.academy_id=$1`]; let params = [req.academyId]; let idx = 2;
    if (req.user.role === "branch_manager") { conditions.push(`s.branch_id=$${idx++}`); params.push(req.user.branch_id); }
    if (req.query.branch_id && req.user.role === "super_admin") { conditions.push(`s.branch_id=$${idx++}`); params.push(req.query.branch_id); }
    if (req.query.batch_id) { conditions.push(`s.batch_id=$${idx++}`); params.push(req.query.batch_id); }
    if (req.query.status)   { conditions.push(`s.status=$${idx++}`);   params.push(req.query.status); }
    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.phone ILIKE $${idx} OR s.parent_phone ILIKE $${idx} OR s.email ILIKE $${idx} OR s.roll_no ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    const where = "WHERE " + conditions.join(" AND ");
    const { rows: countRows } = await db.query(`SELECT COUNT(*) FROM students s ${where}`, [...params]);
    const total = parseInt(countRows[0].count);
    params.push(limit); params.push(offset);
    const { rows } = await db.query(
      `SELECT s.*, b.name AS batch_name, br.name AS branch_name
       FROM students s
       LEFT JOIN batches b ON b.id = s.batch_id
       LEFT JOIN branches br ON br.id = s.branch_id
       ${where} ORDER BY s.id DESC LIMIT $${idx++} OFFSET $${idx++}`, params
    );
    res.json({ data: rows, page, limit, total, totalPages: Math.ceil(total/limit) });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Get single student
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*, b.name AS batch_name, br.name AS branch_name
       FROM students s
       LEFT JOIN batches b ON b.id = s.batch_id
       LEFT JOIN branches br ON br.id = s.branch_id
       WHERE s.id=$1 AND s.academy_id=$2`, [req.params.id, req.academyId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    if (req.user.role === "student" && rows[0].id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
});

// Create student
router.post("/", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { branch_id, batch_id, name, phone, parent_phone, email, address, dob, gender, admission_date, fee_type, admission_fee, discount, discount_reason, due_day, photo_url } = req.body;
    if (!name || !batch_id) return res.status(400).json({ error: "name and batch_id are required" });
    const bid = req.user.role === "super_admin" ? branch_id : req.user.branch_id;
    const dueDaySafe = Math.min(Math.max(parseInt(due_day) || 10, 1), 28);
    const { rows: brRows } = await db.query("SELECT name FROM branches WHERE id=$1 AND academy_id=$2", [bid, req.academyId]);
    const prefix = getRollPrefix(brRows[0]?.name || "");
    const { rows: maxRows } = await db.query(
      `SELECT MAX(CAST(REGEXP_REPLACE(roll_no, '[^0-9]', '', 'g') AS INTEGER)) AS max_serial
       FROM students WHERE branch_id=$1 AND roll_no IS NOT NULL AND academy_id=$2`, [bid, req.academyId]
    );
    const serial = (maxRows[0]?.max_serial || 0) + 1;
    const rollNo = `${prefix}${String(serial).padStart(4, "0")}`;
    const { rows } = await db.query(
      `INSERT INTO students (branch_id, batch_id, name, phone, parent_phone, email, address, dob, gender, admission_date, fee_type, admission_fee, discount, discount_reason, due_day, photo_url, roll_no, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
      [bid, batch_id, name, phone, parent_phone, email, address, dob, gender, admission_date, fee_type, admission_fee||0, discount||0, discount_reason, dueDaySafe, photo_url||null, rollNo, req.academyId]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

// Update student
router.put("/:id", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { batch_id, name, phone, parent_phone, email, address, dob, gender, fee_type, admission_fee, discount, discount_reason, status, due_day, photo_url } = req.body;
    const dueDaySafe = Math.min(Math.max(parseInt(due_day)||10, 1), 28);
    const { rows } = await db.query(
      `UPDATE students SET batch_id=$1, name=$2, phone=$3, parent_phone=$4, email=$5, address=$6, dob=$7, gender=$8, fee_type=$9, admission_fee=$10, discount=$11, discount_reason=$12, status=$13, due_day=$14, photo_url=$15
       WHERE id=$16 AND academy_id=$17 RETURNING *`,
      [batch_id, name, phone, parent_phone, email, address, dob, gender, fee_type, admission_fee, discount, discount_reason, status, dueDaySafe, photo_url||null, req.params.id, req.academyId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Student not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

// Delete student
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { rowCount } = await db.query(
      "DELETE FROM students WHERE id=$1 AND academy_id=$2", [req.params.id, req.academyId]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
