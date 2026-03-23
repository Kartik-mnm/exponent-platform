// ============================================================
// EXPONENT PLATFORM - Updated Middleware
//
// Two additions vs original acadfee middleware:
// 1. authenticatePlatformOwner - for /platform/* routes only
// 2. resolveAcademyFromSubdomain - reads slug from hostname
// ============================================================

const jwt = require('jsonwebtoken');
const db  = require('./db');

// Original academy user authentication (unchanged)
// Verifies JWT and injects req.user + req.academyId
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.academyId = decoded.academy_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Platform owner authentication
// Only allows role = 'platform_owner'
// Protects all /platform/* routes
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

// Role-based authorization (unchanged)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Subdomain-based academy resolution (NEW for Phase 8)
// nishchay.exponent.app -> sets req.academySlug = 'nishchay'
const resolveAcademyFromSubdomain = async (req, res, next) => {
  try {
    const host = req.hostname || '';
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

module.exports = {
  authenticate,
  authenticatePlatformOwner,
  authorize,
  resolveAcademyFromSubdomain
};
