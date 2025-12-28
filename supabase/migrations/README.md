# Database Migrations

This directory contains SQL migrations for the DocketChief Supabase database.

## Recent Migrations

### Fix search_path Security Issues (2023-12-28)

Two migration files fix security vulnerabilities in PostgreSQL trigger functions:

- `20231228_fix_calendar_events_trigger_search_path.sql`
- `20231228_fix_calendar_settings_trigger_search_path.sql`

**Issue:** The `update_calendar_events_updated_at` and `update_calendar_settings_updated_at` functions had mutable search_path, which is a security risk.

**Fix:** Both functions now explicitly set `search_path = public` to prevent search_path injection attacks.

## How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order
4. Copy the SQL content
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# Apply all pending migrations
supabase db push

# Or apply a specific migration
supabase db execute --file supabase/migrations/20231228_fix_calendar_events_trigger_search_path.sql
supabase db execute --file supabase/migrations/20231228_fix_calendar_settings_trigger_search_path.sql
```

### Option 3: Direct Database Connection

If you have direct access to the PostgreSQL database:

```bash
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/20231228_fix_calendar_events_trigger_search_path.sql
psql -h your-db-host -U your-user -d your-database -f supabase/migrations/20231228_fix_calendar_settings_trigger_search_path.sql
```

## Verification

After applying the migrations, verify the functions have the correct search_path:

```sql
-- Check calendar_events function
SELECT 
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  array_to_string(p.proconfig, ', ') as settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'update_calendar_events_updated_at';

-- Check calendar_settings function
SELECT 
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  array_to_string(p.proconfig, ', ') as settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname = 'update_calendar_settings_updated_at';
```

You should see `search_path=public` in the settings column.

## Security Notes

Setting an explicit `search_path` on functions prevents:
- **Search path injection attacks**: Malicious users cannot trick the function into using objects from a different schema
- **Privilege escalation**: Especially important for SECURITY DEFINER functions
- **Unexpected behavior**: Functions behave consistently regardless of caller's search_path

This is a best practice recommended by PostgreSQL security guidelines and database linting tools.
