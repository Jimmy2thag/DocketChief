-- DocketChief Database Seed Data (for testing/development)
-- WARNING: This file is for development/testing only. Do NOT run in production.

-- =====================================================
-- PREREQUISITE: Create test users in Supabase Auth
-- =====================================================
-- Before running this seed, create test users via Supabase Dashboard or Auth API:
-- Test Attorney 1: attorney1@example.com (UUID will be referenced below)
-- Test Attorney 2: attorney2@example.com (UUID will be referenced below)
-- You'll need to replace the UUIDs below with actual user IDs from auth.users

-- Note: This seed uses placeholder UUIDs. Replace with actual auth.users IDs
-- or run the seed after user creation.

-- =====================================================
-- SEED DATA: clients
-- =====================================================
-- Insert sample clients (replace attorney_id with real user IDs)
/*
INSERT INTO clients (attorney_id, first_name, last_name, email, phone, address, city, state, zip_code, notes) VALUES
    ('00000000-0000-0000-0000-000000000001', 'John', 'Smith', 'john.smith@example.com', '555-0101', '123 Main St', 'New York', 'NY', '10001', 'Personal injury case'),
    ('00000000-0000-0000-0000-000000000001', 'Jane', 'Doe', 'jane.doe@example.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'Contract dispute'),
    ('00000000-0000-0000-0000-000000000001', 'Robert', 'Johnson', 'robert.j@example.com', '555-0103', '789 Pine St', 'Chicago', 'IL', '60601', 'Employment case');
*/

-- =====================================================
-- SEED DATA: cases
-- =====================================================
-- Insert sample cases (replace attorney_id and client_id with real IDs)
/*
INSERT INTO cases (attorney_id, client_id, title, case_number, description, case_type, status, priority, court, judge, start_date) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'Smith v. Corporation Inc.', '2024-CV-12345', 'Personal injury lawsuit', 'Personal Injury', 'active', 'high', 'Superior Court of NY', 'Hon. Mary Williams', NOW()),
    ('00000000-0000-0000-0000-000000000001', NULL, 'Contract Dispute - ABC Corp', '2024-CV-12346', 'Breach of contract claim', 'Contract', 'pending', 'medium', 'District Court', 'Hon. John Davis', NOW()),
    ('00000000-0000-0000-0000-000000000001', NULL, 'Employment Discrimination Case', '2024-EMP-001', 'Workplace discrimination', 'Employment', 'active', 'urgent', 'Federal Court', 'Hon. Sarah Thompson', NOW());
*/

-- =====================================================
-- SEED DATA: email_templates
-- =====================================================
-- Insert sample email templates (replace user_id with real IDs)
/*
INSERT INTO email_templates (user_id, name, subject, body_html, body_text, variables, category, is_shared) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Initial Client Consultation', 'Thank you for your inquiry - {{client_name}}', 
     '<p>Dear {{client_name}},</p><p>Thank you for contacting our firm. We have received your inquiry and will respond within 24 hours.</p><p>Best regards,<br>{{attorney_name}}</p>',
     'Dear {{client_name}},\n\nThank you for contacting our firm. We have received your inquiry and will respond within 24 hours.\n\nBest regards,\n{{attorney_name}}',
     '{"client_name": "Client Name", "attorney_name": "Attorney Name"}'::jsonb,
     'client_intake', true),
    
    ('00000000-0000-0000-0000-000000000001', 'Case Status Update', 'Update on Case {{case_number}}', 
     '<p>Dear {{client_name}},</p><p>I wanted to update you on the status of your case ({{case_number}}).</p><p>{{status_details}}</p><p>Please let me know if you have any questions.</p><p>Sincerely,<br>{{attorney_name}}</p>',
     'Dear {{client_name}},\n\nI wanted to update you on the status of your case ({{case_number}}).\n\n{{status_details}}\n\nPlease let me know if you have any questions.\n\nSincerely,\n{{attorney_name}}',
     '{"client_name": "Client Name", "case_number": "Case Number", "status_details": "Status Details", "attorney_name": "Attorney Name"}'::jsonb,
     'case_management', false),
    
    ('00000000-0000-0000-0000-000000000001', 'Document Request', 'Documents Needed for {{case_name}}', 
     '<p>Dear {{client_name}},</p><p>To proceed with your case, we need the following documents:</p><ul><li>{{document_list}}</li></ul><p>Please send these at your earliest convenience.</p><p>Thank you,<br>{{attorney_name}}</p>',
     'Dear {{client_name}},\n\nTo proceed with your case, we need the following documents:\n\n{{document_list}}\n\nPlease send these at your earliest convenience.\n\nThank you,\n{{attorney_name}}',
     '{"client_name": "Client Name", "case_name": "Case Name", "document_list": "Document List", "attorney_name": "Attorney Name"}'::jsonb,
     'document_request', false);
*/

