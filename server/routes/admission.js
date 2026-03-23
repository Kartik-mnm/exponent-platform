const router   = require("express").Router();
const db       = require("../db");
const { authenticate } = require("../middleware");
const rateLimit = require("express-rate-limit");

// Multi-tenant safe: all queries scoped to req.academyId
// Public routes (enquiry form) resolve academy from slug query param

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: "Too many enquiries submitted. Please try again after 15 minutes." },
});

// Public: Submit admission enquiry
// Requires ?slug=nishchay so we know which academy this is for
router.post("/enquiry", enquiryLimiter, async (req, res) => {
  const { name, phone, parent_phone, email, batch_id, address, branch_id, extra, slug } = req.body;
  if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
  if (!slug)           return res.status(400).json({ error: "Academy slug is required" });
  try {
    // Resolve academy from slug
    const { rows: acadRows } = await db.query(
      "SELECT id FROM academies WHERE slug=$1 AND is_active=true", [slug]
    );
    if (!acadRows[0]) return res.status(404).json({ error: "Academy not found" });
    const academyId = acadRows[0].id;

    let photoUrl = null;
    if (extra) {
      try {
        const ex = typeof extra === "string" ? JSON.parse(extra) : extra;
        photoUrl = ex.photo_url || null;
      } catch {}
    }
    const { rows } = await db.query(
      `INSERT INTO admission_enquiries
       (name, phone, parent_phone, email, batch_id, address, branch_id, extra, photo_url, status, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',$10) RETURNING *`,
      [name, phone, parent_phone||null, email||null, batch_id||null, address||null, branch_id||null,
       typeof extra === "string" ? extra : JSON.stringify(extra||{}), photoUrl, academyId]
    );
    res.json({ success: true, enquiry_id: rows[0].id });
  } catch (e) {
    console.error("Admission enquiry error:", e.message);
    res.status(500).json({ error: "Failed to submit enquiry" });
  }
});

// Public: form data — scoped to academy by slug
router.get("/form-data", async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: "slug is required" });
  try {
    const { rows: acadRows } = await db.query(
      "SELECT id FROM academies WHERE slug=$1 AND is_active=true", [slug]
    );
    if (!acadRows[0]) return res.status(404).json({ error: "Academy not found" });
    const academyId = acadRows[0].id;
    const [branches, batches] = await Promise.all([
      db.query("SELECT id, name FROM branches WHERE academy_id=$1 ORDER BY name", [academyId]),
      db.query("SELECT id, name, branch_id, fee_monthly FROM batches WHERE academy_id=$1 ORDER BY name", [academyId]),
    ]);
    res.json({ branches: branches.rows, batches: batches.rows });
  } catch (e) {
    res.status(500).json({ error: "Failed to load form data" });
  }
});

// Admin: list enquiries (authenticated, scoped to academy)
router.get("/enquiries", authenticate, async (req, res) => {
  try {
    const bid = req.user.role === "branch_manager" ? req.user.branch_id : null;
    const cond   = bid ? "AND ae.branch_id=$2" : "";
    const params = bid ? [req.academyId, bid] : [req.academyId];
    const { rows } = await db.query(
      `SELECT ae.*, b.name AS batch_name, br.name AS branch_name
       FROM admission_enquiries ae
       LEFT JOIN batches b ON b.id = ae.batch_id
       LEFT JOIN branches br ON br.id = ae.branch_id
       WHERE ae.academy_id=$1 ${cond}
       ORDER BY ae.created_at DESC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// Admin: Approve enquiry → create student
router.post("/enquiries/:id/approve", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT * FROM admission_enquiries WHERE id=$1 AND academy_id=$2",
      [req.params.id, req.academyId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Enquiry not found" });
    const e = rows[0];

    let photoUrl = e.photo_url || null;
    if (!photoUrl && e.extra) {
      try {
        const ex = typeof e.extra === "string" ? JSON.parse(e.extra) : e.extra;
        photoUrl = ex.photo_url || null;
      } catch {}
    }

    const { rows: stuRows } = await db.query(
      `INSERT INTO students
       (branch_id, batch_id, name, phone, parent_phone, email, address, admission_date, status, photo_url, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE,'active',$8,$9) RETURNING *`,
      [e.branch_id, e.batch_id, e.name, e.phone, e.parent_phone, e.email, e.address, photoUrl, req.academyId]
    );
    await db.query(
      "UPDATE admission_enquiries SET status='approved', student_id=$1 WHERE id=$2",
      [stuRows[0].id, req.params.id]
    );
    res.json({ success: true, student: stuRows[0] });
  } catch (e) {
    console.error("Approve error:", e.message);
    res.status(500).json({ error: "Failed to approve enquiry" });
  }
});

// Admin: Reject
router.patch("/enquiries/:id/reject", authenticate, async (req, res) => {
  try {
    await db.query(
      "UPDATE admission_enquiries SET status='rejected' WHERE id=$1 AND academy_id=$2",
      [req.params.id, req.academyId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to reject enquiry" });
  }
});

module.exports = router;
