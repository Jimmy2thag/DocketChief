# Testing Guide

Comprehensive guide to testing DocketChief application.

## Table of Contents

1. [Overview](#overview)
2. [Testing Stack](#testing-stack)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Coverage Requirements](#coverage-requirements)
7. [Writing Tests](#writing-tests)
8. [CI/CD Integration](#cicd-integration)

---

## Overview

DocketChief uses a comprehensive testing strategy to ensure code quality and reliability:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test how different parts of the system work together
- **E2E Tests**: Test complete user workflows in a real browser

### Current Test Coverage

- **Statement Coverage**: 93.68%
- **Branch Coverage**: 78.5%
- **Function Coverage**: 100%
- **Line Coverage**: 93.25%

**Target**: >80% coverage across all metrics

---

## Testing Stack

### Unit & Integration Tests

- **Framework**: [Vitest](https://vitest.dev/)
- **Testing Library**: [@testing-library/react](https://testing-library.com/react)
- **Mocking**: Vitest's built-in mocking
- **Coverage**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html)

### E2E Tests

- **Framework**: [Playwright](https://playwright.dev/)
- **Browsers**: Chromium, Firefox, WebKit
- **Reporters**: HTML, JSON

---

## Unit Testing

### Running Unit Tests

```bash
# Watch mode (recommended for development)
npm test

# Single run
npm run test:run

# With UI
npm run test:ui

# With coverage
npm run test:coverage
```

### Test Structure

Unit tests are located in `src/test/unit/` and follow the naming convention `*.test.ts`.

**Example:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMRR } from '@/lib/analyticsCalculations';

describe('analyticsCalculations', () => {
  describe('calculateMRR', () => {
    it('should calculate MRR correctly', () => {
      const subscriptions = [
        { status: 'active', amount: 100, interval: 'month' },
        { status: 'active', amount: 200, interval: 'month' },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(300);
    });
  });
});
```

### Mocking

#### Mocking Modules

```typescript
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));
```

#### Mocking Environment Variables

```typescript
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
```

#### Using Mock Data

```typescript
import { mockAlertData, mockUser } from '../mocks/mockData';

it('should send alert', async () => {
  const result = await emailService.sendAlert(mockAlertData);
  expect(result).toBe(true);
});
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  vi.mocked(supabase.functions.invoke).mockResolvedValue({
    data: { content: 'Success' },
    error: null,
  });

  const result = await legalAiChat({ messages: [] });
  expect(result.content).toBe('Success');
});
```

### Testing Error Handling

```typescript
it('should handle errors gracefully', async () => {
  vi.mocked(supabase.functions.invoke).mockRejectedValue(
    new Error('Service unavailable')
  );

  await expect(legalAiChat({ messages: [] })).rejects.toThrow(
    'Service unavailable'
  );
});
```

---

## Integration Testing

Integration tests verify that different parts of the system work together correctly.

### Location

Integration tests are in `src/test/integration/`.

### Running Integration Tests

```bash
npm run test:run  # Runs all tests including integration
```

### Example Integration Test

```typescript
describe('AI Chat Flow', () => {
  it('should handle complete AI chat request flow', async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { content: 'AI response', usage: {} },
      error: null,
    });

    const messages = [
      { role: 'user' as const, content: 'Test question' }
    ];

    const result = await AIService.sendMessage(
      messages, 
      'openai', 
      'test-user'
    );

    expect(result.response).toBe('AI response');
    expect(result.error).toBeUndefined();
  });
});
```

---

## E2E Testing

End-to-end tests simulate real user interactions in a browser.

### Setup

Install Playwright browsers (first time only):
```bash
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test critical-journeys.spec.ts

# Run in specific browser
npx playwright test --project=chromium
```

### Test Structure

E2E tests are located in `src/test/e2e/` and use the `.spec.ts` extension.

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('localhost:8080');
  });
});
```

### Common E2E Patterns

#### Navigation
```typescript
test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=About');
  expect(page.url()).toContain('/about');
});
```

#### Form Interaction
```typescript
test('should submit form', async ({ page }) => {
  await page.goto('/contact');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('textarea[name="message"]', 'Hello');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.success-message')).toBeVisible();
});
```

