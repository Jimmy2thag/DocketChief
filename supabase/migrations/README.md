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
# DocketChief Database Schema Documentation

## Overview

This directory contains the database schema migrations for DocketChief, a comprehensive legal practice management system. The schema is designed for use with Supabase (PostgreSQL) and includes Row Level Security (RLS) policies for multi-tenant data isolation.

## Quick Start

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase project created
- PostgreSQL 14+ (automatically provided by Supabase)

### Running Migrations

#### Option 1: Using Supabase CLI (Recommended)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to Supabase
supabase db push
```

#### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `20250109000001_create_docketchief_schema.sql`
4. Execute the SQL

#### Option 3: Using PostgreSQL directly

```bash
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres -f supabase/migrations/20250109000001_create_docketchief_schema.sql
```

## Database Schema

### Tables Overview

The schema consists of 7 core tables:

1. **clients** - Client/customer management
2. **cases** - Legal case tracking
3. **emails** - Email management and integration
4. **email_settings** - Email provider configuration
5. **email_templates** - Reusable email templates
6. **case_law** - Legal case law database
7. **system_alerts** - System notifications and alerts

### Schema Features

#### ✅ Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Multi-tenant isolation
- Secure data access through Supabase Auth

#### ✅ Performance Indexes
Strategic indexes on:
- Foreign key columns
- Common query filters (status, priority, dates)
- Full-text search fields
- Array columns

#### ✅ Automatic Timestamps
All tables include:
- `created_at` - Record creation timestamp
- `updated_at` - Automatic update via trigger

#### ✅ Data Integrity
- Foreign key constraints
- Check constraints for enum-like fields
- NOT NULL constraints on required fields

#### ✅ Flexible Data Storage
- JSONB columns for extensible metadata
- Array columns for multi-value fields
- Full-text search capabilities

## Table Details

### 1. clients

**Purpose**: Store client information for attorneys

**Key Fields**:
- `attorney_id` - Reference to the attorney (auth.users)
- `first_name`, `last_name` - Client name
- `name` - Auto-generated full name
- `email`, `phone` - Contact information
- Address fields for location

**RLS**: Users can only access clients they created (attorney_id = auth.uid())

**Indexes**: attorney_id, email, created_at

### 2. cases

**Purpose**: Track legal cases

**Key Fields**:
- `attorney_id` - Case owner
- `client_id` - Associated client
- `title`, `case_number` - Case identifiers
- `case_type` - Type of legal case
- `status` - active, pending, closed, archived
- `priority` - low, medium, high, urgent
- `court`, `judge`, `opposing_counsel` - Case details

**RLS**: Users can only access their own cases (attorney_id = auth.uid())

**Indexes**: attorney_id, client_id, status, priority, case_number, dates

### 3. emails

**Purpose**: Store and manage emails with case/client associations

**Key Fields**:
- `user_id` - Email owner
- `case_id`, `client_id` - Optional associations
- `subject`, `from_email`, `to_emails` - Email details
- `body_html`, `body_text` - Email content
- `direction` - inbound/outbound
- `status` - draft, sent, failed, delivered, bounced
- `is_encrypted` - Encryption flag
- `attachments` - JSONB array of attachment metadata

**RLS**: Users can only access their own emails

**Indexes**: user_id, case_id, client_id, thread_id, status, dates

### 4. email_settings

**Purpose**: Store email provider configuration per user

**Key Fields**:
- `user_id` - Settings owner (UNIQUE constraint)
- `provider` - none, gmail, outlook, smtp, exchange
- SMTP/IMAP configuration fields
- `auto_categorize`, `encryption_enabled` - Feature flags
- `signature_html`, `signature_text` - Email signatures
- `settings` - JSONB for additional provider-specific settings

**RLS**: Users can only access their own settings

**Unique Constraint**: One settings record per user

### 5. email_templates

**Purpose**: Reusable email templates with variable substitution

**Key Fields**:
- `user_id` - Template owner
- `name` - Template identifier
- `subject`, `body_html`, `body_text` - Template content
- `variables` - JSONB object defining template variables
- `category` - Template categorization
- `is_shared` - Allow other users to see this template
- `usage_count` - Track template popularity

**RLS**: Users can view own templates + shared templates

**Indexes**: user_id, category, is_shared, created_at

### 6. case_law

**Purpose**: Legal case law database for research

**Key Fields**:
- `case_name`, `citation` - Case identifiers
- `court`, `jurisdiction`, `court_level` - Court details
- `decision_date` - When case was decided
- `legal_issues`, `key_holdings` - Text arrays
- `case_summary`, `full_text` - Case content
- `outcome` - plaintiff, defendant, mixed, remanded, dismissed
- `precedential_value` - binding, persuasive, non-precedential
- `distinguishing_factors`, `strategic_implications` - Analysis arrays

**RLS**: 
- All authenticated users can read
- Only admins can insert/update/delete

**Indexes**: 
- Standard indexes on citation, jurisdiction, court_level, dates
- GIN indexes for full-text search on case_name and full_text
- GIN index for array search on legal_issues

### 7. system_alerts

**Purpose**: System notifications and alerts

**Key Fields**:
- `user_id` - Alert recipient (NULL for system-wide alerts)
- `title`, `message` - Alert content
- `severity` - critical, high, medium, low, info
- `status` - open, investigating, resolved, dismissed
- `alert_type` - system, security, deadline, case, email, payment, integration
- `notes` - JSONB array of follow-up notes
- `resolved_by`, `resolved_at` - Resolution tracking

**RLS**: Users can view their own alerts + system-wide alerts (user_id IS NULL)

**Indexes**: user_id, severity, status, alert_type, dates

## Security Considerations

### Row Level Security (RLS)

Every table implements RLS policies following these patterns:

1. **User Isolation**: Users can only access data they own
2. **Audit Trail**: created_by and resolved_by fields track actions
3. **Soft Deletes**: Consider implementing instead of hard deletes
4. **Admin Access**: Some tables allow admin override (via JWT role)

### Best Practices

1. **Never disable RLS** in production
2. **Always authenticate** before database operations
3. **Validate input** before inserts/updates
4. **Encrypt sensitive data** (passwords, API keys)
5. **Use prepared statements** to prevent SQL injection
6. **Audit critical operations** (case status changes, deletions)

### Password Storage

The `email_settings.smtp_password_encrypted` field should store encrypted passwords:
- Use Supabase Vault for secrets (recommended)
- Or encrypt client-side before storing
- Never store plaintext passwords

## Performance Optimization

### Indexing Strategy

1. **Foreign Keys**: All FK columns indexed for joins
2. **Filter Columns**: status, priority, severity indexed
3. **Date Ranges**: Timestamp columns indexed DESC for recent-first queries
4. **Full-Text Search**: GIN indexes on text content
5. **Array Search**: GIN indexes on array columns

### Query Tips

```sql
-- Good: Uses index on attorney_id
SELECT * FROM cases WHERE attorney_id = 'user-uuid';

