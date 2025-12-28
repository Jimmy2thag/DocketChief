# DocketChief Database Migration Guide

## Overview

This guide will walk you through applying the DocketChief database schema to your Supabase project.

## Prerequisites

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase CLI installed (optional but recommended)
- [ ] Project credentials (URL and anon key)
- [ ] Backup of any existing data (if applicable)

## Migration Files

This migration includes:

1. **20250109000001_create_docketchief_schema.sql** - Main schema migration
2. **test_schema.sql** - Validation queries
3. **seed_data.sql** - Sample data (optional)
4. **20250109000002_rollback_schema.sql** - Rollback script (emergency use only)

## Method 1: Using Supabase Dashboard (Easiest)

### Step 1: Access SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Apply Migration

1. Open `supabase/migrations/20250109000001_create_docketchief_schema.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click "Run" button

### Step 3: Verify Installation

1. Create a new query
2. Copy contents of `test_schema.sql`
3. Paste and run
4. Check for "TEST PASSED" messages
5. Review the detailed information queries at the bottom

### Step 4: Add Sample Data (Optional)

1. Create a new query
2. Copy contents of `seed_data.sql`
3. **Important**: Create test users first via Supabase Auth
4. Update the UUIDs in seed_data.sql with real user IDs
5. Uncomment the INSERT statements
6. Run the seed script

## Method 2: Using Supabase CLI (Recommended for Production)

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link to Your Project

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your project ref in: Project Settings > General > Project ID

### Step 4: Push Migration

```bash
# From the project root directory
supabase db push
```

This will apply all migrations in the `supabase/migrations/` directory.

### Step 5: Verify

```bash
# Check migration status
supabase db diff

# Or run validation query
supabase db query < supabase/migrations/test_schema.sql
```

## Method 3: Using PostgreSQL Client

### Step 1: Get Connection String

From Supabase Dashboard:
1. Go to Project Settings > Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Apply Migration

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/20250109000001_create_docketchief_schema.sql
```

### Step 3: Verify

```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/test_schema.sql
```

## Verification Checklist

After running the migration, verify the following:

- [ ] All 7 tables created (clients, cases, emails, email_settings, email_templates, case_law, system_alerts)
- [ ] RLS enabled on all tables
- [ ] At least 40 indexes created
- [ ] At least 28 RLS policies created
- [ ] 7 triggers created (updated_at)
- [ ] Foreign key constraints in place
- [ ] Check constraints working

Run this query to verify:

```sql
-- Quick verification
SELECT 'Tables' as object_type, COUNT(*)::text as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('clients', 'cases', 'emails', 'email_settings', 'email_templates', 'case_law', 'system_alerts')

UNION ALL

SELECT 'Indexes', COUNT(*)::text
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('clients', 'cases', 'emails', 'email_settings', 'email_templates', 'case_law', 'system_alerts')

UNION ALL

SELECT 'RLS Policies', COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('clients', 'cases', 'emails', 'email_settings', 'email_templates', 'case_law', 'system_alerts')

UNION ALL

SELECT 'Triggers', COUNT(*)::text
FROM pg_trigger
WHERE tgname LIKE '%updated_at%';
```

Expected results:
- Tables: 7
- Indexes: 40+
- RLS Policies: 28
- Triggers: 7

## Testing the Schema

### Create a Test User

1. Go to Authentication > Users
2. Click "Add user" or "Invite user"
3. Create test user: `test@example.com`
4. Note the user's UUID

### Test Client Creation

```sql
-- Replace UUID with your test user's ID
INSERT INTO clients (attorney_id, first_name, last_name, email, phone)
VALUES ('YOUR-USER-UUID', 'Test', 'Client', 'test@example.com', '555-0123');

-- Verify
SELECT * FROM clients;
```

### Test Case Creation

```sql
-- Create a case
INSERT INTO cases (attorney_id, title, case_type, status, priority)
VALUES ('YOUR-USER-UUID', 'Test Case', 'Contract', 'active', 'medium');

-- Verify
SELECT * FROM cases;
```

### Test RLS Policies