#### Authentication
```typescript
test('should sign in', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  
  await expect(page.locator('.user-menu')).toBeVisible();
});
```

#### Waiting for Elements
```typescript
test('should wait for content', async ({ page }) => {
  await page.goto('/');
  
  // Wait for specific element
  await page.waitForSelector('.content');
  
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // Wait for specific text
  await page.waitForSelector('text=Welcome');
});
```

### Debugging E2E Tests

#### Take Screenshots
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshot.png' });
});
```

#### Slow Motion
```bash
npx playwright test --headed --slow-mo=1000
```

#### Debug Mode
```bash
npx playwright test --debug
```

#### View Test Reports
```bash
npx playwright show-report
```

---

## Coverage Requirements

### Target Coverage

- Statement Coverage: >80%
- Branch Coverage: >80%
- Function Coverage: >80%
- Line Coverage: >80%

### Checking Coverage

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - HTML report (open in browser)
- `coverage/coverage-final.json` - JSON report for CI

### Improving Coverage

1. **Identify uncovered code:**
   ```bash
   npm run test:coverage
   open coverage/index.html
   ```

2. **Write tests for uncovered functions:**
   - Look for red-highlighted code
   - Focus on critical paths first
   - Add tests for edge cases

3. **Test error paths:**
   ```typescript
   it('should handle error', async () => {
     vi.mocked(service).mockRejectedValue(new Error('Fail'));
     await expect(fn()).rejects.toThrow('Fail');
   });
   ```

---

## Writing Tests

### Best Practices

1. **Use Descriptive Names**
   ```typescript
   // Good
   it('should calculate MRR correctly for monthly subscriptions', () => {});
   
   // Bad
   it('test 1', () => {});
   ```

2. **Follow AAA Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange - setup
     const input = { value: 100 };
     
     // Act - execute
     const result = calculate(input);
     
     // Assert - verify
     expect(result).toBe(100);
   });
   ```

3. **Test One Thing at a Time**
   ```typescript
   // Good
   it('should add two numbers', () => {
     expect(add(1, 2)).toBe(3);
   });
   
   it('should multiply two numbers', () => {
     expect(multiply(2, 3)).toBe(6);
   });
   
   // Bad
   it('should do math', () => {
     expect(add(1, 2)).toBe(3);
     expect(multiply(2, 3)).toBe(6);
   });
   ```

4. **Clean Up After Tests**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   
   afterEach(() => {
     vi.restoreAllMocks();
   });
   ```

5. **Use Factories for Test Data**
   ```typescript
   // mocks/factories.ts
   export const createMockUser = (overrides = {}) => ({
     id: 'test-id',
     email: 'test@example.com',
     ...overrides,
   });
   
   // In test
   const user = createMockUser({ email: 'custom@example.com' });
   ```

### Common Patterns

#### Testing React Components

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should render button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

it('should handle click', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Click</Button>);
  
  await userEvent.click(screen.getByText('Click'));
  expect(onClick).toHaveBeenCalled();
});
```

#### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

it('should update state', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Workflow Steps

1. **Lint** - Check code style
2. **Unit/Integration Tests** - Run Vitest tests
3. **Coverage** - Generate and upload coverage
4. **Build** - Build application
5. **E2E Tests** - Run Playwright tests
6. **Deploy** - Deploy if all tests pass

### Local CI Simulation

```bash
# Run all checks locally before pushing
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run test:e2e
```

### Continuous Testing

```bash
# Keep tests running during development
npm test
```

---

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node.js version matches CI (20.x)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for environment-specific code

### Tests Are Slow

- Use `it.only()` to run single test during development
- Mock expensive operations
- Use `beforeEach` to set up common data
- Skip E2E tests during unit test development

### Flaky E2E Tests

- Add proper waits: `await page.waitForSelector()`
- Use `waitForLoadState('networkidle')`
- Increase timeouts if needed
- Check for race conditions

### Coverage Not Updating

- Delete `coverage/` directory
- Run `npm run test:coverage` again
- Check if files are in coverage exclude list

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

## Support

For testing questions or issues, please:
1. Check this guide
2. Review existing tests for examples
3. Open an issue on GitHub
