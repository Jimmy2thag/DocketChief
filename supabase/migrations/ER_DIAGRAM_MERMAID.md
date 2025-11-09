# DocketChief Entity Relationship Diagram (Mermaid)

This file contains the database schema visualization in Mermaid format.

## Full Schema Diagram

```mermaid
erDiagram
    AUTH_USERS ||--o{ CLIENTS : "has many"
    AUTH_USERS ||--o{ CASES : "has many"
    AUTH_USERS ||--o{ EMAILS : "has many"
    AUTH_USERS ||--o| EMAIL_SETTINGS : "has one"
    AUTH_USERS ||--o{ EMAIL_TEMPLATES : "has many"
    AUTH_USERS ||--o{ SYSTEM_ALERTS : "receives many"
    
    CLIENTS ||--o{ CASES : "has many"
    CLIENTS ||--o{ EMAILS : "related to"
    CASES ||--o{ EMAILS : "related to"
    
    AUTH_USERS {
        uuid id PK
        text email
        timestamptz created_at
    }
    
    CLIENTS {
        uuid id PK
        uuid attorney_id FK
        text first_name
        text last_name
        text name "GENERATED"
        text email
        text phone
        text address
        text city
        text state
        text zip_code
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
    
    CASES {
        uuid id PK
        uuid attorney_id FK
        uuid client_id FK
        text title
        text case_number
        text description
        text case_type
        text status "CHECK(active|pending|closed|archived)"
        text priority "CHECK(low|medium|high|urgent)"
        text court
        text judge
        text opposing_counsel
        timestamptz start_date
        timestamptz end_date
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }
    
    EMAILS {
        uuid id PK
        uuid user_id FK
        uuid case_id FK
        uuid client_id FK
        text message_id
        text thread_id
        text subject
        text from_email
        text[] to_emails
        text[] cc_emails
        text[] bcc_emails
        text body_html
        text body_text
        boolean is_encrypted
        text provider
        text direction "CHECK(inbound|outbound)"
        text status "CHECK(draft|sent|failed|delivered|bounced)"
        jsonb attachments
        jsonb metadata
        timestamptz sent_at
        timestamptz received_at
        timestamptz read_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    EMAIL_SETTINGS {
        uuid id PK
        uuid user_id FK "UNIQUE"
        text provider "CHECK(none|gmail|outlook|smtp|exchange)"
        text smtp_host
        integer smtp_port
        text smtp_user
        text smtp_password_encrypted
        text imap_host
        integer imap_port
        boolean auto_categorize
        boolean encryption_enabled
        text signature_html
        text signature_text
        jsonb settings
        timestamptz last_sync_at
        timestamptz created_at
        timestamptz updated_at
    }
    
    EMAIL_TEMPLATES {
        uuid id PK
        uuid user_id FK
        text name
        text subject
        text body_html
        text body_text
        jsonb variables
        text category
        boolean is_shared
        integer usage_count
        timestamptz created_at
        timestamptz updated_at
    }
    
    CASE_LAW {
        uuid id PK
        text case_name
        text citation
        text court
        text jurisdiction
        text court_level "CHECK(trial|appellate|supreme|district|circuit)"
        date decision_date
        text[] legal_issues
        text[] key_holdings
        text case_summary
        text outcome "CHECK(plaintiff|defendant|mixed|remanded|dismissed)"
        text precedential_value "CHECK(binding|persuasive|non-precedential)"
        text[] distinguishing_factors
        text[] strategic_implications
        text full_text
        text[] judges
        text[] parties
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }
    
    SYSTEM_ALERTS {
        uuid id PK
        uuid user_id FK "nullable"
        text title
        text message
        text severity "CHECK(critical|high|medium|low|info)"
        text status "CHECK(open|investigating|resolved|dismissed)"
        text alert_type "CHECK(system|security|deadline|case|email|payment|integration)"
        text source
        jsonb metadata
        jsonb notes
        uuid resolved_by FK
        timestamptz resolved_at
        timestamptz created_at
        timestamptz updated_at
    }
```

## Simplified Core Relationships

