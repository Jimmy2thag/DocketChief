# DocketChief Security Implementation

This document describes the comprehensive security features implemented in DocketChief.

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [OAuth with PKCE](#oauth-with-pkce)
3. [Input Validation](#input-validation)
4. [Rate Limiting](#rate-limiting)
5. [Encrypted Storage](#encrypted-storage)
6. [CORS Configuration](#cors-configuration)
7. [Security Headers](#security-headers)
8. [Testing](#testing)

## Authentication Security

### Password Requirements

Strong password policy enforced:
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Email Validation

- Valid email format required
- Maximum 255 characters
- Automatically converted to lowercase
- Trimmed of whitespace

### Rate Limiting on Auth Endpoints

- Sign in: 5 attempts per 15 minutes
- Sign up: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour

## OAuth with PKCE

### Implementation

PKCE (Proof Key for Code Exchange) is enabled for all OAuth flows to prevent authorization code interception attacks.

```typescript
import { signInWithOAuth } from '@/lib/supabase';

// Sign in with Google
await signInWithOAuth('google');

// Sign in with GitHub
await signInWithOAuth('github');
```

### Supported Providers

- Google
- GitHub
- Azure AD

### Configuration

OAuth is configured in `src/lib/supabase.ts` with:
- PKCE flow enabled by default
- Automatic session detection
- Auto token refresh
- Secure storage

## Input Validation

All user inputs are validated using Zod schemas before processing.

### Available Schemas

- `emailSchema` - Email validation
- `passwordSchema` - Password strength validation
- `fullNameSchema` - Name validation with XSS prevention
- `signInSchema` - Sign in form validation
- `signUpSchema` - Sign up form validation
- `passwordResetRequestSchema` - Password reset validation
- `chatRequestSchema` - AI chat request validation

### Usage Example

```typescript
import { signUpSchema } from '@/lib/validation';

const result = signUpSchema.safeParse({
  email: 'user@example.com',
  password: 'StrongPass123!',
  fullName: 'John Doe',
});

if (!result.success) {
  console.error(result.error.errors);
}
```

## Rate Limiting

### Client-Side Rate Limiting

Rate limiting is implemented using localStorage to track request counts per user.

```typescript
import { authRateLimiter } from '@/lib/rateLimiter';

const { allowed, resetTime, remaining } = await authRateLimiter.checkLimit('signin');

if (!allowed) {
  console.log(`Rate limited. Try again at ${new Date(resetTime)}`);
}
```

### Server-Side Rate Limiting

Edge functions implement rate limiting per user/IP:
- 20 requests per minute for AI chat
- Automatic cleanup of expired entries
- Returns 429 status with Retry-After header

### Pre-configured Limiters

- `authRateLimiter` - 5 requests per 15 minutes
- `apiRateLimiter` - 60 requests per minute
- `passwordResetRateLimiter` - 3 requests per hour

## Encrypted Storage

Sensitive data is encrypted in browser storage using the Web Crypto API.

### Features

- AES-GCM encryption (256-bit)
- Unique IV for each encryption
- Automatic handling of corrupted data
- Support for strings and JSON objects

### Usage Example

```typescript
import { secureLocalStorage } from '@/lib/secureStorage';

// Store encrypted data
await secureLocalStorage.setItem('token', 'secret-token-value');

// Retrieve and decrypt
const token = await secureLocalStorage.getItem('token');

// Store objects
await secureLocalStorage.setObject('user', { id: '123', name: 'John' });

// Retrieve objects
const user = await secureLocalStorage.getObject('user');
```

### Storage Instances

- `secureLocalStorage` - Encrypted localStorage
- `secureSessionStorage` - Encrypted sessionStorage

## CORS Configuration

### Strict Origin Validation

CORS is configured to only allow whitelisted origins:

```
http://localhost:5173
http://localhost:8080
https://docketchief.com
https://www.docketchief.com
```

### Edge Function CORS

Edge functions validate origin on every request:
- Wildcard (*) origins are never used
- Credentials are allowed for authenticated requests
- Security headers are included in all responses

## Security Headers

All responses include comprehensive security headers:

### Headers Applied

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Content Security Policy

CSP directives are configured to:
- Prevent XSS attacks
- Restrict resource loading
- Block inline scripts (except where needed)
- Prevent clickjacking

## Testing

### Running Security Tests

Security tests can be run in the browser console:

```javascript
// Open browser console and run:
await runSecurityTests();
```

### Test Suites

1. **Input Validation Tests**
   - Email format validation
   - Password strength validation
   - XSS prevention
   - Schema validation

2. **Rate Limiting Tests**
   - Request limit enforcement
   - Window reset behavior
   - Status tracking

3. **Encryption Tests**
   - Data encryption/decryption
   - Object serialization
   - Corrupted data handling

### Test Results

Tests provide detailed output:
- ✅ Passed tests
- ❌ Failed tests
- Success rate percentage
- Detailed error messages

## Security Best Practices

### For Developers

1. Always use Zod schemas to validate inputs
2. Use rate limiters for sensitive operations
3. Store sensitive data in SecureStorage
4. Never log sensitive information
5. Use typed errors instead of `any`
6. Implement proper error handling

### For Deployment

1. Set strong environment variables
2. Configure ALLOWED_ORIGINS for production
3. Enable HTTPS everywhere
4. Monitor rate limit violations
5. Regular security audits
6. Keep dependencies updated

## Security Audit Summary

✅ **Implemented:**
- PKCE for OAuth flows
- Input validation with Zod
- Rate limiting (client and server)
- AES-GCM encrypted storage
- Strict CORS policies
- Security headers
- Strong password requirements
- Comprehensive testing

⚠️ **Recommendations:**
- Add CAPTCHA for repeated failures
- Implement session timeout warnings
- Add security event logging
- Regular penetration testing
- Implement CSP reporting
- Add brute force detection

## Support

For security concerns or questions, please contact the security team.

**Note:** Never commit secrets or credentials to the repository.
