// ============================================================
// EXPONENT PLATFORM - Migration Runner
// Run this with: node run-migration.js
// ============================================================

const { Client } = require('pg');

const DB_URL = 'postgresql://acadfee_user:My2hhs4Hfi8srlAj5mMGxJyZpglaPmUL@dpg-d6pbmqhr0fns73e91pbg-a.oregon-postgres.render.com/acadfee';

const client = new Client({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  await client.connect();
  console.log('✅ Connected to database!');

  // STEP 1: Create academies table
  await client.query(`
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
      features       JSONB DEFAULT '{"attendance":true,"tests":true,"expenses":true,"admissions":true,"notifications":true,"id_cards":true,"qr_scanner":true,"reports":true}'::jsonb,
      plan           TEXT DEFAULT 'basic',
      max_students   INT  DEFAULT 200,
      max_branches   INT  DEFAULT 3,
      is_active      BOOLEAN DEFAULT true,
      trial_ends_at  TIMESTAMPTZ,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ academies table ready');

  // STEP 2: Create platform_admins table
  await client.query(`
    CREATE TABLE IF NOT EXISTS platform_admins (
      id            SERIAL PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      is_active     BOOLEAN DEFAULT true,
      last_login_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ platform_admins table ready');

  // STEP 3: Insert Nishchay Academy as id = 1
  await client.query(`
    INSERT INTO academies (id, name, slug, primary_color, accent_color, city, state, plan, max_students, max_branches, is_active)
    VALUES (1, 'Nishchay Academy', 'nishchay', '2563EB', '38BDF8', 'Nagpur', 'Maharashtra', 'pro', 500, 10, true)
    ON CONFLICT (id) DO NOTHING
  `);
  await client.query(`SELECT setval('academies_id_seq', 1, true)`);
  console.log('✅ Nishchay Academy inserted as academy_id = 1');

  // STEP 4: Add academy_id to all tables
  const tables = ['branches','students','users','batches','fee_records','payments','attendance','expenses','tests'];
  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS academy_id INT REFERENCES academies(id)`);
      console.log('✅ Added academy_id to ' + table);
    } catch (e) {
      console.log('⚠️  Skipped ' + table + ' (may not exist): ' + e.message);
    }
  }

  // STEP 5: Stamp all existing rows with academy_id = 1
  for (const table of tables) {
    try {
      const result = await client.query(`UPDATE ${table} SET academy_id = 1 WHERE academy_id IS NULL`);
      console.log('✅ Stamped ' + table + ' — ' + result.rowCount + ' rows updated');
    } catch (e) {
      console.log('⚠️  Skipped stamping ' + table + ': ' + e.message);
    }
  }

  // STEP 6: Insert platform admin login
  await client.query(`
    INSERT INTO platform_admins (email, password_hash, name)
    VALUES ('kartik@exponent.app', '$2a$10$It6o9sFRVW.wcl0j9nWiIew5xGh9pY9ThYeW3EFO6DPqqF62YEScW', 'Kartik')
    ON CONFLICT (email) DO NOTHING
  `);
  console.log('✅ Platform admin account created');

  // STEP 7: Verify everything
  console.log('\n========== VERIFICATION ==========');
  const academies = await client.query('SELECT id, name, slug FROM academies');
  console.log('Academies:', JSON.stringify(academies.rows));

  const students = await client.query('SELECT COUNT(*) FROM students WHERE academy_id = 1');
  console.log('Students with academy_id=1:', students.rows[0].count);

  const branches = await client.query('SELECT COUNT(*) FROM branches WHERE academy_id = 1');
  console.log('Branches with academy_id=1:', branches.rows[0].count);

  const admins = await client.query('SELECT id, name, email FROM platform_admins');
  console.log('Platform admins:', JSON.stringify(admins.rows));

  console.log('===================================');
  console.log('🎉 Migration complete! Phase 1 done.');

  await client.end();
}

runMigration().catch(async (e) => {
  console.error('❌ Migration failed:', e.message);
  await client.end();
  process.exit(1);
});
