// ============================================================
// EXPONENT PLATFORM - Middleware
// Security: rate limiting, JWT guard, auth, role checks
// ============================================================

const jwt = require('jsonwebtoken');
const db  = require('./db');

// ── Rate Limiter (pure in-memory, no extra packages) ────────
// Tracks IP → { count, resetAt }
const rateLimitStore = new Map();

function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = {}) {
  return (req, res, next) => {
    const ip  = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const rec = rateLimitStore.get(ip);

    if (!rec || now > rec.resetAt) {
      // Fresh window
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    rec.count++;
    if (rec.count > max) {
      res.setHeader('Retry-After', Math.ceil((rec.resetAt - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// Strict limiter for login/signup — 10 attempts per 15 minutes per IP
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts. Please try again in 15 minutes.',
});

// General limiter — 200 req per 15 minutes per IP
const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests. Please slow down.',
});

// Clean up old entries every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateLimitStore.entries()) {
    if (now > rec.resetAt) rateLimitStore.delete(ip);
  }
}, 10 * 60 * 1000);

// ── JWT Secret Guard ────────────────────────────────────────
// Crash on startup if JWT_SECRET is not set — never fall back to "secret"
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set!');
  console.error('Set it in Render → Environment before running the server.');
  process.exit(1);
}

// ── Academy user authentication ─────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    req.academyId = decoded.academy_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── Platform owner authentication ───────────────────────────
const authenticatePlatformOwner = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'platform_owner') {
      return res.status(403).json({ error: 'Access denied. Platform owner only.' });
    }
    req.platformAdmin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ── Role-based authorization ─────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// ── Student self-access guard ────────────────────────────────
// Ensures a student can only access their own data
const studentSelfOnly = (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  // Admins and branch managers can access any student
  if (user.role === 'super_admin' || user.role === 'branch_manager') return next();
  // Students can only access their own ID
  const requestedId = parseInt(req.params.id || req.query.student_id);
  if (user.role === 'student' && requestedId && requestedId !== user.id) {
    return res.status(403).json({ error: 'Access denied. You can only view your own data.' });
  }
  next();
};

// ── Subdomain-based academy resolution ───────────────────────
const resolveAcademyFromSubdomain = async (req, res, next) => {
  try {
    const host  = req.hostname || '';
    const parts = host.split('.');
    if (parts.length >= 3) {
      const slug = parts[0];
      if (slug && slug !== 'www' && slug !== 'app' && slug !== 'platform') {
        req.academySlug = slug;
      }
    }
    next();
  } catch (err) {
    next();
  }
};

// ── Branch filter (existing acadfee pattern) ─────────────────
const branchFilter = (req, res, next) => {
  if (req.user?.role === 'branch_manager') {
    req.branchId = req.user.branch_id;
  } else {
    req.branchId = null;
  }
  next();
};

module.exports = {
  authenticate,
  authenticatePlatformOwner,
  authorize,
  studentSelfOnly,
  resolveAcademyFromSubdomain,
  branchFilter,
  authRateLimit,
  generalRateLimit,
};
