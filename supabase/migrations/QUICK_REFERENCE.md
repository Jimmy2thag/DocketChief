# DocketChief Database Quick Reference Guide

## Quick Links
- [Main README](./README.md) - Complete documentation
- [ER Diagram](./ER_DIAGRAM.md) - Text-based entity relationships
- [ER Diagram (Mermaid)](./ER_DIAGRAM_MERMAID.md) - Visual diagrams
- [Migration File](./20250109000001_create_docketchief_schema.sql) - Main schema
- [Test Script](./test_schema.sql) - Validation queries
- [Seed Data](./seed_data.sql) - Sample data for testing
- [Rollback Script](./20250109000002_rollback_schema.sql) - Remove schema

## Table Reference

### 1. clients
**Purpose**: Store attorney's clients

**Key Columns**: `attorney_id`, `first_name`, `last_name`, `email`, `phone`

**Example Query**:
```sql
-- Get all clients for current user
SELECT * FROM clients WHERE attorney_id = auth.uid();

-- Create new client
INSERT INTO clients (attorney_id, first_name, last_name, email, phone)
VALUES (auth.uid(), 'John', 'Doe', 'john@example.com', '555-0123');
```

### 2. cases
**Purpose**: Track legal cases

**Key Columns**: `attorney_id`, `client_id`, `title`, `case_number`, `status`, `priority`

**Status Values**: `active`, `pending`, `closed`, `archived`

**Priority Values**: `low`, `medium`, `high`, `urgent`

**Example Query**:
```sql
-- Get active cases with client info
SELECT c.*, cl.first_name, cl.last_name
FROM cases c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE c.attorney_id = auth.uid() AND c.status = 'active'
ORDER BY c.priority DESC, c.created_at DESC;

-- Update case status
UPDATE cases SET status = 'closed', end_date = NOW()
WHERE id = 'case-uuid' AND attorney_id = auth.uid();
```

### 3. emails
**Purpose**: Store email messages

**Key Columns**: `user_id`, `case_id`, `client_id`, `subject`, `to_emails`, `status`

**Direction Values**: `inbound`, `outbound`

**Status Values**: `draft`, `sent`, `failed`, `delivered`, `bounced`

**Example Query**:
```sql
-- Get recent emails for a case
SELECT * FROM emails
WHERE case_id = 'case-uuid' AND user_id = auth.uid()
ORDER BY sent_at DESC NULLS LAST
LIMIT 50;

-- Send new email (insert record)
INSERT INTO emails (user_id, case_id, subject, from_email, to_emails, body_html, status, direction, sent_at)
VALUES (
    auth.uid(),
    'case-uuid',
    'Subject line',
    'attorney@firm.com',
    ARRAY['client@example.com'],
    '<p>Email body</p>',
    'sent',
    'outbound',
    NOW()
);
```

### 4. email_settings
**Purpose**: Email provider configuration

**Key Columns**: `user_id` (UNIQUE), `provider`, `auto_categorize`, `encryption_enabled`

**Provider Values**: `none`, `gmail`, `outlook`, `smtp`, `exchange`

**Example Query**:
```sql
-- Get user's email settings
SELECT * FROM email_settings WHERE user_id = auth.uid();

-- Update email settings (upsert)
INSERT INTO email_settings (user_id, provider, auto_categorize, encryption_enabled)
VALUES (auth.uid(), 'gmail', true, true)
ON CONFLICT (user_id) DO UPDATE
SET provider = EXCLUDED.provider,
    auto_categorize = EXCLUDED.auto_categorize,
    encryption_enabled = EXCLUDED.encryption_enabled,
    updated_at = NOW();
```

### 5. email_templates
**Purpose**: Reusable email templates

**Key Columns**: `user_id`, `name`, `subject`, `body_html`, `variables`, `is_shared`