-- Good: Uses index on created_at DESC
SELECT * FROM emails ORDER BY created_at DESC LIMIT 50;

-- Good: Uses GIN index for full-text search
SELECT * FROM case_law WHERE to_tsvector('english', case_name) @@ to_tsquery('contract');

-- Good: Uses GIN index for array search
SELECT * FROM case_law WHERE legal_issues @> ARRAY['contract'];
```

### Monitoring

Monitor these metrics:
1. Query execution time
2. Index usage (pg_stat_user_indexes)
3. Table bloat
4. Connection pool usage
5. RLS policy evaluation time

## Maintenance

### Regular Tasks

1. **Vacuum**: Auto-vacuum is enabled by default
2. **Analyze**: Statistics are auto-updated
3. **Backup**: Configure daily backups in Supabase
4. **Archive**: Consider archiving old cases/emails

### Schema Updates

When adding new migrations:

1. Create new file: `YYYYMMDDHHMMSS_description.sql`
2. Include rollback instructions in comments
3. Test on staging before production
4. Use `IF NOT EXISTS` for idempotency
5. Document breaking changes

Example:
```sql
-- Migration: 20250110000001_add_documents_table.sql
-- Rollback: DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- ... rest of schema
);
```

## Troubleshooting

### Common Issues

**Issue**: RLS policies blocking queries
```sql
-- Check current user
SELECT auth.uid();

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cases';

-- Temporarily disable RLS (testing only!)
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
```

**Issue**: Slow queries
```sql
-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM emails WHERE user_id = 'uuid';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan;
```

**Issue**: Migration conflicts
```bash
# Reset local database (destroys data!)
supabase db reset

# Or fix conflicts manually in Supabase dashboard
```

## Development Workflow

### Local Development

```bash
# Start local Supabase
supabase start

# Create new migration
supabase migration new add_feature_name

# Edit the generated file
# Apply locally
supabase db reset

# Test your changes
# Commit when ready
git add supabase/migrations/
git commit -m "Add feature_name migration"
```

### Testing

1. **Unit Tests**: Test RLS policies with different users
2. **Integration Tests**: Test foreign key constraints
3. **Performance Tests**: Load test with realistic data volumes
4. **Migration Tests**: Test rollback procedures

### Deployment

```bash
# Production deployment
supabase link --project-ref PROD_PROJECT_REF
supabase db push

# Verify
supabase db diff
```

## Support

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Discord](https://discord.supabase.com)

### Getting Help

1. Check Supabase logs in dashboard
2. Review RLS policies
3. Check database logs
4. Contact support with:
   - Migration file
   - Error message
   - Query that's failing
   - Expected vs actual behavior

## License

See project LICENSE file.

## Contributors

DocketChief Development Team

---

Last Updated: 2025-01-09
Schema Version: 1.0.0
