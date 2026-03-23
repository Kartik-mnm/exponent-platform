-- ============================================================
-- EXPONENT PLATFORM
-- Migration 002: Platform Auth Setup
--
-- Creates your platform owner login account.
-- Run AFTER 001_multi_tenant.sql
-- ============================================================

-- IMPORTANT: Replace 'REPLACE_WITH_BCRYPT_HASH' below!
-- Generate hash with Node.js:
--   node -e "const b=require('bcrypt'); b.hash('YOUR_PASSWORD',10).then(console.log)"

INSERT INTO platform_admins (email, password_hash, name)
VALUES (
  'kartik@exponent.app',
  'REPLACE_WITH_BCRYPT_HASH',
  'Kartik'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Migration 002 complete.
-- ============================================================