-- =====================================================
-- SEED DATA: case_law (sample legal cases)
-- =====================================================
INSERT INTO case_law (
    case_name, citation, court, jurisdiction, court_level, decision_date,
    legal_issues, key_holdings, case_summary, outcome, precedential_value,
    distinguishing_factors, strategic_implications
) VALUES
    (
        'Brown v. Board of Education',
        '347 U.S. 483 (1954)',
        'United States Supreme Court',
        'Federal',
        'supreme',
        '1954-05-17',
        ARRAY['Civil Rights', 'Education', 'Equal Protection', 'Segregation'],
        ARRAY['Separate educational facilities are inherently unequal', 'Segregation in public schools violates the Equal Protection Clause'],
        'Landmark case that declared state laws establishing separate public schools for black and white students unconstitutional. The Court ruled that segregation in public education violated the Equal Protection Clause of the Fourteenth Amendment.',
        'plaintiff',
        'binding',
        ARRAY['Applied to public education', 'Overturned Plessy v. Ferguson', 'Unanimous decision'],
        ARRAY['Established precedent for civil rights cases', 'Catalyst for Civil Rights Movement', 'Changed interpretation of Equal Protection']
    ),
    (
        'Miranda v. Arizona',
        '384 U.S. 436 (1966)',
        'United States Supreme Court',
        'Federal',
        'supreme',
        '1966-06-13',
        ARRAY['Criminal Procedure', 'Fifth Amendment', 'Self-Incrimination', 'Right to Counsel'],
        ARRAY['Suspects must be informed of their rights before interrogation', 'Statements obtained without Miranda warnings are inadmissible'],
        'Established that criminal suspects must be informed of their rights to remain silent and to have an attorney present during questioning. Created the "Miranda warning" that police must give before custodial interrogation.',
        'defendant',
        'binding',
        ARRAY['Custodial interrogation', 'Law enforcement procedures', 'Constitutional rights'],
        ARRAY['Required police training changes', 'Protects against self-incrimination', 'Foundation for criminal defense']
    ),
    (
        'Roe v. Wade',
        '410 U.S. 113 (1973)',
        'United States Supreme Court',
        'Federal',
        'supreme',
        '1973-01-22',
        ARRAY['Privacy Rights', 'Due Process', 'Reproductive Rights', 'State Regulation'],
        ARRAY['Constitutional right to privacy extends to abortion decisions', 'States cannot ban abortion in first trimester'],
        'Recognized a constitutional right to privacy that protected a woman''s right to choose to have an abortion. Established trimester framework for state regulation.',
        'plaintiff',
        'binding',
        ARRAY['Trimester framework', 'Privacy rights interpretation', 'Note: Overturned by Dobbs v. Jackson (2022)'],
        ARRAY['Shaped reproductive rights law', 'Balance of state interests', 'Privacy doctrine expansion']
    ),
    (
        'Marbury v. Madison',
        '5 U.S. 137 (1803)',
        'United States Supreme Court',
        'Federal',
        'supreme',
        '1803-02-24',
        ARRAY['Judicial Review', 'Constitutional Law', 'Separation of Powers'],
        ARRAY['Supreme Court has authority to review acts of Congress', 'Courts can declare laws unconstitutional'],
        'Established the principle of judicial review, giving federal courts the power to declare legislative and executive acts unconstitutional. Foundation of American constitutional law.',
        'mixed',
        'binding',
        ARRAY['Created judicial review power', 'Defined Court''s role', 'Separation of powers'],
        ARRAY['Foundation of constitutional interpretation', 'Court''s authority established', 'Check on other branches']
    ),
    (
        'Gideon v. Wainwright',
        '372 U.S. 335 (1963)',
        'United States Supreme Court',
        'Federal',
        'supreme',
        '1963-03-18',
        ARRAY['Right to Counsel', 'Sixth Amendment', 'Criminal Procedure', 'Due Process'],
        ARRAY['State must provide counsel for defendants who cannot afford attorney', 'Right to counsel is fundamental'],
        'Established that the Sixth Amendment right to counsel applies to state criminal proceedings. States must provide attorneys for defendants who cannot afford their own in criminal cases.',
        'defendant',
        'binding',
        ARRAY['State criminal proceedings', 'Indigent defense', 'Fundamental right'],
        ARRAY['Created public defender systems', 'Ensures fair trials', 'Criminal justice reform']
    );

-- =====================================================
-- SEED DATA: system_alerts (sample system alerts)
-- =====================================================
-- Insert sample system-wide alerts
INSERT INTO system_alerts (user_id, title, message, severity, status, alert_type, source) VALUES
    (NULL, 'System Maintenance Scheduled', 'Database maintenance scheduled for Sunday 2AM-4AM EST. System will be temporarily unavailable.', 'medium', 'open', 'system', 'System Administrator'),
    (NULL, 'New Feature Available', 'Case law full-text search is now available! Try searching cases by keywords.', 'info', 'open', 'system', 'Product Team'),
    (NULL, 'Security Update Applied', 'Security patches have been applied. All user data remains secure and encrypted.', 'info', 'resolved', 'security', 'Security Team');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Verify seed data was inserted
SELECT 'case_law' as table_name, COUNT(*) as row_count FROM case_law
UNION ALL
SELECT 'system_alerts', COUNT(*) FROM system_alerts
ORDER BY table_name;

-- Display sample case law
SELECT case_name, citation, jurisdiction, decision_date, outcome
FROM case_law
ORDER BY decision_date;

-- Display system alerts
SELECT title, severity, status, alert_type, created_at
FROM system_alerts
ORDER BY created_at DESC;

-- =====================================================
-- NOTES FOR USAGE
-- =====================================================
-- To seed with user-specific data:
-- 1. Create test users via Supabase Auth
-- 2. Get their UUIDs from auth.users table
-- 3. Uncomment the client/case/template INSERT statements above
-- 4. Replace placeholder UUIDs with real user IDs
-- 5. Run this seed file

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- Uncomment to delete all seed data:
/*
DELETE FROM emails WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%example.com');
DELETE FROM email_templates WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE '%example.com');
DELETE FROM cases WHERE attorney_id IN (SELECT id FROM auth.users WHERE email LIKE '%example.com');
DELETE FROM clients WHERE attorney_id IN (SELECT id FROM auth.users WHERE email LIKE '%example.com');
DELETE FROM case_law WHERE case_name LIKE '%Brown v. Board%' OR case_name LIKE '%Miranda%';
DELETE FROM system_alerts WHERE source IN ('System Administrator', 'Product Team', 'Security Team');
*/
