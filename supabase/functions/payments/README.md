# Payments Edge Function

This Supabase Edge Function provides Stripe payment integration for subscriptions, payment intents, and webhook handling.

## Features

- **Payment Intents**: Create one-time payment intents
- **Subscriptions**: Create and manage Stripe subscriptions
- **Customer Management**: Create Stripe customers
- **Subscription Cancellation**: Cancel subscriptions at period end
- **Webhook Handling**: Process Stripe webhook events

## Environment Variables

Required environment variables (set in Supabase dashboard or `.env`):

```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com
```

## Operations

### 1. Create Payment Intent

Create a one-time payment intent.

**Request:**
```json
{
  "op": "create_payment_intent",
  "amount": 4999,
  "currency": "usd",
  "customerEmail": "customer@example.com"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### 2. Create Customer

Create a Stripe customer.

**Request:**
```json
{
  "op": "create_customer",
  "email": "customer@example.com",
  "name": "John Doe",
  "metadata": {
    "userId": "123"
  }
}
```

**Response:**
```json
{
  "customerId": "cus_xxx"
}
```

### 3. Create Subscription

Create a subscription for a customer.

**Request:**
```json
{
  "op": "create_subscription",
  "customerId": "cus_xxx",
  "priceId": "price_xxx"
}
```

**Response:**
```json
{
  "subscriptionId": "sub_xxx",
  "clientSecret": "pi_xxx_secret_xxx"
}
```

### 4. Cancel Subscription

Cancel a subscription at the end of the billing period.

**Request:**
```json
{
  "op": "cancel_subscription",
  "subscriptionId": "sub_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "subscriptionId": "sub_xxx",
  "cancelAtPeriodEnd": true
}
```

### 5. Get Subscription

Retrieve subscription details.

**Request:**
```json
{
  "op": "get_subscription",
  "subscriptionId": "sub_xxx"
}
```

**Response:**
```json
{
  "subscription": {
    "id": "sub_xxx",
    "status": "active",
    "current_period_end": 1699999999,
    ...
  }
}
```

### 6. Webhook Handler

Process Stripe webhook events (typically called by Stripe, not directly).

**Request:**
Stripe sends webhook events with signature in header `stripe-signature`.

**Response:**
```json
{
  "received": true,
  "eventType": "customer.subscription.created"
}
```

## Stripe Setup

### 1. Create Stripe Account

1. Sign up at [Stripe](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Add `STRIPE_SECRET_KEY` to environment variables

### 2. Create Products and Prices

In Stripe Dashboard:

1. Go to Products
2. Create products for each plan:
   - Basic: $49.99/month
   - Professional: $99.99/month
   - Enterprise: $199.99/month
3. Copy Price IDs for use in your application

### 3. Setup Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/payments`
3. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Add `STRIPE_WEBHOOK_SECRET` to environment variables

## Usage Example

```typescript
import { supabase } from '@/lib/supabase'

// Create a customer
const { data: customer } = await supabase.functions.invoke('payments', {
  body: { 
    op: 'create_customer',
    email: 'user@example.com',
    name: 'John Doe'
  }
})

// Create a payment intent
const { data: intent } = await supabase.functions.invoke('payments', {
  body: { 
    op: 'create_payment_intent',
    amount: 4999,
    currency: 'usd',
    customerEmail: 'user@example.com'
  }
})

// Create a subscription
const { data: subscription } = await supabase.functions.invoke('payments', {
  body: { 
    op: 'create_subscription',
    customerId: customer.customerId,
    priceId: 'price_xxx'
  }
})

// Cancel subscription
const { data: result } = await supabase.functions.invoke('payments', {
  body: { 
    op: 'cancel_subscription',
    subscriptionId: subscription.subscriptionId
  }
})
```

## Frontend Integration

Use Stripe Elements for secure card input:

```typescript
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement } from '@stripe/react-stripe-js'

const stripePromise = loadStripe('pk_test_...')

// In your component
const { data } = await supabase.functions.invoke('payments', {
  body: { op: 'create_payment_intent', amount: 4999 }
})

const result = await stripe.confirmCardPayment(data.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: { email: 'user@example.com' }
  }
})
```

## Database Schema

For webhook processing, create these tables:

```sql
CREATE TABLE subscriptions (
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

CREATE TABLE payment_history (
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
```

## Error Handling

Error responses include descriptive messages:

```json
{
  "error": "Description of the error"
}
```

HTTP status codes:
- `400`: Invalid request parameters
- `500`: Server configuration error
- `502`: Stripe API error

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Test webhooks locally:
```bash
stripe listen --forward-to localhost:54321/functions/v1/payments
```

## Security

- Never expose secret keys in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Implement proper authentication before creating payments
- Validate amounts server-side