**Example Query**:
```sql
-- Get all templates (own + shared)
SELECT * FROM email_templates
WHERE user_id = auth.uid() OR is_shared = true
ORDER BY category, name;

-- Create new template
INSERT INTO email_templates (user_id, name, subject, body_html, variables, category)
VALUES (
    auth.uid(),
    'Client Welcome',
    'Welcome {{client_name}}',
    '<p>Dear {{client_name}},</p><p>Welcome to our firm...</p>',
    '{"client_name": "Client Name"}'::jsonb,
    'client_intake'
);

-- Increment usage count
UPDATE email_templates
SET usage_count = usage_count + 1
WHERE id = 'template-uuid' AND user_id = auth.uid();
```

### 6. case_law
**Purpose**: Legal case law database

**Key Columns**: `case_name`, `citation`, `jurisdiction`, `court_level`, `outcome`

**Court Level Values**: `trial`, `appellate`, `supreme`, `district`, `circuit`

**Outcome Values**: `plaintiff`, `defendant`, `mixed`, `remanded`, `dismissed`

**Precedential Value**: `binding`, `persuasive`, `non-precedential`

**Example Query**:
```sql
-- Search by keyword
SELECT * FROM case_law
WHERE to_tsvector('english', case_name) @@ to_tsquery('contract')
ORDER BY decision_date DESC
LIMIT 25;

-- Search by legal issue
SELECT * FROM case_law
WHERE legal_issues @> ARRAY['Employment']
AND jurisdiction = 'New York'
ORDER BY precedential_value, decision_date DESC;

-- Filter by multiple criteria
SELECT * FROM case_law
WHERE jurisdiction = 'Federal'
AND court_level = 'supreme'
AND outcome = 'plaintiff'
AND decision_date >= '2000-01-01'
ORDER BY decision_date DESC;
```

### 7. system_alerts
**Purpose**: System notifications

**Key Columns**: `user_id` (nullable), `title`, `message`, `severity`, `status`

**Severity Values**: `critical`, `high`, `medium`, `low`, `info`

**Status Values**: `open`, `investigating`, `resolved`, `dismissed`

**Alert Type Values**: `system`, `security`, `deadline`, `case`, `email`, `payment`, `integration`

**Example Query**:
```sql
-- Get user's open alerts (including system-wide)
SELECT * FROM system_alerts
WHERE (user_id = auth.uid() OR user_id IS NULL)
AND status IN ('open', 'investigating')
ORDER BY severity DESC, created_at DESC;

-- Create user alert
INSERT INTO system_alerts (user_id, title, message, severity, status, alert_type)
VALUES (
    auth.uid(),
    'Deadline Approaching',
    'Case filing deadline is in 3 days',
    'high',
    'open',
    'deadline'
);

-- Resolve alert
UPDATE system_alerts
SET status = 'resolved',
    resolved_by = auth.uid(),
    resolved_at = NOW()
WHERE id = 'alert-uuid';
```

## Common Patterns

### Get Current User ID
```sql
SELECT auth.uid();
```

### Join Cases with Clients
```sql
SELECT 
    c.*,
    cl.first_name || ' ' || cl.last_name as client_name,
    cl.email as client_email
FROM cases c
LEFT JOIN clients cl ON c.client_id = cl.id
WHERE c.attorney_id = auth.uid();
```

### Email Thread View
```sql
SELECT * FROM emails
WHERE thread_id = 'thread-id'
ORDER BY sent_at ASC;
```

### Case Dashboard Summary
```sql
SELECT 
    status,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count
FROM cases
WHERE attorney_id = auth.uid()
GROUP BY status;
```

### Recent Activity
```sql
SELECT 
    'case' as type,
    title as description,
    created_at
FROM cases
WHERE attorney_id = auth.uid()

UNION ALL

SELECT 
    'email' as type,
    subject as description,
    sent_at as created_at
FROM emails
WHERE user_id = auth.uid()

ORDER BY created_at DESC
LIMIT 20;
```

## TypeScript Types (for Frontend)

