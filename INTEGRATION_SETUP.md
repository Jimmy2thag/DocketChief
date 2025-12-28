# DocketChief API Integration Setup Guide

This document provides setup instructions for all real API integrations in DocketChief.

## Overview

All mock implementations have been replaced with real API integrations via Supabase Edge Functions. The following services are now integrated:

1. **Email Integration** (Gmail & Outlook OAuth)
2. **Legal Research** (CourtListener API)
3. **Payment Processing** (Stripe)
4. **Custom Report Generation** (Supabase Database)

## Prerequisites

- Supabase project set up
- Access to configure environment variables in Supabase Edge Functions
- API credentials for each service (see below)

## 1. Email Integration

### Gmail OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/functions/v1/email-integration/callback`
   - `http://localhost:5173/auth/callback` (for development)

6. Set environment variables in Supabase:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### Outlook OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Register a new application
4. Add Microsoft Graph API permissions: `Mail.Read`, `Mail.ReadWrite`
5. Add redirect URIs:
   - `https://your-project.supabase.co/functions/v1/email-integration/callback`
   - `http://localhost:5173/auth/callback` (for development)

6. Set environment variables in Supabase:
   ```bash
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

### Implementation Notes

- The `email-integration` edge function handles OAuth flows
- Access tokens should be stored securely in user sessions
- Email sync is triggered on-demand by the user
- Emails are stored in the `emails` table in Supabase

## 2. Legal Research (CourtListener API)

### CourtListener Setup

1. Create an account at [CourtListener](https://www.courtlistener.com/)
2. Generate an API token from your profile settings
3. Note the rate limits for your account tier

4. Set environment variables in Supabase:
   ```bash
   COURTLISTENER_API_TOKEN=your_api_token
   ```

### Edge Functions

- `legal-research`: Provides enhanced legal research with AI analysis
- `courtlistener-search`: Direct CourtListener API v4 integration

### API Usage

Both functions accept search queries and filters:
```javascript
const { data, error } = await supabase.functions.invoke('courtlistener-search', {
  body: { 
    searchParams: {
      query: 'contract breach',
      type: 'o',  // opinions
      court: 'scotus',
      filed_after: '2020-01-01',
      filed_before: '2024-12-31',
      order_by: 'score desc',
      page: 1,
      page_size: 20
    }
  }
});
```

### Rate Limiting

- CourtListener has rate limits based on your account tier
- Implement client-side throttling to avoid hitting limits
- Consider caching frequently accessed cases in your database

## 3. Stripe Payment Integration

### Stripe Setup

1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the Stripe Dashboard
3. For production, complete account verification

4. Set environment variables in Supabase:
   ```bash
   STRIPE_SECRET_KEY=sk_test_... or sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Stripe Checkout Flow

The `stripe-payment` edge function supports two modes:

#### 1. Checkout Session (Recommended)
Redirects to Stripe-hosted checkout page:

```javascript
const { data, error } = await supabase.functions.invoke('stripe-payment', {
  body: {
    action: 'create_checkout_session',
    amount: 99.99,
    currency: 'usd',
    planName: 'Pro Plan',
    customerEmail: 'user@example.com',
    userId: user.id,
    successUrl: `${window.location.origin}/payment-success`,
    cancelUrl: `${window.location.origin}/payment-cancel`
  }
});

// Redirect to Stripe Checkout
if (data.success) {
  window.location.href = data.url;
}
```

#### 2. Payment Intent
For custom payment forms with Stripe Elements:

```javascript
const { data, error } = await supabase.functions.invoke('stripe-payment', {
  body: {
    action: 'create_payment_intent',
    amount: 99.99,
    currency: 'usd',
    planName: 'Pro Plan',
    customerEmail: 'user@example.com',
    userId: user.id
  }
});

// Use clientSecret with Stripe Elements
```

### Webhook Setup

1. Configure webhook endpoint in Stripe Dashboard:
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`

2. Store webhook secret in environment variables

3. Implement webhook handler to update subscription status in your database

## 4. Custom Report Generation

### Database Setup

The `generate-report` edge function queries your Supabase database to generate reports. Ensure these tables exist:

- `cases` - Case information with outcomes
- `invoices` - Billing and revenue data
- `time_entries` - Time tracking data
- `deadlines` - Deadline compliance tracking
- `reports` - Stores generated report metadata

### Supabase Configuration

Set environment variables for the edge function:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Usage

```javascript
const { data, error } = await supabase.functions.invoke('generate-report', {
  body: {
    reportName: 'Monthly Performance',
    reportType: 'executive',
    dateRange: 'last-30-days',
    metrics: ['case-win-rate', 'revenue', 'time-tracking', 'deadline-compliance'],
    filters: ['practice-area', 'attorney'],
    userId: user.id
  }
});

// Report data is returned in data.reportData
// Report is also saved to the reports table
```

### Implemented Metrics

- `case-win-rate`: Win/loss ratio for cases
- `revenue`: Total revenue from paid invoices
- `time-tracking`: Total billable hours
- `deadline-compliance`: On-time completion rate

Additional metrics can be added by extending the edge function.

## Deployment Checklist

### Supabase Edge Functions

1. Deploy all edge functions:
   ```bash
   supabase functions deploy email-integration
   supabase functions deploy legal-research
   supabase functions deploy courtlistener-search
   supabase functions deploy stripe-payment
   supabase functions deploy generate-report
   ```

2. Set all required environment variables in Supabase Dashboard

3. Test each function individually with sample data

### Frontend Configuration

1. Ensure `.env` file has correct Supabase URL and keys
2. Build and deploy frontend application
3. Test OAuth flows end-to-end
4. Verify payment flows in Stripe test mode
5. Generate test reports to validate database queries

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **OAuth Tokens**: Store access tokens securely, refresh before expiry
3. **Payment Data**: Never handle raw credit card data; use Stripe Checkout or Elements
4. **Database Access**: Use Row Level Security (RLS) policies in Supabase
5. **CORS**: Configure `ALLOWED_ORIGINS` to restrict edge function access

## Monitoring and Logging

1. Monitor edge function logs in Supabase Dashboard
2. Set up Stripe webhook monitoring
3. Track CourtListener API usage to avoid rate limits
4. Monitor report generation performance for optimization

## Troubleshooting

### Email Integration Not Working
- Verify OAuth credentials are correct
- Check redirect URIs match exactly
- Ensure user has granted required permissions
- Check edge function logs for detailed errors

### Legal Research Returns No Results
- Verify CourtListener API token is valid
- Check API token has not exceeded rate limits
- Ensure search query is properly formatted
- Review CourtListener API documentation for query syntax

### Stripe Payments Failing
- Verify you're using correct API keys (test vs live)
- Check webhook secret matches Stripe Dashboard
- Ensure amounts are in correct format (dollars, not cents)
- Test with Stripe test card numbers first

### Report Generation Errors
- Verify required database tables exist
- Check user has data in date range
- Ensure Supabase service role key is set
- Review database RLS policies

## Support

For issues with:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **CourtListener**: [CourtListener API Docs](https://www.courtlistener.com/help/api/)
- **Stripe**: [Stripe Documentation](https://stripe.com/docs)
- **Google OAuth**: [Google Identity Platform](https://developers.google.com/identity)
- **Microsoft OAuth**: [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
