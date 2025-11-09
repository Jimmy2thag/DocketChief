# Email Integration Edge Function

This Supabase Edge Function provides email integration with Gmail and Outlook, supporting OAuth authentication, email syncing, and sending emails.

## Features

- **OAuth Authentication**: Generate OAuth URLs and exchange codes for tokens
- **Email Syncing**: Fetch emails from Gmail or Outlook accounts
- **Send Emails**: Send emails through Gmail or Outlook APIs
- **Multi-provider Support**: Works with both Gmail and Outlook/Office 365

## Environment Variables

Required environment variables (set in Supabase dashboard or `.env`):

```bash
# Gmail OAuth
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret

# Outlook OAuth
OUTLOOK_CLIENT_ID=your_microsoft_client_id
OUTLOOK_CLIENT_SECRET=your_microsoft_client_secret

# OAuth Redirect
OAUTH_REDIRECT_URI=http://localhost:5173/oauth/callback

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com
```

## Operations

### 1. Get OAuth URL

Generate an OAuth URL for user authentication.

**Request:**
```json
{
  "op": "oauth_url",
  "provider": "gmail"  // or "outlook"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "provider": "gmail"
}
```

### 2. Exchange OAuth Token

Exchange authorization code for access tokens.

**Request:**
```json
{
  "op": "oauth_token",
  "provider": "gmail",
  "code": "authorization_code_from_oauth_callback"
}
```

**Response:**
```json
{
  "accessToken": "ya29.a0...",
  "refreshToken": "1//0d...",
  "expiresIn": 3600,
  "provider": "gmail"
}
```

### 3. Sync Emails

Fetch emails from the user's account.

**Request:**
```json
{
  "op": "sync_emails",
  "provider": "gmail",
  "accessToken": "ya29.a0...",
  "maxResults": 10
}
```

**Response:**
```json
{
  "emails": [
    {
      "id": "msg123",
      "threadId": "thread123",
      "snippet": "Email preview...",
      "internalDate": "1699123456789",
      "headers": [...]
    }
  ],
  "count": 10
}
```

### 4. Send Email

Send an email through the user's account.

**Request:**
```json
{
  "op": "send_email",
  "provider": "gmail",
  "accessToken": "ya29.a0...",
  "message": {
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "Plain text body",
    "htmlBody": "<p>HTML body</p>"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg123"
}
```

## Setup Instructions

### Gmail Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI: `http://localhost:5173/oauth/callback`
6. Copy Client ID and Client Secret to environment variables

### Outlook Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Add redirect URI: `http://localhost:5173/oauth/callback`
4. Add API permissions: `Mail.Read`, `Mail.Send`, `offline_access`
5. Create a client secret
6. Copy Application (client) ID and secret to environment variables

## Usage Example

```typescript
import { supabase } from '@/lib/supabase'

// Get OAuth URL
const { data: urlData } = await supabase.functions.invoke('email-integration', {
  body: { op: 'oauth_url', provider: 'gmail' }
})

// After user authorizes, exchange code for tokens
const { data: tokenData } = await supabase.functions.invoke('email-integration', {
  body: { 
    op: 'oauth_token', 
    provider: 'gmail',
    code: authorizationCode 
  }
})

// Sync emails
const { data: emails } = await supabase.functions.invoke('email-integration', {
  body: { 
    op: 'sync_emails', 
    provider: 'gmail',
    accessToken: tokenData.accessToken,
    maxResults: 20
  }
})

// Send email
const { data: sendResult } = await supabase.functions.invoke('email-integration', {
  body: { 
    op: 'send_email', 
    provider: 'gmail',
    accessToken: tokenData.accessToken,
    message: {
      to: 'user@example.com',
      subject: 'Hello',
      body: 'Email body'
    }
  }
})
```

## Error Handling

All operations return appropriate HTTP status codes:
- `400`: Bad request (missing required parameters)
- `500`: Server configuration error (missing environment variables)
- `502`: External API error (Gmail/Outlook API failures)

Error responses include a descriptive error message:
```json
{
  "error": "Description of the error",
  "details": "Additional error information (if available)"
}
```

## Security Considerations

- Store access tokens securely (never in localStorage)
- Implement token refresh logic for long-lived sessions
- Use HTTPS in production
- Validate redirect URIs to prevent OAuth hijacking
- Consider implementing token encryption at rest
