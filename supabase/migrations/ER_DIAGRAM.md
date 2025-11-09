# DocketChief Database Entity Relationship Diagram

## Overview
This document describes the database schema for DocketChief, a legal practice management system.

## Entity Relationship Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│─────────────────│
│ • id (PK)       │
│ • email         │
└────────┬────────┘
         │
         │ 1:N relationships
         │
    ┌────┴────┬────────┬────────┬──────────┬─────────┬──────────┐
    │         │        │        │          │         │          │
    ▼         ▼        ▼        ▼          ▼         ▼          ▼
┌───────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌───────┐ ┌────────┐ ┌──────────┐
│clients│ │cases │ │emails│ │email_    │ │email_ │ │case_law│ │system_   │
│       │ │      │ │      │ │settings  │ │temp-  │ │        │ │alerts    │
│       │ │      │ │      │ │          │ │lates  │ │        │ │          │
└───┬───┘ └──┬───┘ └──────┘ └──────────┘ └───────┘ └────────┘ └──────────┘
    │        │
    │        │ N:1 relationship
    └────────┘
```

## Table Descriptions

### 1. **clients**
Stores client information for attorneys.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `attorney_id` (UUID, FK → auth.users): Reference to attorney
- `first_name` (TEXT): Client's first name
- `last_name` (TEXT): Client's last name
- `name` (TEXT, GENERATED): Full name (first + last)
- `email` (TEXT): Client's email address
- `phone` (TEXT): Client's phone number
- `address`, `city`, `state`, `zip_code` (TEXT): Client's address
- `notes` (TEXT): Additional notes
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- N:1 with auth.users (attorney_id)
- 1:N with cases (client_id)
- 1:N with emails (client_id)

**Indexes:**
- `idx_clients_attorney_id` on attorney_id
- `idx_clients_email` on email
- `idx_clients_created_at` on created_at DESC

### 2. **cases**
Stores legal case information.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `attorney_id` (UUID, FK → auth.users): Reference to attorney
- `client_id` (UUID, FK → clients): Reference to client
- `title` (TEXT): Case title
- `case_number` (TEXT): Court case number
- `description` (TEXT): Case description
- `case_type` (TEXT): Type of case
- `status` (TEXT): Case status (active, pending, closed, archived)
- `priority` (TEXT): Priority level (low, medium, high, urgent)
- `court` (TEXT): Court name
- `judge` (TEXT): Judge name
- `opposing_counsel` (TEXT): Opposing attorney
- `start_date`, `end_date` (TIMESTAMPTZ): Case timeline
- `created_by` (UUID, FK → auth.users): Case creator
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- N:1 with auth.users (attorney_id, created_by)
- N:1 with clients (client_id)
- 1:N with emails (case_id)

**Indexes:**
- `idx_cases_attorney_id` on attorney_id
- `idx_cases_client_id` on client_id
- `idx_cases_status` on status
- `idx_cases_priority` on priority
- `idx_cases_case_number` on case_number
- `idx_cases_created_at` on created_at DESC
- `idx_cases_start_date` on start_date DESC

### 3. **emails**
Stores sent and received emails.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Email owner
- `case_id` (UUID, FK → cases): Related case
- `client_id` (UUID, FK → clients): Related client
- `message_id`, `thread_id` (TEXT): Email threading
- `subject` (TEXT): Email subject
- `from_email` (TEXT): Sender email
- `to_emails`, `cc_emails`, `bcc_emails` (TEXT[]): Recipients
- `body_html`, `body_text` (TEXT): Email content
- `is_encrypted` (BOOLEAN): Encryption flag
- `provider` (TEXT): Email provider
- `direction` (TEXT): inbound/outbound
- `status` (TEXT): draft, sent, failed, delivered, bounced
- `attachments` (JSONB): Attachment metadata
- `metadata` (JSONB): Additional metadata
- `sent_at`, `received_at`, `read_at` (TIMESTAMPTZ): Timestamps
- `created_at`, `updated_at` (TIMESTAMPTZ): Record timestamps

**Relationships:**
- N:1 with auth.users (user_id)
- N:1 with cases (case_id)
- N:1 with clients (client_id)

**Indexes:**
- `idx_emails_user_id` on user_id
- `idx_emails_case_id` on case_id
- `idx_emails_client_id` on client_id
- `idx_emails_thread_id` on thread_id
- `idx_emails_direction` on direction
- `idx_emails_status` on status
- `idx_emails_sent_at` on sent_at DESC
- `idx_emails_received_at` on received_at DESC
- `idx_emails_from_email` on from_email

### 4. **email_settings**
Stores email provider configuration.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users, UNIQUE): Email settings owner
- `provider` (TEXT): Provider type (none, gmail, outlook, smtp, exchange)
- `smtp_host`, `smtp_port`, `smtp_user` (TEXT/INTEGER): SMTP settings
- `smtp_password_encrypted` (TEXT): Encrypted password
- `imap_host`, `imap_port` (TEXT/INTEGER): IMAP settings
- `auto_categorize` (BOOLEAN): Auto-categorization flag
- `encryption_enabled` (BOOLEAN): Encryption flag
- `signature_html`, `signature_text` (TEXT): Email signatures
- `settings` (JSONB): Additional settings
- `last_sync_at` (TIMESTAMPTZ): Last synchronization time
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- 1:1 with auth.users (user_id)

**Indexes:**
- `idx_email_settings_user_id` on user_id
- `idx_email_settings_provider` on provider

### 5. **email_templates**
Stores reusable email templates.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Template owner
- `name` (TEXT): Template name
- `subject` (TEXT): Email subject template
- `body_html`, `body_text` (TEXT): Email body templates
- `variables` (JSONB): Template variables
- `category` (TEXT): Template category
- `is_shared` (BOOLEAN): Shared template flag
- `usage_count` (INTEGER): Usage counter
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- N:1 with auth.users (user_id)

**Indexes:**
- `idx_email_templates_user_id` on user_id
- `idx_email_templates_category` on category
- `idx_email_templates_is_shared` on is_shared
- `idx_email_templates_created_at` on created_at DESC

### 6. **case_law**
Stores legal case law database.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `case_name` (TEXT): Case name
- `citation` (TEXT): Legal citation
- `court` (TEXT): Court name
- `jurisdiction` (TEXT): Jurisdiction
- `court_level` (TEXT): Court level (trial, appellate, supreme, district, circuit)
- `decision_date` (DATE): Decision date
- `legal_issues` (TEXT[]): Legal issues array
- `key_holdings` (TEXT[]): Key holdings array
- `case_summary` (TEXT): Case summary
- `outcome` (TEXT): Case outcome (plaintiff, defendant, mixed, remanded, dismissed)
- `precedential_value` (TEXT): Precedential value (binding, persuasive, non-precedential)
- `distinguishing_factors`, `strategic_implications` (TEXT[]): Analysis arrays
- `full_text` (TEXT): Full case text
- `judges`, `parties` (TEXT[]): Participants
- `metadata` (JSONB): Additional metadata
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- Independent table (public legal data)

**Indexes:**
- `idx_case_law_citation` on citation
- `idx_case_law_jurisdiction` on jurisdiction
- `idx_case_law_court_level` on court_level
- `idx_case_law_decision_date` on decision_date DESC
- `idx_case_law_outcome` on outcome
- `idx_case_law_precedential_value` on precedential_value
- `idx_case_law_case_name` on case_name (GIN full-text)
- `idx_case_law_legal_issues` on legal_issues (GIN array)
- `idx_case_law_full_text` on full_text (GIN full-text)

### 7. **system_alerts**
Stores system alerts and notifications.

**Columns:**
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Alert recipient (NULL for system-wide)
- `title` (TEXT): Alert title
- `message` (TEXT): Alert message
- `severity` (TEXT): Severity level (critical, high, medium, low, info)
- `status` (TEXT): Alert status (open, investigating, resolved, dismissed)
- `alert_type` (TEXT): Alert type (system, security, deadline, case, email, payment, integration)
- `source` (TEXT): Alert source
- `metadata` (JSONB): Additional metadata
- `notes` (JSONB): Alert notes array
- `resolved_by` (UUID, FK → auth.users): Resolver user
- `resolved_at` (TIMESTAMPTZ): Resolution time
- `created_at`, `updated_at` (TIMESTAMPTZ): Timestamps

**Relationships:**
- N:1 with auth.users (user_id, resolved_by)

**Indexes:**
- `idx_system_alerts_user_id` on user_id
- `idx_system_alerts_severity` on severity
- `idx_system_alerts_status` on status
- `idx_system_alerts_alert_type` on alert_type
- `idx_system_alerts_created_at` on created_at DESC
- `idx_system_alerts_resolved_at` on resolved_at DESC

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following general patterns:

### User-Owned Tables (clients, cases, emails, email_settings, email_templates, system_alerts)
- **SELECT**: Users can view their own data
- **INSERT**: Users can insert their own data
- **UPDATE**: Users can update their own data
- **DELETE**: Users can delete their own data

### Shared Templates (email_templates)
- **SELECT**: Users can view their own templates OR shared templates (is_shared = true)

### Public Data (case_law)
- **SELECT**: All authenticated users can view
- **INSERT/UPDATE/DELETE**: Only admins can modify

### System-Wide Alerts (system_alerts)
- **SELECT**: Users can view their own alerts OR system-wide alerts (user_id IS NULL)

## Triggers

All tables have automatic `updated_at` triggers that update the timestamp on every UPDATE operation.

## Data Types

- **UUID**: Primary keys and foreign keys
- **TEXT**: String fields
- **TEXT[]**: Array fields for multiple values
- **JSONB**: JSON fields for flexible data structures
- **BOOLEAN**: Boolean flags
- **INTEGER**: Numeric fields
- **TIMESTAMPTZ**: Timestamps with timezone
- **DATE**: Date-only fields

## Performance Optimizations

1. **Indexes on Foreign Keys**: All foreign key columns are indexed
2. **Indexes on Query Filters**: Common filter columns (status, priority, severity) are indexed
3. **Composite Indexes**: Multi-column queries are optimized
4. **Full-Text Search**: GIN indexes on text fields for search functionality
5. **Array Indexes**: GIN indexes on array columns for efficient array operations
6. **Descending Indexes**: Time-based columns indexed in descending order for recent-first queries

## Migration Naming Convention

Migrations follow the pattern: `YYYYMMDDHHMMSS_description.sql`

Example: `20250109000001_create_docketchief_schema.sql`

## Future Considerations

1. **Partitioning**: Consider partitioning emails table by date for large datasets
2. **Archiving**: Implement archiving strategy for closed cases and old emails
3. **Audit Logging**: Consider adding audit tables for compliance
4. **Document Storage**: Add documents table for file attachments
5. **Calendar Events**: Add events/deadlines table for calendar integration
6. **Billing**: Add billing/invoicing tables
7. **Time Tracking**: Add time entries table for billable hours

## See Also

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
