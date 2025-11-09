/**
 * Client-side and server-side rate limiting utilities
 * Implements sliding window rate limiting per user/IP
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Client-side rate limiter using localStorage
 */
export class ClientRateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyPrefix: 'rate_limit',
      ...config,
    };
  }

  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${identifier}`;
  }

  /**
   * Checks if a request is allowed and updates the counter
   */
  async checkLimit(identifier: string): Promise<{ allowed: boolean; resetTime: number; remaining: number }> {
    const key = this.getKey(identifier);
    const now = Date.now();

    // Get or create entry
    const stored = localStorage.getItem(key);
    let entry: RateLimitEntry;

    if (stored) {
      try {
        entry = JSON.parse(stored);
      } catch {
        entry = { count: 0, resetTime: now + this.config.windowMs };
      }
    } else {
      entry = { count: 0, resetTime: now + this.config.windowMs };
    }

    // Reset if window has passed
    if (now >= entry.resetTime) {
      entry = { count: 0, resetTime: now + this.config.windowMs };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0,
      };
    }

    // Increment counter
    entry.count++;
    localStorage.setItem(key, JSON.stringify(entry));

    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.config.maxRequests - entry.count,
    };
  }

  /**
   * Gets the current rate limit status without incrementing
   */
  async getStatus(identifier: string): Promise<{ remaining: number; resetTime: number }> {
    const key = this.getKey(identifier);
    const now = Date.now();

    const stored = localStorage.getItem(key);
    if (!stored) {
      return {
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    try {
      const entry: RateLimitEntry = JSON.parse(stored);
      
      // Reset if window has passed
      if (now >= entry.resetTime) {
        return {
          remaining: this.config.maxRequests,
          resetTime: now + this.config.windowMs,
        };
      }

      return {
        remaining: Math.max(0, this.config.maxRequests - entry.count),
        resetTime: entry.resetTime,
      };
    } catch {
      return {
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }
  }

  /**
   * Resets the rate limit for an identifier
   */
  reset(identifier: string): void {
    const key = this.getKey(identifier);
    localStorage.removeItem(key);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  public resetTime: number;
  public remaining: number;

  constructor(message: string, resetTime: number, remaining: number = 0) {
    super(message);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
    this.remaining = remaining;
  }
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Authentication rate limiter: 5 attempts per 15 minutes
export const authRateLimiter = new ClientRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
  keyPrefix: 'auth_limit',
});

// API request rate limiter: 60 requests per minute
export const apiRateLimiter = new ClientRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000,
  keyPrefix: 'api_limit',
});

// Password reset rate limiter: 3 attempts per hour
export const passwordResetRateLimiter = new ClientRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
  keyPrefix: 'pwd_reset_limit',
});

/**
 * Server-side rate limiter for Supabase Edge Functions
 * Uses in-memory storage (will be reset on function cold start)
 */
export class ServerRateLimiter {
  private storage: Map<string, RateLimitEntry>;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.storage = new Map();
    this.config = {
      keyPrefix: 'server_rate_limit',
      ...config,
    };
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private getKey(identifier: string): string {
    return `${this.config.keyPrefix}:${identifier}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now >= entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Checks if a request is allowed
   */
  checkLimit(identifier: string): { allowed: boolean; resetTime: number; remaining: number; retryAfter?: number } {
    const key = this.getKey(identifier);
    const now = Date.now();

    let entry = this.storage.get(key);

    // Reset if window has passed
    if (!entry || now >= entry.resetTime) {
      entry = { count: 0, resetTime: now + this.config.windowMs };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0,
        retryAfter,
      };
    }

    // Increment counter
    entry.count++;
    this.storage.set(key, entry);

    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: this.config.maxRequests - entry.count,
    };
  }

  /**
   * Resets the rate limit for an identifier
   */
  reset(identifier: string): void {
    const key = this.getKey(identifier);
    this.storage.delete(key);
  }
}

/**
 * Helper function to get user identifier for rate limiting
 */
export function getUserIdentifier(userId?: string, ipAddress?: string): string {
  return userId || ipAddress || 'anonymous';
}

/**
 * Helper to format retry-after message
 */
export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
