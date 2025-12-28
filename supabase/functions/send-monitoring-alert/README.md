# Send Monitoring Alert Edge Function

This Supabase Edge Function sends email alerts for monitoring and critical events in the DocketChief system.

## Features

- **Email Alerts**: Send monitoring alerts via email
- **Severity Levels**: Support for critical, high, medium, and low severity
- **Rich Content**: Include structured details in alerts
- **Queue Management**: Handle alerts asynchronously
- **Error Logging**: Log failed alerts for review

## Environment Variables

Required environment variables (set in Supabase dashboard or `.env`):

```bash
ALERT_EMAIL=admin@docketchief.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=alerts@docketchief.com
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com
```

## Email Service Setup

### Gmail SMTP

1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use credentials:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASSWORD=generated-app-password`

### SendGrid

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Use SMTP relay:
   - `SMTP_HOST=smtp.sendgrid.net`
   - `SMTP_PORT=587`
   - `SMTP_USER=apikey`
   - `SMTP_PASSWORD=your-sendgrid-api-key`

### AWS SES

1. Set up AWS SES
2. Verify your domain or email
3. Get SMTP credentials
4. Use settings:
   - `SMTP_HOST=email-smtp.us-east-1.amazonaws.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-ses-username`
   - `SMTP_PASSWORD=your-ses-password`

## Request Format

**Request:**
```json
{
  "alertType": "System Error",
  "severity": "critical",
  "message": "Database connection failed",
  "details": {
    "error": "Connection timeout",
    "timestamp": "2024-01-15T10:30:00Z",
    "service": "database",
    "attempts": 3
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Required Fields:**
- `alertType`: Type/category of alert
- `severity`: One of: "critical", "high", "medium", "low"
- `message`: Main alert message
- `timestamp`: ISO timestamp of the event

**Optional Fields:**
- `details`: Additional structured information (object)

## Response

**Success:**
```json
{
  "success": true,
  "message": "Alert queued for delivery",
  "alertId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Email configuration missing. Required: ALERT_EMAIL, SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM"
}
```

## Severity Levels

- **critical**: System outages, security breaches, data loss
- **high**: Major functionality issues, performance degradation
- **medium**: Minor issues, warnings, unusual patterns
- **low**: Informational messages, routine notifications

## Email Format

Emails are formatted with:

**Subject:**
```
[SEVERITY] DocketChief Alert: Alert Type
```

**Body:**
```
Alert Type: System Error
Severity: critical
Timestamp: 2024-01-15T10:30:00Z

Message:
Database connection failed

Details:
{
  "error": "Connection timeout",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "database",
  "attempts": 3
}

---
This is an automated alert from DocketChief monitoring system.
```

## Usage Example

### From Frontend

```typescript
import { supabase } from '@/lib/supabase'

// Send critical alert
const { data } = await supabase.functions.invoke('send-monitoring-alert', {
  body: {
    alertType: 'Authentication Failure',
    severity: 'high',
    message: 'Multiple failed login attempts detected',
    details: {
      username: 'user@example.com',
      ipAddress: '192.168.1.1',
      attempts: 5,
      timeWindow: '5 minutes'
    },
    timestamp: new Date().toISOString()
  }
})

if (data?.success) {
  console.log('Alert sent:', data.alertId)
}
```

### Using Email Service Class

The `EmailService` class in `src/lib/emailService.ts` provides a convenient wrapper:

```typescript
import { EmailService } from '@/lib/emailService'

const emailService = EmailService.getInstance()

// Send alert
await emailService.sendAlert({
  alertType: 'Payment Failed',
  severity: 'medium',
  message: 'Stripe webhook processing failed',
  details: {
    webhookId: 'evt_123',
    error: 'Signature verification failed'
  },
  timestamp: new Date().toISOString()
})

// Test email service
const isWorking = await emailService.testEmailService()
console.log('Email service status:', isWorking)
```

## Common Alert Types

### System Alerts

```typescript
{
  alertType: 'Service Down',
  severity: 'critical',
  message: 'API endpoint not responding',
  details: {
    endpoint: '/api/cases',
    lastSuccessful: '2024-01-15T10:00:00Z',
    errorCode: 503
  }
}
```

### Security Alerts

```typescript
{
  alertType: 'Security Breach',
  severity: 'critical',
  message: 'Unauthorized access attempt detected',
  details: {
    userId: '123',
    resource: '/admin/users',
    ipAddress: '1.2.3.4'
  }
}
```

### Performance Alerts

```typescript
{
  alertType: 'High Latency',
  severity: 'medium',
  message: 'API response time exceeding threshold',
  details: {
    endpoint: '/api/search',
    avgLatency: '5000ms',
    threshold: '2000ms'
  }
}
```

### Business Alerts

```typescript
{
  alertType: 'Payment Processing',
  severity: 'high',
  message: 'Payment gateway error',
  details: {
    paymentId: 'pi_123',
    amount: 4999,
    error: 'Card declined'
  }
}
```

## Production Considerations

### Use Professional Email Service

For production, consider using:
- **SendGrid**: Reliable, good deliverability
- **AWS SES**: Cost-effective, scalable
- **Mailgun**: Feature-rich
- **Postmark**: Excellent for transactional emails

### Alternative Implementation

The current implementation logs alerts but doesn't actually send emails. To implement actual email sending:

1. **Using SendGrid API:**
```typescript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

await sgMail.send({
  to: alertEmail,
  from: smtpFrom,
  subject: emailSubject,
  text: emailBody
})
```

2. **Using Resend (Recommended for Deno):**
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: smtpFrom,
    to: alertEmail,
    subject: emailSubject,
    text: emailBody
  })
})
```

## Error Handling

- `400`: Missing required fields
- `500`: Email configuration error
- `503`: Email service temporarily unavailable

All errors are logged to console for debugging.

## Rate Limiting

Consider implementing rate limiting to prevent alert spam:

```typescript
// Example: Max 10 alerts per minute
const alertCache = new Map()
const RATE_LIMIT = 10
const RATE_WINDOW = 60000 // 1 minute

function checkRateLimit(alertType: string): boolean {
  const key = `${alertType}-${Date.now() - RATE_WINDOW}`
  const count = alertCache.get(key) || 0
  
  if (count >= RATE_LIMIT) {
    return false
  }
  
  alertCache.set(key, count + 1)
  return true
}
```

## Best Practices

1. **Alert Categorization**: Use clear, consistent alert types
2. **Severity Appropriateness**: Choose severity levels carefully
3. **Rich Details**: Include context in the details object
4. **Avoid Spam**: Implement rate limiting and alert deduplication
5. **Test Regularly**: Use the test endpoint to verify configuration
6. **Monitor Failures**: Check failed alerts in localStorage
7. **Use Dedicated Email**: Use a dedicated email for alerts

## Security

- Store SMTP credentials securely as environment variables
- Never expose credentials in frontend code
- Use app-specific passwords (not main account password)
- Implement authentication before allowing alert sending
- Sanitize alert content to prevent injection attacks
- Consider encrypting sensitive details
