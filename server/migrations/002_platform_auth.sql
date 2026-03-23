-- ============================================================
-- EXPONENT PLATFORM
-- Migration 002: Platform Auth Setup
--
-- Creates your platform owner login account.
-- Run AFTER 001_multi_tenant.sql
-- ============================================================

INSERT INTO platform_admins (email, password_hash, name)
VALUES (
  'kartik@exponent.app',
  '$2a$10$It6o9sFRVW.wcl0j9nWiIew5xGh9pY9ThYeW3EFO6DPqqF62YEScW',
  'Kartik'
) ON CONFLICT (email) DO NOTHING;

-- Login credentials for Exponent Platform:
-- Email:    kartik@exponent.app
-- Password: MyPassword123

-- ============================================================
-- Migration 002 complete.
-- ============================================================
