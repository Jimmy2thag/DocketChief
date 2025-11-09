-- DocketChief Database Schema Migration
-- Created: 2025-01-09
-- Description: Complete database schema with 7 core tables, RLS policies, and indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: clients
-- Description: Store client information for attorneys
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attorney_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on attorney_id for faster lookups
CREATE INDEX idx_clients_attorney_id ON clients(attorney_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients"
    ON clients FOR SELECT
    USING (auth.uid() = attorney_id);

CREATE POLICY "Users can insert their own clients"
    ON clients FOR INSERT
    WITH CHECK (auth.uid() = attorney_id);

CREATE POLICY "Users can update their own clients"
    ON clients FOR UPDATE
    USING (auth.uid() = attorney_id)
    WITH CHECK (auth.uid() = attorney_id);

CREATE POLICY "Users can delete their own clients"
    ON clients FOR DELETE
    USING (auth.uid() = attorney_id);

-- =====================================================
-- TABLE: cases
-- Description: Store legal case information
-- =====================================================
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attorney_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    case_number TEXT,
    description TEXT,
    case_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    priority TEXT NOT NULL DEFAULT 'medium',
    court TEXT,
    judge TEXT,
    opposing_counsel TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('active', 'pending', 'closed', 'archived')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Create indexes for cases
CREATE INDEX idx_cases_attorney_id ON cases(attorney_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_start_date ON cases(start_date DESC);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cases
CREATE POLICY "Users can view their own cases"
    ON cases FOR SELECT
    USING (auth.uid() = attorney_id);

CREATE POLICY "Users can insert their own cases"
    ON cases FOR INSERT
    WITH CHECK (auth.uid() = attorney_id);

CREATE POLICY "Users can update their own cases"
    ON cases FOR UPDATE
    USING (auth.uid() = attorney_id)
    WITH CHECK (auth.uid() = attorney_id);

CREATE POLICY "Users can delete their own cases"
    ON cases FOR DELETE
    USING (auth.uid() = attorney_id);

-- =====================================================
-- TABLE: email_settings
-- Description: Store email provider settings for users
-- =====================================================
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'none',
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_password_encrypted TEXT,
    imap_host TEXT,
    imap_port INTEGER,
    auto_categorize BOOLEAN NOT NULL DEFAULT true,
    encryption_enabled BOOLEAN NOT NULL DEFAULT false,
    signature_html TEXT,
    signature_text TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_provider CHECK (provider IN ('none', 'gmail', 'outlook', 'smtp', 'exchange'))
);

-- Create indexes for email_settings
CREATE INDEX idx_email_settings_user_id ON email_settings(user_id);
CREATE INDEX idx_email_settings_provider ON email_settings(provider);

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_settings
CREATE POLICY "Users can view their own email settings"
    ON email_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email settings"
    ON email_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email settings"
    ON email_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email settings"
    ON email_settings FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: email_templates
-- Description: Store reusable email templates
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '{}'::jsonb,
    category TEXT,
    is_shared BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for email_templates
CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_shared ON email_templates(is_shared);
CREATE INDEX idx_email_templates_created_at ON email_templates(created_at DESC);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Users can view their own templates"
    ON email_templates FOR SELECT
    USING (auth.uid() = user_id OR is_shared = true);

CREATE POLICY "Users can insert their own templates"
    ON email_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON email_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON email_templates FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: emails
-- Description: Store sent and received emails
-- =====================================================
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    message_id TEXT,
    thread_id TEXT,
    subject TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_emails TEXT[] NOT NULL,
    cc_emails TEXT[],
    bcc_emails TEXT[],
    body_html TEXT,
    body_text TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    provider TEXT NOT NULL DEFAULT 'smtp',
    direction TEXT NOT NULL DEFAULT 'outbound',
    status TEXT NOT NULL DEFAULT 'sent',
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_direction CHECK (direction IN ('inbound', 'outbound')),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'sent', 'failed', 'delivered', 'bounced'))
);

-- Create indexes for emails
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_case_id ON emails(case_id);
CREATE INDEX idx_emails_client_id ON emails(client_id);
CREATE INDEX idx_emails_thread_id ON emails(thread_id);
CREATE INDEX idx_emails_direction ON emails(direction);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX idx_emails_from_email ON emails(from_email);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emails
CREATE POLICY "Users can view their own emails"
    ON emails FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own emails"
    ON emails FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails"
    ON emails FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails"
    ON emails FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: case_law
