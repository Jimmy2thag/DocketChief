/**
 * Security configuration and constants for DocketChief
 */

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.openai.com',
    'https://api.stripe.com',
  ],
  'frame-src': ["'self'", 'https://js.stripe.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

/**
 * OAuth configuration
 */
export const OAUTH_CONFIG = {
  providers: ['google', 'github', 'azure'] as const,
  scopes: {
    google: 'email profile',
    github: 'user:email',
    azure: 'email profile',
  },
  // PKCE is enabled by default in Supabase client
  pkce: true,
};

/**
 * Password requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  api: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
  passwordReset: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  aiChat: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (24 hours)
  timeout: 24 * 60 * 60 * 1000,
  // Refresh token before expiry (5 minutes)
  refreshBeforeExpiry: 5 * 60 * 1000,
  // Storage key prefix
  storageKeyPrefix: 'docketchief-',
};

/**
 * Input validation limits
 */
export const INPUT_LIMITS = {
  email: {
    maxLength: 255,
  },
  name: {
    maxLength: 100,
  },
  message: {
    maxLength: 10000,
  },
  systemPrompt: {
    maxLength: 1000,
  },
  url: {
    maxLength: 2048,
  },
  genericText: {
    maxLength: 1000,
  },
};

/**
 * Allowed origins for CORS
 */
export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://docketchief.com',
  'https://www.docketchief.com',
];

/**
 * Sensitive data keys that should be encrypted in storage
 */
export const ENCRYPTED_STORAGE_KEYS = [
  'docketchief-auth',
  'user-preferences',
  'payment-methods',
];

/**
 * Security audit log events
 */
export const SECURITY_EVENTS = {
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  INVALID_INPUT: 'invalid_input',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
} as const;

/**
 * Helper function to generate CSP header value
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Helper function to check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Helper function to sanitize user input
 */
export function sanitizeInput(input: string, maxLength: number = INPUT_LIMITS.genericText.maxLength): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}
