// ============================================================
// EXPONENT PLATFORM - Server Entry Point (updated index.js)
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ---- Existing acadfee routes (unchanged) ----
const authRoutes       = require('./routes/auth');
const studentRoutes    = require('./routes/students');
const branchRoutes     = require('./routes/branches');
const batchRoutes      = require('./routes/batches');
const feeRoutes        = require('./routes/fees');
const paymentRoutes    = require('./routes/payments');
const attendanceRoutes = require('./routes/attendance');
const expenseRoutes    = require('./routes/expenses');
const reportRoutes     = require('./routes/reports');
const testRoutes       = require('./routes/tests');
const qrRoutes         = require('./routes/qrscan');
const uploadRoutes     = require('./routes/upload');
const admissionRoutes  = require('./routes/admission');
const workingDayRoutes = require('./routes/working-days');

// ---- NEW: Exponent platform routes ----
const platformAuthRoutes  = require('./routes/platform-auth');
const platformRoutes      = require('./routes/platform');
const academyConfigRoutes = require('./routes/academy-config');

// Register existing routes
app.use('/api/auth',         authRoutes);
app.use('/api/students',     studentRoutes);
app.use('/api/branches',     branchRoutes);
app.use('/api/batches',      batchRoutes);
app.use('/api/fees',         feeRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/attendance',   attendanceRoutes);
app.use('/api/expenses',     expenseRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/tests',        testRoutes);
app.use('/api/qrscan',       qrRoutes);
app.use('/api/upload',       uploadRoutes);
app.use('/api/admission',    admissionRoutes);
app.use('/api/working-days', workingDayRoutes);

// Register new Exponent routes
app.use('/platform/auth',    platformAuthRoutes);  // POST /platform/auth/login
app.use('/platform',         platformRoutes);       // GET/POST /platform/academies
app.use('/api/academy',      academyConfigRoutes);  // GET /api/academy/config?slug=nishchay

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Exponent server running on port ${PORT}`);
});

module.exports = app;
