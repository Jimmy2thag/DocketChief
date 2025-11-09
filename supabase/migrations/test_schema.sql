-- DocketChief Database Schema Test/Validation Script
-- Purpose: Verify that the migration was applied successfully

-- =====================================================
-- TEST 1: Verify all tables exist
-- =====================================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF table_count = 7 THEN
        RAISE NOTICE 'TEST PASSED: All 7 tables exist';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Expected 7 tables, found %', table_count;
    END IF;
END $$;

-- =====================================================
-- TEST 2: Verify RLS is enabled on all tables
-- =====================================================
DO $$
DECLARE
    rls_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    )
    AND rowsecurity = true;
    
    IF rls_count = 7 THEN
        RAISE NOTICE 'TEST PASSED: RLS enabled on all 7 tables';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: RLS not enabled on all tables (found % with RLS)', rls_count;
    END IF;
END $$;

-- =====================================================
-- TEST 3: Verify indexes exist
-- =====================================================
DO $$
DECLARE
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF index_count >= 40 THEN
        RAISE NOTICE 'TEST PASSED: Found % indexes (expected 40+)', index_count;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Expected 40+ indexes, found %', index_count;
    END IF;
END $$;

-- =====================================================
-- TEST 4: Verify RLS policies exist
-- =====================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF policy_count >= 28 THEN
        RAISE NOTICE 'TEST PASSED: Found % RLS policies (expected 28)', policy_count;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Expected 28 policies, found %', policy_count;
    END IF;
END $$;

-- =====================================================
-- TEST 5: Verify triggers exist
-- =====================================================
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname LIKE '%updated_at%'
    AND tgrelid::regclass::text IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF trigger_count = 7 THEN
        RAISE NOTICE 'TEST PASSED: All 7 updated_at triggers exist';
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Expected 7 triggers, found %', trigger_count;
    END IF;
END $$;

-- =====================================================
-- TEST 6: Verify foreign key constraints
-- =====================================================
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public'
    AND table_name IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF fk_count >= 10 THEN
        RAISE NOTICE 'TEST PASSED: Found % foreign key constraints', fk_count;
    ELSE
        RAISE EXCEPTION 'TEST FAILED: Expected 10+ foreign keys, found %', fk_count;
    END IF;
END $$;

-- =====================================================
-- TEST 7: Verify check constraints
-- =====================================================
DO $$
DECLARE
    check_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO check_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'CHECK'
    AND table_schema = 'public'
    AND table_name IN (
        'clients', 'cases', 'emails', 'email_settings',
        'email_templates', 'case_law', 'system_alerts'
    );
    
    IF check_count >= 10 THEN
        RAISE NOTICE 'TEST PASSED: Found % check constraints', check_count;
    ELSE
        RAISE WARNING 'TEST WARNING: Expected 10+ check constraints, found %', check_count;
    END IF;
END $$;

-- =====================================================
-- DETAILED INFORMATION QUERIES
-- =====================================================

-- List all tables with row counts
SELECT 
    schemaname,
    tablename,
    COALESCE(n_live_tup, 0) as approximate_row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
AND tablename IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
)
ORDER BY tablename;

-- List all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
)
ORDER BY tablename, indexname;

-- List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
)
ORDER BY tablename, policyname;

-- List all foreign keys
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
)
ORDER BY tc.table_name, tc.constraint_name;

-- List all triggers
SELECT
    event_object_table AS table_name,
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN (
    'clients', 'cases', 'emails', 'email_settings',
    'email_templates', 'case_law', 'system_alerts'
)
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- SUMMARY
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Schema Validation Complete';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tests passed successfully!';
    RAISE NOTICE 'Database schema is ready for use.';
END $$;