```sql
-- Try to access another user's data (should fail)
SELECT * FROM clients WHERE attorney_id != auth.uid();
-- Should return no rows (RLS blocks access)
```

## Common Issues and Solutions

### Issue 1: "relation already exists"

**Cause**: Tables already exist from a previous migration

**Solution**: 
```sql
-- Option A: Drop existing tables first (DESTRUCTIVE)
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_settings CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS case_law CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;

-- Then run the migration again

-- Option B: Use the rollback script
-- Run: 20250109000002_rollback_schema.sql
```

### Issue 2: "permission denied for schema public"

**Cause**: Insufficient permissions

**Solution**: Ensure you're using the database owner credentials or have CREATE privileges

### Issue 3: "extension uuid-ossp does not exist"

**Cause**: UUID extension not installed

**Solution**: 
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

This is included in the migration, but ensure it runs successfully.

### Issue 4: "function auth.uid() does not exist"

**Cause**: Supabase auth schema not set up

**Solution**: This should be automatic in Supabase. If you're using plain PostgreSQL:
```sql
-- You'll need to set up Supabase Auth or modify RLS policies
-- For local development without auth:
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
-- Repeat for other tables
```

### Issue 5: Migration runs but test queries fail

**Cause**: Various issues with schema

**Solution**: Review the error messages from test_schema.sql and fix specific issues

## Rollback Procedure

If you need to rollback the migration:

⚠️ **WARNING**: This will DELETE ALL DATA in these tables!

### Using SQL Editor

1. Open `20250109000002_rollback_schema.sql`
2. Review the script carefully
3. Backup your data first!
4. Run the rollback script

### Using CLI

```bash
psql "YOUR-CONNECTION-STRING" -f supabase/migrations/20250109000002_rollback_schema.sql
```

## Post-Migration Steps

### 1. Update Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 2. Test Application

1. Start your application: `npm run dev`
2. Try creating a client
3. Try creating a case
4. Verify data appears correctly

### 3. Configure Email Settings (Optional)

If using email features:
1. Go to your app's email settings
2. Configure your email provider
3. Test sending an email

### 4. Load Case Law Data (Optional)

If you have case law data to import:
1. Use the seed_data.sql as a template
2. Or create your own import script
3. Bulk load using COPY command for large datasets

### 5. Set Up Backups

Configure automatic backups in Supabase:
1. Go to Project Settings > Database
2. Enable "Point in Time Recovery" (Pro plan)
3. Or set up manual backup scripts

### 6. Monitor Performance

After migration:
1. Monitor query performance in Supabase Dashboard
2. Check slow query logs
3. Verify indexes are being used (EXPLAIN ANALYZE)

## Next Steps

1. **Read the Documentation**
   - [README.md](./README.md) - Complete documentation
   - [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference guide
   - [ER_DIAGRAM.md](./ER_DIAGRAM.md) - Entity relationships

2. **Integrate with Your App**
   - Update TypeScript types
   - Create Supabase client helpers
   - Implement queries in your components

3. **Test RLS Policies**
   - Create multiple test users
   - Verify data isolation
   - Test shared templates feature

4. **Optimize Queries**
   - Review query patterns
   - Add additional indexes if needed
   - Consider materialized views for complex reports

5. **Set Up Monitoring**
   - Configure alerting for errors
   - Monitor database size
   - Track query performance

## Support

If you encounter issues:

1. Check the [Troubleshooting section in README.md](./README.md#troubleshooting)
2. Review Supabase logs in dashboard
3. Check the [Supabase Discord](https://discord.supabase.com)
4. Review [PostgreSQL documentation](https://www.postgresql.org/docs/)

## Success Criteria

Migration is successful when:

✅ All 7 tables exist
✅ RLS is enabled on all tables
✅ All indexes are created
✅ All policies are in place
✅ Test queries pass
✅ Application can create/read/update data
✅ Data isolation works correctly (users can't see each other's data)

---

**Migration Version**: 1.0.0
**Last Updated**: 2025-01-09
**Tested on**: Supabase (PostgreSQL 15+)
