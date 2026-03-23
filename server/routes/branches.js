const router = require("express").Router();
const db = require("../db");
const { authenticate, authorize } = require("../middleware");

// Multi-tenant safe: all queries filter by req.academyId (injected from JWT)

router.get("/", authenticate, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM branches WHERE academy_id=$1 ORDER BY id",
    [req.academyId]
  );
  res.json(rows);
});

router.post("/", authenticate, authorize("super_admin"), async (req, res) => {
  const { name, address, phone } = req.body;
  const { rows } = await db.query(
    "INSERT INTO branches (name, address, phone, academy_id) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, address, phone, req.academyId]
  );
  res.json(rows[0]);
});

module.exports = router;
