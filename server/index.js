// ============================================================
// EXPONENT PLATFORM - Server Entry Point
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

// Allow requests from Vercel frontend and localhost
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    // Allow any vercel.app subdomain and render.com
    if (!origin || allowed.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now — tighten later
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

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

// ---- Exponent platform routes ----
const platformAuthRoutes  = require('./routes/platform-auth');
const platformRoutes      = require('./routes/platform');
const academyConfigRoutes = require('./routes/academy-config');
const onboardingRoutes    = require('./routes/onboarding');  // ← NEW

// Register existing acadfee routes
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

// Register Exponent platform routes
app.use('/platform/auth',    platformAuthRoutes);
app.use('/platform',         platformRoutes);
app.use('/api/academy',      academyConfigRoutes);
app.use('/api/onboarding',   onboardingRoutes);  // ← NEW — handles /api/onboarding/signup and /api/onboarding/lead

app.get('/', (_, res) => res.json({ status: 'Exponent + AcadFee API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
