# Edge Functions Deployment Guide

This guide covers the deployment of all 5 Supabase Edge Functions for DocketChief.

## Functions Overview

1. **email-integration** - Gmail/Outlook OAuth, sync, and send emails
2. **legal-research** - CourtListener API integration with AI summaries
3. **case-law-analysis** - AI-powered case law analysis
4. **payments** - Stripe payment and subscription management
5. **send-monitoring-alert** - Email alerts for monitoring events

## Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Supabase project created
- Required API keys and credentials (see Environment Variables section)

## Environment Variables

Configure these environment variables in your Supabase project dashboard under Settings → Edge Functions → Secrets:

### Core Variables (All Functions)
```bash
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com,https://www.docketchief.com
```

### Email Integration
```bash
GMAIL_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_google_client_secret
OUTLOOK_CLIENT_ID=your_microsoft_client_id
OUTLOOK_CLIENT_SECRET=your_microsoft_client_secret
OAUTH_REDIRECT_URI=https://docketchief.com/oauth/callback
```

### Legal Research
```bash
COURTLISTENER_API_TOKEN=your_courtlistener_token
```

### Payments
```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Monitoring Alerts
```bash
ALERT_EMAIL=admin@docketchief.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=alerts@docketchief.com
```

## Setting Environment Variables

### Via Supabase Dashboard
1. Go to your project dashboard
2. Navigate to Settings → Edge Functions
3. Click "Add new secret"
4. Enter variable name and value
5. Repeat for all required variables

### Via CLI
```bash
# Set individual secrets
supabase secrets set OPENAI_API_KEY=sk-...

# Set multiple secrets from .env file
supabase secrets set --env-file .env
```

## Deployment Steps

### 1. Link Your Project
```bash
supabase link --project-ref your-project-ref
```

### 2. Deploy All Functions
```bash
# Deploy all functions at once
supabase functions deploy email-integration
supabase functions deploy legal-research
supabase functions deploy case-law-analysis
supabase functions deploy payments
supabase functions deploy send-monitoring-alert
```

### 3. Deploy Individual Function
```bash
# Deploy a specific function
supabase functions deploy email-integration
```

## Verification

### Test Each Function

#### 1. Test email-integration
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/email-integration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"op":"oauth_url","provider":"gmail"}'
```

#### 2. Test legal-research
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/legal-research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"op":"search","query":"patent infringement","maxResults":5}'
```

#### 3. Test case-law-analysis
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/case-law-analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"caseText":"Test case text...","analysisType":"summary"}'
```

#### 4. Test payments
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"op":"create_payment_intent","amount":4999,"currency":"usd"}'
```

#### 5. Test send-monitoring-alert
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-monitoring-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"alertType":"Test","severity":"low","message":"Test alert","timestamp":"2024-01-15T10:00:00Z"}'
```

## Monitoring

### View Logs
```bash
# View logs for a specific function
supabase functions logs email-integration

# Stream logs in real-time
supabase functions logs email-integration --follow
```

### Check Function Status
```bash
# List all deployed functions
supabase functions list
```

## Common Issues

### 1. Function Not Found
**Problem:** 404 error when calling function
**Solution:** Ensure function is deployed: `supabase functions deploy <function-name>`

### 2. Environment Variable Missing
**Problem:** "OPENAI_API_KEY not configured" error
**Solution:** Set the required environment variable: `supabase secrets set OPENAI_API_KEY=sk-...`

### 3. CORS Error
**Problem:** CORS error in browser console
**Solution:** Add your domain to ALLOWED_ORIGINS: `supabase secrets set ALLOWED_ORIGINS=https://yourdomain.com`

### 4. Timeout Error
**Problem:** Function times out
**Solution:** Check external API connectivity and API key validity

### 5. Authentication Error
**Problem:** 401 Unauthorized
**Solution:** Include Authorization header with valid Supabase anon key

## Production Checklist

- [ ] All environment variables configured
- [ ] ALLOWED_ORIGINS set to production domain(s) only
- [ ] Using live API keys (not test keys)
- [ ] Stripe webhook endpoint configured
- [ ] CourtListener API token is valid
- [ ] OAuth redirect URIs match production URLs
- [ ] SMTP credentials are valid
- [ ] Functions tested with production data
- [ ] Logs monitored for errors
- [ ] Rate limiting considered
- [ ] Error tracking implemented

## Security Best Practices

1. **API Keys**
   - Never commit API keys to version control
   - Use separate keys for development and production
   - Rotate keys periodically

2. **CORS**
   - Restrict ALLOWED_ORIGINS to known domains
   - Don't use wildcards (*) in production

3. **Error Handling**
   - Don't expose stack traces or sensitive information
   - Log detailed errors server-side only
   - Return generic error messages to clients

4. **Authentication**
   - Validate Supabase JWT tokens for protected operations
   - Implement rate limiting to prevent abuse
   - Use RLS policies for database access

5. **Secrets Management**
   - Use Supabase secrets management
   - Never log secret values
   - Use environment-specific secrets

## Performance Optimization

1. **Caching**
   - Cache API responses where appropriate
   - Implement request deduplication
   - Use CDN for static responses

2. **Rate Limiting**
   - Implement rate limiting for expensive operations
   - Track API usage to avoid quota exhaustion
   - Use backoff strategies for external APIs

3. **Error Recovery**
   - Implement retry logic with exponential backoff
   - Handle partial failures gracefully
   - Queue failed operations for retry

## Cost Management

### OpenAI API
- Use gpt-4o-mini for cost-effective operations
- Implement token limits
- Cache common queries
- Monitor usage through OpenAI dashboard

### Stripe
- Use test mode for development
- Monitor webhook processing
- Track subscription metrics

### CourtListener
- Respect rate limits (5,000 requests/day free tier)
- Cache search results
- Consider paid tier for higher limits

## Support Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [CourtListener API](https://www.courtlistener.com/api/rest-info/)
- [Gmail API](https://developers.google.com/gmail/api)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)

## Rollback Procedure

If a deployment causes issues:

```bash
# View deployment history
supabase functions list --verbose

# Deploy previous version
git checkout <previous-commit>
supabase functions deploy <function-name>
```

## Next Steps

1. Set up monitoring and alerting
2. Implement comprehensive error tracking
3. Create automated tests for edge functions
4. Set up CI/CD pipeline for automated deployments
5. Document any custom configurations or modifications
