# Security Fix: PostgreSQL Function search_path Issue

## Issue Summary

Two PostgreSQL trigger functions were flagged by database linters for having mutable `search_path`:
- `public.update_calendar_events_updated_at`
- `public.update_calendar_settings_updated_at`

## What is the Problem?

When a PostgreSQL function doesn't have an explicit `search_path` parameter set, it inherits the caller's search_path. This creates security vulnerabilities:

1. **Search Path Injection**: A malicious user could create a table/function with the same name in a different schema and trick the function into using it
2. **Privilege Escalation**: Especially dangerous for SECURITY DEFINER functions
3. **Inconsistent Behavior**: The function might behave differently depending on who calls it

## The Fix

Both migration files add `SET search_path = public` to their respective functions:

```sql
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public  -- ← This line fixes the security issue
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
```

## How to Apply

### Quick Start (Supabase Dashboard)

1. Go to your Supabase project: https://supabase.com/dashboard/project/YOUR_PROJECT
2. Navigate to **SQL Editor**
3. Copy the contents of each migration file:
   - `supabase/migrations/20231228_fix_calendar_events_trigger_search_path.sql`
   - `supabase/migrations/20231228_fix_calendar_settings_trigger_search_path.sql`
4. Paste into SQL Editor and click **Run**

### Alternative: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or apply specific migrations
supabase db execute --file supabase/migrations/20231228_fix_calendar_events_trigger_search_path.sql
supabase db execute --file supabase/migrations/20231228_fix_calendar_settings_trigger_search_path.sql
```

## Verification

After applying, verify the fix was successful:

```sql
-- Run this query in Supabase SQL Editor
SELECT 
  p.proname as function_name,
  array_to_string(p.proconfig, ', ') as settings
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('update_calendar_events_updated_at', 'update_calendar_settings_updated_at');
```

You should see `search_path=public` in the settings column for both functions.

## Impact

- ✅ **Security**: Prevents search_path injection attacks
- ✅ **Reliability**: Functions behave consistently
- ✅ **Compliance**: Follows PostgreSQL security best practices
- ✅ **No Breaking Changes**: The functions work exactly the same way, just more securely

## References

- [PostgreSQL SET Configuration Parameters](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY)
- [Search Path Injection Vulnerabilities](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)