```typescript
// Generated from database schema
interface Client {
  id: string;
  attorney_id: string;
  first_name: string;
  last_name: string;
  name: string; // generated column
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Case {
  id: string;
  attorney_id: string;
  client_id?: string;
  title: string;
  case_number?: string;
  description?: string;
  case_type: string;
  status: 'active' | 'pending' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  court?: string;
  judge?: string;
  opposing_counsel?: string;
  start_date?: string;
  end_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Email {
  id: string;
  user_id: string;
  case_id?: string;
  client_id?: string;
  message_id?: string;
  thread_id?: string;
  subject: string;
  from_email: string;
  to_emails: string[];
  cc_emails?: string[];
  bcc_emails?: string[];
  body_html?: string;
  body_text?: string;
  is_encrypted: boolean;
  provider: string;
  direction: 'inbound' | 'outbound';
  status: 'draft' | 'sent' | 'failed' | 'delivered' | 'bounced';
  attachments?: any;
  metadata?: any;
  sent_at?: string;
  received_at?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

interface EmailSettings {
  id: string;
  user_id: string;
  provider: 'none' | 'gmail' | 'outlook' | 'smtp' | 'exchange';
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password_encrypted?: string;
  imap_host?: string;
  imap_port?: number;
  auto_categorize: boolean;
  encryption_enabled: boolean;
  signature_html?: string;
  signature_text?: string;
  settings?: any;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  variables?: Record<string, string>;
  category?: string;
  is_shared: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface CaseLaw {
  id: string;
  case_name: string;
  citation: string;
  court: string;
  jurisdiction: string;
  court_level: 'trial' | 'appellate' | 'supreme' | 'district' | 'circuit';
  decision_date: string;
  legal_issues: string[];
  key_holdings: string[];
  case_summary?: string;
  outcome: 'plaintiff' | 'defendant' | 'mixed' | 'remanded' | 'dismissed';
  precedential_value: 'binding' | 'persuasive' | 'non-precedential';
  distinguishing_factors?: string[];
  strategic_implications?: string[];
  full_text?: string;
  judges?: string[];
  parties?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface SystemAlert {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  alert_type: 'system' | 'security' | 'deadline' | 'case' | 'email' | 'payment' | 'integration';
  source?: string;
  metadata?: any;
  notes?: any[];
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}
```

## Supabase Client Examples

```typescript
// Get clients
const { data: clients, error } = await supabase
  .from('clients')
  .select('*')
  .order('created_at', { ascending: false });

// Get cases with client info
const { data: cases, error } = await supabase
  .from('cases')
  .select(`
    *,
    clients (
      first_name,
      last_name,
      email
    )
  `)
  .eq('status', 'active');

// Create new case
const { data, error } = await supabase
  .from('cases')
  .insert({
    attorney_id: user.id,
    client_id: clientId,
    title: 'Case Title',
    case_type: 'Contract',
    status: 'active',
    priority: 'medium'
  })
  .select()
  .single();

// Search case law
const { data, error } = await supabase
  .from('case_law')
  .select('*')
  .textSearch('case_name', 'employment discrimination')
  .eq('jurisdiction', 'Federal')
  .order('decision_date', { ascending: false })
  .limit(10);
```

## Performance Tips

1. **Always filter by user**: RLS handles this, but explicit filters are faster
2. **Use indexes**: All FK and common filter columns are indexed
3. **Limit results**: Use `.limit()` for large tables (emails, case_law)
4. **Select specific columns**: Don't use `SELECT *` in production
5. **Use pagination**: Implement cursor-based pagination for large datasets

## Troubleshooting

**Issue**: "Row violates row-level security policy"
- Ensure `auth.uid()` matches the owner column (attorney_id, user_id)

**Issue**: "Null value in column violates not-null constraint"
- Check required fields in INSERT statements

**Issue**: "Duplicate key value violates unique constraint"
- email_settings has UNIQUE constraint on user_id (one per user)

**Issue**: Slow queries
- Check if indexes exist: `\d table_name` in psql
- Use EXPLAIN ANALYZE to see query plan

## Best Practices

1. ✅ Always use parameterized queries (Supabase handles this)
2. ✅ Validate input before inserting
3. ✅ Handle errors gracefully
4. ✅ Use transactions for multi-table operations
5. ✅ Keep sensitive data encrypted (passwords, API keys)
6. ✅ Log critical operations (case status changes)
7. ✅ Regularly backup data
8. ✅ Monitor query performance
9. ✅ Use TypeScript types for type safety
10. ✅ Test RLS policies in development
