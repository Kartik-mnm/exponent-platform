const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware");

// Multi-tenant safe: all queries scoped to req.academyId

// List tests
router.get("/", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const bid = req.user.role === "branch_manager" ? req.user.branch_id : null;
    const cond   = bid ? "AND t.branch_id=$2" : "";
    const params = bid ? [req.academyId, bid] : [req.academyId];
    const { rows } = await db.query(
      `SELECT t.*, b.name AS batch_name, br.name AS branch_name, COUNT(tr.id) AS result_count
       FROM tests t
       LEFT JOIN batches b ON b.id = t.batch_id
       JOIN branches br ON br.id = t.branch_id
       LEFT JOIN test_results tr ON tr.test_id = t.id
       WHERE t.academy_id=$1 ${cond}
       GROUP BY t.id, b.name, br.name ORDER BY t.test_date DESC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Create test
router.post("/", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { branch_id, batch_id, name, subject, total_marks, test_date } = req.body;
    if (!name || !subject || !total_marks || !test_date)
      return res.status(400).json({ error: "name, subject, total_marks and test_date are required" });
    const bid = req.user.role === "super_admin" ? branch_id : req.user.branch_id;
    const { rows } = await db.query(
      `INSERT INTO tests (branch_id, batch_id, name, subject, total_marks, test_date, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [bid, batch_id, name, subject, total_marks, test_date, req.academyId]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to create test" });
  }
});

// Delete test
router.delete("/:id", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    const { rowCount } = await db.query(
      "DELETE FROM tests WHERE id=$1 AND academy_id=$2", [req.params.id, req.academyId]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Test not found" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

// Get results for a test
router.get("/:id/results", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  try {
    // Verify test belongs to this academy first
    const { rows: testRows } = await db.query(
      "SELECT id FROM tests WHERE id=$1 AND academy_id=$2", [req.params.id, req.academyId]
    );
    if (!testRows[0]) return res.status(404).json({ error: "Test not found" });
    const { rows } = await db.query(
      `SELECT tr.*, s.name AS student_name, s.phone,
              ROUND((tr.marks / t.total_marks::numeric) * 100, 1) AS percentage
       FROM test_results tr
       JOIN students s ON s.id = tr.student_id
       JOIN tests t ON t.id = tr.test_id
       WHERE tr.test_id=$1 ORDER BY tr.marks DESC`, [req.params.id]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Save bulk results
router.post("/:id/results", authenticate, async (req, res) => {
  if (req.user.role === "student") return res.status(403).json({ error: "Access denied" });
  const { results } = req.body;
  if (!Array.isArray(results) || results.length === 0)
    return res.status(400).json({ error: "results array is required" });
  // Verify test belongs to this academy
  const { rows: testRows } = await db.query(
    "SELECT id FROM tests WHERE id=$1 AND academy_id=$2", [req.params.id, req.academyId]
  );
  if (!testRows[0]) return res.status(404).json({ error: "Test not found" });

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    let saved = 0;
    for (const r of results) {
      await client.query(
        `INSERT INTO test_results (test_id, student_id, marks)
         VALUES ($1,$2,$3)
         ON CONFLICT (test_id, student_id) DO UPDATE SET marks=$3`,
        [req.params.id, r.student_id, r.marks]
      );
      saved++;
    }
    await client.query("COMMIT");
    res.json({ saved });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to save results" });
  } finally { client.release(); }
});

// Student performance summary
router.get("/student/:studentId", authenticate, async (req, res) => {
  if (req.user.role === "student" && req.user.id !== parseInt(req.params.studentId))
    return res.status(403).json({ error: "Access denied" });
  try {
    const { rows } = await db.query(
      `SELECT t.name AS test_name, t.subject, t.total_marks, t.test_date,
              tr.marks, ROUND((tr.marks / t.total_marks::numeric) * 100, 1) AS percentage
       FROM test_results tr
       JOIN tests t ON t.id = tr.test_id
       WHERE tr.student_id=$1 AND t.academy_id=$2 ORDER BY t.test_date DESC`,
      [req.params.studentId, req.academyId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch performance" });
  }
});

module.exports = router;
