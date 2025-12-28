-- DocketChief Database Schema Rollback Migration
-- Purpose: Safely remove all tables and objects created by 20250109000001_create_docketchief_schema.sql
-- WARNING: This will DELETE ALL DATA in these tables. Use with extreme caution!

-- =====================================================
-- CONFIRMATION PROMPT
-- =====================================================
-- Before running this rollback, ensure you have:
-- 1. Backed up all data
-- 2. Notified all users of downtime
-- 3. Verified this is the correct database
-- 4. Obtained necessary approvals

-- =====================================================
-- STEP 1: Drop all triggers
-- =====================================================
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
DROP TRIGGER IF EXISTS update_case_law_updated_at ON case_law;
DROP TRIGGER IF EXISTS update_system_alerts_updated_at ON system_alerts;

-- =====================================================
-- STEP 2: Drop trigger function
-- =====================================================
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- STEP 3: Drop all tables (CASCADE removes all dependencies)
-- =====================================================
-- Note: CASCADE will also remove all RLS policies, indexes, and constraints

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS emails CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_settings CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS case_law CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify all tables are removed
DO $$
DECLARE
    remaining_tables INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF remaining_tables = 0 THEN
        RAISE NOTICE 'ROLLBACK SUCCESSFUL: All DocketChief tables have been removed';
    ELSE
        RAISE WARNING 'ROLLBACK INCOMPLETE: % DocketChief tables still exist', remaining_tables;
    END IF;
END $$;

-- List any remaining related objects
SELECT 
    schemaname,
    tablename,
    'Table still exists' as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
);

-- =====================================================
-- CLEANUP NOTES
-- =====================================================
-- After running this rollback:
-- 1. Verify all application code that references these tables is updated
-- 2. Check for any Edge Functions that query these tables
-- 3. Review and remove any related Supabase Storage buckets
-- 4. Update API documentation
-- 5. Notify all users of schema changes

-- =====================================================
-- RE-APPLYING THE SCHEMA
-- =====================================================
-- If you need to re-apply the schema after rollback:
-- Run: 20250109000001_create_docketchief_schema.sql
-- Then optionally: seed_data.sql

-- =====================================================
-- PARTIAL ROLLBACK OPTIONS
-- =====================================================
-- If you only need to remove specific tables, comment out the others above
-- and run this script. For example, to only remove case_law:
-- DROP TABLE IF EXISTS case_law CASCADE;

-- To remove only RLS policies (keeping tables):
/*
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

DROP POLICY IF EXISTS "Users can view their own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert their own cases" ON cases;
DROP POLICY IF EXISTS "Users can update their own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete their own cases" ON cases;

DROP POLICY IF EXISTS "Users can view their own emails" ON emails;
DROP POLICY IF EXISTS "Users can insert their own emails" ON emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON emails;
DROP POLICY IF EXISTS "Users can delete their own emails" ON emails;

DROP POLICY IF EXISTS "Users can view their own email settings" ON email_settings;
DROP POLICY IF EXISTS "Users can insert their own email settings" ON email_settings;
DROP POLICY IF EXISTS "Users can update their own email settings" ON email_settings;
DROP POLICY IF EXISTS "Users can delete their own email settings" ON email_settings;

DROP POLICY IF EXISTS "Users can view their own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON email_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON email_templates;

DROP POLICY IF EXISTS "Authenticated users can view case law" ON case_law;
DROP POLICY IF EXISTS "Admins can insert case law" ON case_law;
DROP POLICY IF EXISTS "Admins can update case law" ON case_law;
DROP POLICY IF EXISTS "Admins can delete case law" ON case_law;

DROP POLICY IF EXISTS "Users can view their own alerts and system-wide alerts" ON system_alerts;
DROP POLICY IF EXISTS "System can insert alerts" ON system_alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON system_alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON system_alerts;
*/

-- End of rollback migration