-- Description: Store legal case law database
-- =====================================================
CREATE TABLE IF NOT EXISTS case_law (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_name TEXT NOT NULL,
    citation TEXT NOT NULL,
    court TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    court_level TEXT NOT NULL,
    decision_date DATE NOT NULL,
    legal_issues TEXT[] NOT NULL DEFAULT '{}',
    key_holdings TEXT[] NOT NULL DEFAULT '{}',
    case_summary TEXT,
    outcome TEXT NOT NULL,
    precedential_value TEXT NOT NULL,
    distinguishing_factors TEXT[] DEFAULT '{}',
    strategic_implications TEXT[] DEFAULT '{}',
    full_text TEXT,
    judges TEXT[],
    parties TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_court_level CHECK (court_level IN ('trial', 'appellate', 'supreme', 'district', 'circuit')),
    CONSTRAINT valid_outcome CHECK (outcome IN ('plaintiff', 'defendant', 'mixed', 'remanded', 'dismissed')),
    CONSTRAINT valid_precedential_value CHECK (precedential_value IN ('binding', 'persuasive', 'non-precedential'))
);

-- Create indexes for case_law
CREATE INDEX idx_case_law_citation ON case_law(citation);
CREATE INDEX idx_case_law_jurisdiction ON case_law(jurisdiction);
CREATE INDEX idx_case_law_court_level ON case_law(court_level);
CREATE INDEX idx_case_law_decision_date ON case_law(decision_date DESC);
CREATE INDEX idx_case_law_outcome ON case_law(outcome);
CREATE INDEX idx_case_law_precedential_value ON case_law(precedential_value);
CREATE INDEX idx_case_law_case_name ON case_law USING gin(to_tsvector('english', case_name));
CREATE INDEX idx_case_law_legal_issues ON case_law USING gin(legal_issues);
CREATE INDEX idx_case_law_full_text ON case_law USING gin(to_tsvector('english', full_text));

-- Enable RLS (case law is public data)
ALTER TABLE case_law ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_law (readable by all authenticated users)
CREATE POLICY "Authenticated users can view case law"
    ON case_law FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update/delete case law
CREATE POLICY "Admins can insert case law"
    ON case_law FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can update case law"
    ON case_law FOR UPDATE
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');

CREATE POLICY "Admins can delete case law"
    ON case_law FOR DELETE
    USING (auth.jwt()->>'role' = 'admin');

-- =====================================================
-- TABLE: system_alerts
-- Description: Store system alerts and notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    alert_type TEXT NOT NULL DEFAULT 'system',
    source TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_severity CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    CONSTRAINT valid_alert_type CHECK (alert_type IN ('system', 'security', 'deadline', 'case', 'email', 'payment', 'integration'))
);

-- Create indexes for system_alerts
CREATE INDEX idx_system_alerts_user_id ON system_alerts(user_id);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_status ON system_alerts(status);
CREATE INDEX idx_system_alerts_alert_type ON system_alerts(alert_type);
CREATE INDEX idx_system_alerts_created_at ON system_alerts(created_at DESC);
CREATE INDEX idx_system_alerts_resolved_at ON system_alerts(resolved_at DESC);

-- Enable RLS
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_alerts
CREATE POLICY "Users can view their own alerts and system-wide alerts"
    ON system_alerts FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert alerts"
    ON system_alerts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own alerts"
    ON system_alerts FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own alerts"
    ON system_alerts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON email_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_law_updated_at BEFORE UPDATE ON case_law
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_alerts_updated_at BEFORE UPDATE ON system_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE clients IS 'Stores client information for attorneys';
COMMENT ON TABLE cases IS 'Stores legal case information and tracks case status';
COMMENT ON TABLE email_settings IS 'Stores email provider configuration for users';
COMMENT ON TABLE email_templates IS 'Stores reusable email templates for users';
COMMENT ON TABLE emails IS 'Stores sent and received emails with case/client associations';
COMMENT ON TABLE case_law IS 'Stores legal case law database for research';
COMMENT ON TABLE system_alerts IS 'Stores system alerts and notifications for users';

-- End of migration
