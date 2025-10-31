# Stripe Payment Integration Guide

## Overview
This application includes a complete Stripe payment integration with:
- Subscription checkout flow
- Payment methods management
- Billing history tracking
- Webhook handling for subscription events

## Setup Instructions

### 1. Stripe Account Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the following environment variables:
   - `VITE_STRIPE_PUBLISHABLE_KEY` (already configured)
   - `STRIPE_SECRET_KEY` (already configured)

### 2. Create Stripe Products & Prices
In your Stripe Dashboard, create products for each plan:

**Basic Plan**
- Price: $49.99/month
- Price ID: `price_basic_monthly`

**Professional Plan**
- Price: $99.99/month
- Price ID: `price_pro_monthly`

**Enterprise Plan**
- Price: $199.99/month
- Price ID: `price_enterprise_monthly`

### 3. Database Setup
Create the required tables in Supabase:

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

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
```

### 4. Webhook Configuration
Set up webhooks in Stripe Dashboard to handle subscription events:

**Development Webhook URL**: Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

**Production Webhook URL**: Deploy the webhook handler as a Supabase Edge Function or API endpoint.

**Events to Subscribe**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_method.attached`
- `payment_method.detached`

**Get Webhook Secret**: After creating the webhook endpoint in Stripe Dashboard, copy the webhook signing secret and add it as an environment variable:
- `STRIPE_WEBHOOK_SECRET`

### 5. Edge Function Setup (Required for Production)

The webhook handler is implemented in `src/lib/stripeWebhookHandler.ts`. To deploy as a Supabase Edge Function:

```typescript
// supabase/functions/stripe-webhook/index.ts
import { handleStripeWebhook } from './stripeWebhookHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }

    const body = await req.text();
    
    // Verify webhook signature using Stripe SDK or manual verification
    // Then parse and handle the event
    const event = JSON.parse(body);
    await handleStripeWebhook(event);

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
```

Deploy the function:
```bash
supabase functions deploy stripe-webhook
```

Set the webhook secret:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```


## Components

### PaymentPortal
Main component with three tabs:
- **Subscription Plans**: View and subscribe to plans
- **Payment Methods**: Manage saved cards
- **Billing History**: View past invoices

### StripeCheckout
Secure checkout form with card validation.

### PaymentMethodsManager
Add, remove, and set default payment methods.

### SubscriptionManager
Manage subscription lifecycle (upgrade, cancel, reactivate).

## Usage

```tsx
import { PaymentPortal } from '@/components/PaymentPortal';

function App() {
  return <PaymentPortal />;
}
```

## Security Notes
- Never expose Stripe secret keys in frontend code
- Always validate webhooks using Stripe signatures
- Use HTTPS for all payment-related endpoints
- Implement proper authentication before allowing subscriptions

## Testing
Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155
