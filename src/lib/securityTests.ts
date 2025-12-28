/**
 * Security testing utilities for DocketChief
 * These utilities can be used in manual testing or integrated into a test framework
 */

import { 
  signInSchema, 
  signUpSchema, 
  passwordResetRequestSchema,
  chatRequestSchema,
  emailSchema,
  passwordSchema,
  fullNameSchema
} from './validation';
import { ClientRateLimiter } from './rateLimiter';
import { SecureStorage } from './secureStorage';

/**
 * Test results interface
 */
export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: Error;
}

/**
 * Security test suite interface
 */
export interface SecurityTestSuite {
  name: string;
  tests: (() => Promise<TestResult>)[];
}

/**
 * Input validation tests
 */
export const validationTests: SecurityTestSuite = {
  name: 'Input Validation Tests',
  tests: [
    // Email validation tests
    async () => {
      const result = emailSchema.safeParse('valid@email.com');
      return {
        name: 'Valid email should pass',
        passed: result.success,
        message: result.success ? 'Email validation passed' : result.error.errors[0].message,
      };
    },
    async () => {
      const result = emailSchema.safeParse('invalid-email');
      return {
        name: 'Invalid email should fail',
        passed: !result.success,
        message: !result.success ? 'Email validation correctly rejected invalid email' : 'Should have failed',
      };
    },
    async () => {
      const result = emailSchema.safeParse('a'.repeat(256) + '@email.com');
      return {
        name: 'Email exceeding max length should fail',
        passed: !result.success,
        message: !result.success ? 'Email length validation working' : 'Should have failed',
      };
    },

    // Password validation tests
    async () => {
      const result = passwordSchema.safeParse('ValidPass123!');
      return {
        name: 'Strong password should pass',
        passed: result.success,
        message: result.success ? 'Password validation passed' : result.error.errors[0].message,
      };
    },
    async () => {
      const result = passwordSchema.safeParse('weak');
      return {
        name: 'Weak password should fail',
        passed: !result.success,
        message: !result.success ? 'Password validation correctly rejected weak password' : 'Should have failed',
      };
    },
    async () => {
      const result = passwordSchema.safeParse('NoSpecialChar123');
      return {
        name: 'Password without special character should fail',
        passed: !result.success,
        message: !result.success ? 'Password special char requirement working' : 'Should have failed',
      };
    },
    async () => {
      const result = passwordSchema.safeParse('nouppercasE123!');
      return {
        name: 'Password without uppercase should fail',
        passed: !result.success,
        message: !result.success ? 'Password uppercase requirement working' : 'Should have failed',
      };
    },

    // Full name validation tests
    async () => {
      const result = fullNameSchema.safeParse('John Doe');
      return {
        name: 'Valid name should pass',
        passed: result.success,
        message: result.success ? 'Name validation passed' : result.error.errors[0].message,
      };
    },
    async () => {
      const result = fullNameSchema.safeParse('<script>alert("xss")</script>');
      return {
        name: 'Name with script tags should fail',
        passed: !result.success,
        message: !result.success ? 'XSS prevention working' : 'Should have failed',
      };
    },

    // Sign in schema tests
    async () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      return {
        name: 'Valid sign in data should pass',
        passed: result.success,
        message: result.success ? 'Sign in validation passed' : result.error.errors[0].message,
      };
    },

    // Sign up schema tests
    async () => {
      const result = signUpSchema.safeParse({
        email: 'test@example.com',
        password: 'ValidPass123!',
        fullName: 'John Doe',
      });
      return {
        name: 'Valid sign up data should pass',
        passed: result.success,
        message: result.success ? 'Sign up validation passed' : result.error.errors[0].message,
      };
    },

    // Chat request validation tests
    async () => {
      const result = chatRequestSchema.safeParse({
        messages: [
          { role: 'user', content: 'Hello' },
        ],
      });
      return {
        name: 'Valid chat request should pass',
        passed: result.success,
        message: result.success ? 'Chat request validation passed' : result.error.errors[0].message,
      };
    },
    async () => {
      const result = chatRequestSchema.safeParse({
        messages: Array(51).fill({ role: 'user', content: 'test' }),
      });
      return {
        name: 'Chat request with too many messages should fail',
        passed: !result.success,
        message: !result.success ? 'Message limit validation working' : 'Should have failed',
      };
    },
  ],
};

/**
 * Rate limiting tests
 */
