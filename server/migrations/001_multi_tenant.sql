-- ============================================================
-- EXPONENT PLATFORM
-- Migration 001: Multi-Tenancy Foundation
--
-- SAFE TO RUN: Only adds new tables and columns.
-- Existing Nishchay Academy data is preserved and stamped
-- with academy_id = 1. Nothing is deleted.
-- ============================================================

-- ------------------------------------------------------------
-- STEP 1: Create the academies master table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academies (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  logo_url       TEXT,
  tagline        TEXT,
  primary_color  TEXT DEFAULT '2563EB',
  accent_color   TEXT DEFAULT '38BDF8',
  address        TEXT,
  phone          TEXT,
  phone2         TEXT,
  email          TEXT,
  website        TEXT,
  city           TEXT,
  state          TEXT,
  pincode        TEXT,
  features       JSONB DEFAULT '{
    "attendance": true,
    "tests": true,
    "expenses": true,
    "admissions": true,
    "notifications": true,
    "id_cards": true,
    "qr_scanner": true,
    "reports": true
  }'::jsonb,
  plan           TEXT DEFAULT 'basic',
  max_students   INT  DEFAULT 200,
  max_branches   INT  DEFAULT 3,
  is_active      BOOLEAN DEFAULT true,
  trial_ends_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- STEP 2: Create platform_admins table (only you log in here)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- STEP 3: Insert Nishchay Academy as academy_id = 1
-- ------------------------------------------------------------
INSERT INTO academies (
  id, name, slug, primary_color, accent_color,
  city, state, plan, max_students, max_branches, is_active
) VALUES (
  1,
  'Nishchay Academy',
  'nishchay',
  '2563EB',
  '38BDF8',
  'Nagpur',
  'Maharashtra',
  'pro',
  500,
  10,
  true
) ON CONFLICT (id) DO NOTHING;

-- Reset sequence so next academy gets id = 2
SELECT setval('academies_id_seq', 1, true);

-- ------------------------------------------------------------
-- STEP 4: Add academy_id column to every existing table
-- ------------------------------------------------------------
ALTER TABLE branches     ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE students     ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE users        ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE batches      ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE fee_records  ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE payments     ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE attendance   ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE expenses     ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);
ALTER TABLE tests        ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id);

-- ------------------------------------------------------------
-- STEP 5: Stamp ALL existing rows with academy_id = 1
-- Safe: only updates rows where academy_id IS NULL
-- ------------------------------------------------------------
UPDATE branches    SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE students    SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE users       SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE batches     SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE fee_records SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE payments    SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE attendance  SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE expenses    SET academy_id = 1 WHERE academy_id IS NULL;
UPDATE tests       SET academy_id = 1 WHERE academy_id IS NULL;

-- ------------------------------------------------------------
-- STEP 6: Add performance indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_branches_academy    ON branches(academy_id);
CREATE INDEX IF NOT EXISTS idx_students_academy    ON students(academy_id);
CREATE INDEX IF NOT EXISTS idx_users_academy       ON users(academy_id);
CREATE INDEX IF NOT EXISTS idx_batches_academy     ON batches(academy_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_academy ON fee_records(academy_id);
CREATE INDEX IF NOT EXISTS idx_payments_academy    ON payments(academy_id);
CREATE INDEX IF NOT EXISTS idx_attendance_academy  ON attendance(academy_id);
CREATE INDEX IF NOT EXISTS idx_expenses_academy    ON expenses(academy_id);
CREATE INDEX IF NOT EXISTS idx_tests_academy       ON tests(academy_id);
CREATE INDEX IF NOT EXISTS idx_academies_slug      ON academies(slug);

-- ------------------------------------------------------------
-- Verification queries (run these to confirm success)
-- ------------------------------------------------------------
-- SELECT id, name, slug FROM academies;
-- SELECT COUNT(*) FROM students WHERE academy_id = 1;
-- SELECT COUNT(*) FROM branches WHERE academy_id = 1;

-- ============================================================
-- Migration 001 complete.
-- Nishchay Academy = academy_id = 1. All existing data safe.
-- Next: run 002_platform_auth.sql
-- ============================================================
