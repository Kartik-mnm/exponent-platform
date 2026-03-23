const router = require("express").Router();
const db = require("../db");
const { authenticate } = require("../middleware");

// Multi-tenant safe: all queries scoped to req.academyId

const CATEGORIES = ["Rent", "Salary", "Utilities", "Stationery", "Marketing", "Maintenance", "Other"];
router.get("/categories", authenticate, (_, res) => res.json(CATEGORIES));

// List expenses
router.get("/", authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    let cond = [`e.academy_id=$1`]; let params = [req.academyId]; let i = 2;
    if (req.user.role === "branch_manager") { cond.push(`e.branch_id=$${i++}`); params.push(req.user.branch_id); }
    if (month) { cond.push(`EXTRACT(MONTH FROM e.expense_date)=$${i++}`); params.push(month); }
    if (year)  { cond.push(`EXTRACT(YEAR FROM e.expense_date)=$${i++}`);  params.push(year); }
    const where = "WHERE " + cond.join(" AND ");
    const { rows } = await db.query(
      `SELECT e.*, br.name AS branch_name, u.name AS added_by_name
       FROM expenses e
       JOIN branches br ON br.id = e.branch_id
       LEFT JOIN users u ON u.id = e.added_by
       ${where} ORDER BY e.expense_date DESC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Add expense
router.post("/", authenticate, async (req, res) => {
  try {
    const { branch_id, title, amount, category, expense_date, notes } = req.body;
    if (!title || !amount || !expense_date)
      return res.status(400).json({ error: "title, amount and expense_date are required" });
    if (!CATEGORIES.includes(category))
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(", ")}` });
    const bid = req.user.role === "super_admin" ? branch_id : req.user.branch_id;
    const { rows } = await db.query(
      `INSERT INTO expenses (branch_id, title, amount, category, expense_date, notes, added_by, academy_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [bid, title, amount, category, expense_date, notes, req.user.id, req.academyId]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});

// Delete expense
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT branch_id FROM expenses WHERE id=$1 AND academy_id=$2",
      [req.params.id, req.academyId]
    );
    if (!rows[0]) return res.status(404).json({ error: "Expense not found" });
    if (req.user.role !== "super_admin" && rows[0].branch_id !== req.user.branch_id)
      return res.status(403).json({ error: "Access denied" });
    await db.query("DELETE FROM expenses WHERE id=$1 AND academy_id=$2", [req.params.id, req.academyId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// Summary by category
router.get("/summary", authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    let cond = [`academy_id=$1`]; let params = [req.academyId]; let i = 2;
    if (req.user.role === "branch_manager") { cond.push(`branch_id=$${i++}`); params.push(req.user.branch_id); }
    if (month) { cond.push(`EXTRACT(MONTH FROM expense_date)=$${i++}`); params.push(month); }
    if (year)  { cond.push(`EXTRACT(YEAR FROM expense_date)=$${i++}`);  params.push(year); }
    const where = "WHERE " + cond.join(" AND ");
    const { rows } = await db.query(
      `SELECT category, COALESCE(SUM(amount),0) AS total
       FROM expenses ${where} GROUP BY category ORDER BY total DESC`, params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

module.exports = router;