```mermaid
graph TD
    A[auth.users] -->|attorney_id| B[clients]
    A -->|attorney_id| C[cases]
    A -->|user_id| D[emails]
    A -->|user_id| E[email_settings]
    A -->|user_id| F[email_templates]
    A -->|user_id| H[system_alerts]
    
    B -->|client_id| C
    B -->|client_id| D
    C -->|case_id| D
    
    G[case_law] -.->|reference only| A
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#fff4e1
    style D fill:#e8f5e9
    style E fill:#e8f5e9
    style F fill:#e8f5e9
    style G fill:#f3e5f5
    style H fill:#ffebee
```

## Table Dependency Order (for migrations)

```mermaid
graph LR
    A[1. auth.users] --> B[2. clients]
    A --> C[3. cases]
    B --> C
    A --> D[4. email_settings]
    A --> E[5. email_templates]
    A --> F[6. emails]
    C --> F
    B --> F
    A --> G[7. system_alerts]
    H[8. case_law - independent]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#2196F3
    style D fill:#FF9800
    style E fill:#FF9800
    style F fill:#FF9800
    style G fill:#F44336
    style H fill:#9C27B0
```

## Data Flow: Email Integration

```mermaid
sequenceDiagram
    participant U as User
    participant A as Application
    participant ES as email_settings
    participant ET as email_templates
    participant E as emails
    participant C as cases
    participant CL as clients
    
    U->>A: Configure Email
    A->>ES: Store settings
    
    U->>A: Create Template
    A->>ET: Save template
    
    U->>A: Send Email
    A->>ET: Load template
    A->>C: Get case details
    A->>CL: Get client details
    A->>E: Store email record
    E->>C: Link to case
    E->>CL: Link to client
```

## RLS Policy Flow

```mermaid
graph TD
    A[Query Request] --> B{Authenticated?}
    B -->|No| C[Deny Access]
    B -->|Yes| D{Check RLS Policy}
    D -->|User-owned tables| E{auth.uid = owner_id?}
    D -->|Shared tables| F{is_shared OR auth.uid = owner_id?}
    D -->|Public tables| G{Valid user?}
    D -->|System alerts| H{user_id = auth.uid OR user_id IS NULL?}
    
    E -->|Yes| I[Grant Access]
    E -->|No| C
    F -->|Yes| I
    F -->|No| C
    G -->|Yes| I
    G -->|No| C
    H -->|Yes| I
    H -->|No| C
    
    style A fill:#e3f2fd
    style I fill:#c8e6c9
    style C fill:#ffcdd2
```

## Index Strategy Visualization

```mermaid
graph TD
    subgraph "Primary Indexes"
        A[Primary Keys - UUID]
        B[Foreign Keys]
        C[Unique Constraints]
    end
    
    subgraph "Query Performance Indexes"
        D[Status/State Fields]
        E[Timestamp Fields DESC]
        F[Email/Phone Fields]
    end
    
    subgraph "Advanced Indexes"
        G[GIN - Full Text Search]
        H[GIN - Array Search]
        I[GIN - JSONB Search]
    end
    
    A --> J[Fast Lookups]
    B --> K[Fast Joins]
    C --> L[Unique Validation]
    D --> M[Filtered Queries]
    E --> N[Recent-First Sorting]
    F --> O[Contact Search]
    G --> P[Text Search]
    H --> Q[Array Contains]
    I --> R[JSON Queries]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style E fill:#9C27B0
    style F fill:#9C27B0
    style G fill:#F44336
    style H fill:#F44336
    style I fill:#F44336
```

## Usage Examples

### Viewing in GitHub
GitHub automatically renders Mermaid diagrams in markdown files. View this file on GitHub to see the diagrams.

### Viewing Locally
1. Use VS Code with Mermaid extension
2. Use online editor: https://mermaid.live/
3. Use Mermaid CLI: `mmdc -i ER_DIAGRAM_MERMAID.md -o diagram.png`

### Exporting Diagrams
```bash
# Install Mermaid CLI
npm install -g @mermaid-js/mermaid-cli

# Generate PNG
mmdc -i supabase/migrations/ER_DIAGRAM_MERMAID.md -o er-diagram.png

# Generate SVG
mmdc -i supabase/migrations/ER_DIAGRAM_MERMAID.md -o er-diagram.svg -b transparent
```

## References

- [Mermaid Documentation](https://mermaid.js.org/)
- [Entity Relationship Diagrams in Mermaid](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
- [GitHub Mermaid Support](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)
