# Database Migrations

Run these in order on your PostgreSQL database.

## Order

```
001_multi_tenant.sql   <- Run FIRST
002_platform_auth.sql  <- Run SECOND
```

## How to run

### Option A - psql command line
```bash
psql -U your_db_user -d your_db_name -f server/migrations/001_multi_tenant.sql
psql -U your_db_user -d your_db_name -f server/migrations/002_platform_auth.sql
```

### Option B - Render Dashboard
1. Go to your Render PostgreSQL service
2. Open the **Shell** tab
3. Connect and paste the SQL contents
4. Execute

## Verification

After running 001, confirm success:
```sql
SELECT id, name, slug FROM academies;
-- Expected: 1 | Nishchay Academy | nishchay

SELECT COUNT(*) FROM students WHERE academy_id = 1;
-- Expected: your existing student count (unchanged)
```

## Before running on production

1. Take a backup first:
```bash
pg_dump -U your_user your_db > backup_before_migration.sql
```
2. Migration is safe - only ADDS columns and tables, never deletes data
3. If it fails midway, re-running is safe (uses IF NOT EXISTS + ON CONFLICT)