export const rateLimitTests: SecurityTestSuite = {
  name: 'Rate Limiting Tests',
  tests: [
    async () => {
      const limiter = new ClientRateLimiter({
        maxRequests: 3,
        windowMs: 1000,
        keyPrefix: 'test_limit',
      });

      try {
        // First 3 requests should pass
        for (let i = 0; i < 3; i++) {
          const result = await limiter.checkLimit('test-user');
          if (!result.allowed) {
            return {
              name: 'Rate limiter should allow first 3 requests',
              passed: false,
              message: `Request ${i + 1} was blocked`,
            };
          }
        }

        // 4th request should be blocked
        const result = await limiter.checkLimit('test-user');
        return {
          name: 'Rate limiter should block 4th request',
          passed: !result.allowed,
          message: result.allowed ? 'Should have been rate limited' : 'Rate limiting working correctly',
        };
      } finally {
        limiter.reset('test-user');
      }
    },

    async () => {
      const limiter = new ClientRateLimiter({
        maxRequests: 5,
        windowMs: 500,
        keyPrefix: 'test_reset',
      });

      try {
        // Use up the limit
        for (let i = 0; i < 5; i++) {
          await limiter.checkLimit('test-user-2');
        }

        // Should be blocked
        let result = await limiter.checkLimit('test-user-2');
        if (result.allowed) {
          return {
            name: 'Rate limit window reset test',
            passed: false,
            message: 'Should have been rate limited',
          };
        }

        // Wait for window to reset
        await new Promise(resolve => setTimeout(resolve, 600));

        // Should be allowed again
        result = await limiter.checkLimit('test-user-2');
        return {
          name: 'Rate limit window reset test',
          passed: result.allowed,
          message: result.allowed ? 'Rate limit window reset correctly' : 'Window did not reset',
        };
      } finally {
        limiter.reset('test-user-2');
      }
    },

    async () => {
      const limiter = new ClientRateLimiter({
        maxRequests: 5,
        windowMs: 1000,
        keyPrefix: 'test_status',
      });

      try {
        // Make 2 requests
        await limiter.checkLimit('test-user-3');
        await limiter.checkLimit('test-user-3');

        // Check status without incrementing
        const status = await limiter.getStatus('test-user-3');
        
        return {
          name: 'Rate limiter status check',
          passed: status.remaining === 3,
          message: `Status shows ${status.remaining} remaining requests (expected 3)`,
        };
      } finally {
        limiter.reset('test-user-3');
      }
    },
  ],
};

/**
 * Encrypted storage tests
 */
export const encryptionTests: SecurityTestSuite = {
  name: 'Encrypted Storage Tests',
  tests: [
    async () => {
      const storage = new SecureStorage(sessionStorage);
      const testKey = 'test-encrypt-key';
      const testValue = 'sensitive-data-12345';

      try {
        await storage.setItem(testKey, testValue);
        const retrieved = await storage.getItem(testKey);

        return {
          name: 'Encrypted storage should store and retrieve data',
          passed: retrieved === testValue,
          message: retrieved === testValue ? 'Data correctly encrypted and decrypted' : 'Data mismatch',
        };
      } finally {
        storage.removeItem(testKey);
      }
    },

    async () => {
      const storage = new SecureStorage(sessionStorage);
      const testKey = 'test-encrypt-verify';
      const testValue = 'test-value';

      try {
        await storage.setItem(testKey, testValue);
        
        // Get raw value from storage - should be encrypted
        const rawValue = sessionStorage.getItem(testKey);
        const isEncrypted = rawValue !== testValue;

        return {
          name: 'Data should be encrypted in storage',
          passed: isEncrypted,
          message: isEncrypted ? 'Data is encrypted in storage' : 'Data is stored in plain text!',
        };
      } finally {
        storage.removeItem(testKey);
      }
    },

    async () => {
      const storage = new SecureStorage(sessionStorage);
      const testKey = 'test-object';
      const testObject = { user: 'test', token: 'abc123', sensitive: true };

      try {
        await storage.setObject(testKey, testObject);
        const retrieved = await storage.getObject<typeof testObject>(testKey);

        const matches = JSON.stringify(retrieved) === JSON.stringify(testObject);
        return {
          name: 'Encrypted storage should handle objects',
          passed: matches,
          message: matches ? 'Objects correctly encrypted and decrypted' : 'Object data mismatch',
        };
      } finally {
        storage.removeItem(testKey);
      }
    },

    async () => {
      const storage = new SecureStorage(sessionStorage);
      const testKey = 'test-corrupted';

      try {
        // Set corrupted data directly
        sessionStorage.setItem(testKey, 'corrupted-base64-!!!');

        const retrieved = await storage.getItem(testKey);

        return {
          name: 'Corrupted data should be handled gracefully',
          passed: retrieved === null,
          message: retrieved === null ? 'Corrupted data handled correctly' : 'Should return null for corrupted data',
        };
      } finally {
        storage.removeItem(testKey);
      }
    },
  ],
};

/**
 * Run all security tests
 */
export async function runSecurityTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: Record<string, TestResult[]>;
}> {
  const suites = [validationTests, rateLimitTests, encryptionTests];
  const results: Record<string, TestResult[]> = {};
  let total = 0;
  let passed = 0;
  let failed = 0;

  for (const suite of suites) {
    console.log(`\n🔒 Running ${suite.name}...`);
    results[suite.name] = [];

    for (const test of suite.tests) {
      try {
        const result = await test();
        results[suite.name].push(result);
        total++;
        
        if (result.passed) {
          passed++;
          console.log(`  ✅ ${result.name}`);
        } else {
          failed++;
          console.log(`  ❌ ${result.name}: ${result.message}`);
        }
      } catch (error) {
        const result: TestResult = {
          name: 'Unknown test',
          passed: false,
          message: 'Test threw an error',
          error: error as Error,
        };
        results[suite.name].push(result);
        total++;
        failed++;
        console.log(`  ❌ Test error: ${error}`);
      }
    }
  }

  console.log(`\n📊 Test Summary:`);
  console.log(`  Total: ${total}`);
  console.log(`  Passed: ${passed} ✅`);
  console.log(`  Failed: ${failed} ❌`);
  console.log(`  Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  return { total, passed, failed, results };
}

/**
 * Helper to run tests in browser console
 */
if (typeof window !== 'undefined') {
  (window as any).runSecurityTests = runSecurityTests;
}
