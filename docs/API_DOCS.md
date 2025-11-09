# API Documentation

## Table of Contents

1. [AI Services](#ai-services)
2. [Email Services](#email-services)
3. [Payment Services](#payment-services)
4. [Analytics Services](#analytics-services)
5. [Supabase Edge Functions](#supabase-edge-functions)

---

## AI Services

### `AIService.sendMessage()`

Send a message to the AI assistant and get a response.

**Parameters:**
- `messages`: `ChatMessage[]` - Array of chat messages
- `provider`: `'openai' | 'gemini'` - AI provider to use
- `userIdentifier`: `string` - User identifier for rate limiting

**Returns:** `Promise<AIServiceResponse>`

```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIServiceResponse {
  response: string;
  provider: string;
  error?: 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR';
}
```

**Example:**
```typescript
import { AIService } from '@/lib/aiService';

const messages = [
  { role: 'user', content: 'What is a motion to dismiss?' }
];

const response = await AIService.sendMessage(messages, 'openai', 'user123');
console.log(response.response);
```

### `AIService.getServiceStatus()`

Get the current status of the AI service.

**Returns:** `AIServiceStatus`

```typescript
interface AIServiceStatus {
  available: boolean;
  provider: string;
  message: string;
  lastChecked: Date | null;
}
```

**Example:**
```typescript
const status = AIService.getServiceStatus();
console.log(status.available); // true/false
```

### `legalAiChat()`

Low-level function to invoke the legal-ai-chat Supabase Edge Function.

**Parameters:**
- `req`: `ChatRequest` - Chat request object

**Returns:** `Promise<ChatResponse>`

```typescript
interface ChatRequest {
  messages: ChatMessage[];
  system?: string;
  model?: string;
  provider?: 'openai' | 'gemini';
  userIdentifier?: string;
}

interface ChatResponse {
  content: string;
  usage?: any;
}
```

---

## Email Services

### `EmailService.getInstance()`

Get the singleton instance of the EmailService.

**Returns:** `EmailService`

### `emailService.sendAlert()`

Send an alert email (queued for batch processing).

**Parameters:**
- `alertData`: `AlertData` - Alert information

**Returns:** `Promise<boolean>`

```typescript
interface AlertData {
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details?: any;
  timestamp: string;
}
```

**Example:**
```typescript
import { EmailService } from '@/lib/emailService';

const emailService = EmailService.getInstance();

await emailService.sendAlert({
  alertType: 'system_error',
  severity: 'high',
  message: 'Database connection failed',
  details: { error: 'Connection timeout' },
  timestamp: new Date().toISOString()
});
```

### `emailService.getFailedAlerts()`

Retrieve all failed alert attempts stored in localStorage.

**Returns:** `any[]`

### `emailService.clearFailedAlerts()`

Clear all failed alerts from localStorage.

**Returns:** `void`

### `emailService.testEmailService()`

Send a test alert to verify email service functionality.

**Returns:** `Promise<boolean>`

---

## Payment Services

### `createPaymentIntent()`

Create a Stripe payment intent.

**Parameters:**
- `req`: `PaymentIntentRequest` - Payment intent request

**Returns:** `Promise<any>`

```typescript
interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  customerEmail?: string;
}
```

**Example:**
```typescript
import { createPaymentIntent } from '@/lib/stripeService';

const paymentIntent = await createPaymentIntent({
  amount: 5000, // $50.00
  currency: 'usd',
  customerEmail: 'customer@example.com'
});

console.log(paymentIntent.clientSecret);
```

**Note:** Payments must be enabled by setting `VITE_PAYMENTS_ENABLED=true`.

---

## Analytics Services

### `calculateMRR()`

Calculate Monthly Recurring Revenue from subscriptions.

**Parameters:**
- `subscriptions`: `any[]` - Array of subscription objects

**Returns:** `number`

**Example:**
```typescript
import { calculateMRR } from '@/lib/analyticsCalculations';

const subscriptions = [
  { status: 'active', amount: 100, interval: 'month' },
  { status: 'active', amount: 1200, interval: 'year' }
];

const mrr = calculateMRR(subscriptions);
console.log(mrr); // 200 (100 + 1200/12)
```

### `calculateChurnRate()`

Calculate churn rate for the current month.

**Parameters:**
- `subscriptions`: `any[]` - Array of subscription objects
- `payments`: `any[]` - Array of payment objects

**Returns:** `number` (percentage)

### `groupByPlan()`

Group active subscriptions by plan.

**Parameters:**
- `subscriptions`: `any[]` - Array of subscription objects

**Returns:** `Array<{ plan: string; count: number; revenue: number }>`

### `calculateMRRHistory()`

Calculate MRR history for the last 6 months.

**Parameters:**
- `payments`: `any[]` - Array of payment objects

**Returns:** `Array<{ month: string; mrr: number; newMrr: number; churnedMrr: number }>`

### Customer Lifetime Value (CLV)

#### `calculateAverageCLV()`

Calculate average CLV across all customers.

**Parameters:**
- `subscriptions`: `any[]`
- `payments`: `any[]`

**Returns:** `number`

#### `calculateAverageLifespan()`

Calculate average customer lifespan in months.

**Parameters:**
- `subscriptions`: `any[]`

**Returns:** `number`

#### `calculateCLVByPlan()`

Calculate CLV segmented by plan.

**Parameters:**
- `subscriptions`: `any[]`
- `payments`: `any[]`

**Returns:** `Array<{ plan: string; clv: number; customers: number }>`

#### `calculateCohortData()`

Calculate cohort analysis data.

**Parameters:**
- `subscriptions`: `any[]`
- `payments`: `any[]`

**Returns:** `Array<{ cohort: string; clv: number; retention: number }>`

---

## Supabase Edge Functions

### Legal AI Chat (`legal-ai-chat`)

**Endpoint:** `https://[project-ref].supabase.co/functions/v1/legal-ai-chat`

**Method:** `POST`

**Headers:**
- `Authorization: Bearer [anon-key]`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What is a motion to dismiss?" }
  ],
  "system": "You are a legal assistant...",
  "model": "gpt-4o-mini",
  "provider": "openai"
}
```

**Response:**
```json
{
  "content": "A motion to dismiss is...",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 50,
    "total_tokens": 70
  }
}
```

**Error Responses:**

- **400 Bad Request:** Message is required
- **500 Internal Server Error:** OPENAI_API_KEY missing
- **502 Bad Gateway:** OpenAI request failed

**Environment Variables:**
- `OPENAI_API_KEY` - Required for OpenAI integration
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

**CORS:**
- Supports preflight OPTIONS requests
- Returns appropriate CORS headers based on origin

---

## Error Handling

All API functions follow consistent error handling:

1. **Success:** Return data or success status
2. **Validation Error:** Throw descriptive error
3. **Service Error:** Catch and handle gracefully, return error response
4. **Network Error:** Retry logic where appropriate

**Example Error Handling:**
```typescript
try {
  const result = await AIService.sendMessage(messages, 'openai', 'user123');
  
  if (result.error) {
    // Handle specific error types
    switch (result.error) {
      case 'RATE_LIMITED':
        console.log('Rate limited, try again later');
        break;
      case 'SERVICE_UNAVAILABLE':
        console.log('Service temporarily unavailable');
        break;
      default:
        console.log('Unknown error occurred');
    }
  } else {
    console.log(result.response);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

---

## Rate Limiting

- AI services implement automatic rate limit detection
- Email service implements queue-based batch processing
- Retry logic with exponential backoff where appropriate

---

## Authentication

All API calls should be authenticated using Supabase authentication:

```typescript
import { supabase } from '@/lib/supabase';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Use user.id for personalized API calls
if (user) {
  await AIService.sendMessage(messages, 'openai', user.id);
}
```

---

## Testing

All API functions have comprehensive unit and integration tests. See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for details.

---

## Support

For API issues or questions, please open an issue on GitHub.
