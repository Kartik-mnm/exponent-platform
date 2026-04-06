// ============================================================
// EXPONENT PLATFORM - Server Entry Point
// Security: rate limiting applied globally + on auth routes
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else if (origin.endsWith('.exponentgrow.in')) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked: ${origin}`);
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));

// ── Security headers ─────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// ── Rate limiting (imported from middleware) ──────────────────
const { generalRateLimit } = require('./middleware');
app.use(generalRateLimit); // applies to ALL routes

// ── Routes ───────────────────────────────────────────────────
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

const platformAuthRoutes  = require('./routes/platform-auth');
const platformRoutes      = require('./routes/platform');
const academyConfigRoutes = require('./routes/academy-config');
const onboardingRoutes    = require('./routes/onboarding');

// Existing acadfee routes
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

// Exponent platform routes
app.use('/platform/auth',    platformAuthRoutes); // has own authRateLimit inside
app.use('/platform',         platformRoutes);
app.use('/api/academy',      academyConfigRoutes);
app.use('/api/onboarding',   onboardingRoutes);   // has own authRateLimit inside

app.get('/', (_, res) => res.json({ status: 'Exponent + AcadFee API running ✅' }));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
