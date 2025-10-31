# Stripe Webhook Setup Guide

## Overview
This guide explains how to set up Stripe webhooks to automatically update subscription status in your database when payment events occur.

## What Webhooks Handle
- **Subscription Created**: New subscription started
- **Subscription Updated**: Plan changed, payment method updated
- **Subscription Deleted**: Subscription canceled
- **Payment Succeeded**: Successful payment processed
- **Payment Failed**: Payment attempt failed

## Setup Steps

### 1. Create Database Tables
Run these SQL commands in your Supabase SQL Editor:

```sql
-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_id TEXT,
  plan_name TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_stripe_customer_id ON payment_history(stripe_customer_id);
```

### 2. Local Development Testing
Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Copy the webhook signing secret (whsec_...) and add to .env:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 3. Production Deployment

#### Option A: Supabase Edge Function (Recommended)
1. Create `supabase/functions/stripe-webhook/index.ts`
2. Copy the webhook handler code from `src/lib/stripeWebhookHandler.ts`
3. Deploy: `supabase functions deploy stripe-webhook`
4. Set secret: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx`
5. Get endpoint URL from Supabase dashboard

#### Option B: Custom API Endpoint
Deploy the webhook handler to your backend service and expose it at `/api/stripe-webhook`

### 4. Configure Stripe Dashboard
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Development: Use Stripe CLI forwarding URL
   - Production: `https://your-domain.com/functions/v1/stripe-webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
5. Copy the webhook signing secret
6. Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## Testing Webhooks

### Test with Stripe CLI
```bash
# Trigger a test event
stripe trigger customer.subscription.created

# Trigger payment success
stripe trigger invoice.payment_succeeded

# Trigger payment failure
stripe trigger invoice.payment_failed
```

### Test in Stripe Dashboard
1. Go to Developers > Webhooks
2. Click on your endpoint
3. Click "Send test webhook"
4. Select event type and send

## Webhook Handler Flow

```
Stripe Event → Webhook Endpoint → Verify Signature → Process Event → Update Database
```

1. **Receive Event**: Stripe sends POST request to webhook URL
2. **Verify Signature**: Validate request came from Stripe
3. **Parse Event**: Extract event type and data
4. **Update Database**: Insert/update subscription or payment records
5. **Return Response**: Send 200 OK to acknowledge receipt

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is publicly accessible
- Verify webhook is enabled in Stripe Dashboard
- Check Stripe Dashboard > Webhooks > Recent events for errors

### Signature Verification Failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret in Stripe Dashboard
- Check webhook secret is for the correct environment (test vs live)

### Database Updates Failing
- Verify tables exist in Supabase
- Check Supabase logs for errors
- Ensure proper permissions on tables

## Security Best Practices
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Keep webhook secrets secure
- Log all webhook events for debugging
- Implement idempotency to handle duplicate events
