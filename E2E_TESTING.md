# End-to-End (E2E) Testing Guide

This guide explains how to run, write, and maintain E2E tests for Docket Chief using Playwright.

## Quick Start

### Install Dependencies

```bash
# Install npm packages
npm install

# Install Playwright browsers
npx playwright install
```

### Run Tests

```bash
# Build the application first
npm run build

# Run all tests (headless)
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see the browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

## Test Structure

Tests are organized in the `e2e/` directory:

```
e2e/
├── health.spec.ts       # Application health and load tests
└── navigation.spec.ts   # Navigation and routing tests
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test:e2e` | Run all E2E tests in headless mode |
| `npm run test:e2e:ui` | Run tests in interactive UI mode |
| `npm run test:e2e:headed` | Run tests with visible browser |
| `npm run test:e2e:report` | View HTML test report |

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Interact with elements
    await page.click('button');
    
    // Make assertions
    await expect(page.locator('h1')).toHaveText('Expected Text');
  });
});
```

### Common Patterns

#### Waiting for Elements

```typescript
// Wait for element to be visible
await page.waitForSelector('.my-element');

// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific condition
await page.waitForFunction(() => document.querySelector('.loaded'));
```

#### Form Interactions

```typescript
// Fill input
await page.fill('input[name="email"]', 'user@example.com');

// Click button
await page.click('button[type="submit"]');

// Select option
await page.selectOption('select[name="country"]', 'US');

// Check checkbox
await page.check('input[type="checkbox"]');
```

#### Navigation

```typescript
// Go to URL
await page.goto('/dashboard');

// Click link
await page.click('a[href="/settings"]');

// Go back
await page.goBack();
```

#### Assertions

```typescript
// Text content
await expect(page.locator('h1')).toHaveText('Welcome');

// Visibility
await expect(page.locator('.modal')).toBeVisible();

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL(/\/dashboard/);

// Attribute
await expect(page.locator('button')).toHaveAttribute('disabled', '');
```

## Configuration

### Playwright Configuration

The main configuration is in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Environment Variables

Set these before running tests:

```bash
# Base URL for tests (default: http://localhost:4173)
export PLAYWRIGHT_BASE_URL=http://localhost:4173

# Supabase credentials (for authenticated tests)
export VITE_SUPABASE_URL=https://xxxxx.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Running Specific Tests

### By File

```bash
# Run specific test file
npx playwright test e2e/health.spec.ts

# Run multiple files
npx playwright test e2e/health.spec.ts e2e/navigation.spec.ts
```

### By Test Name

```bash
# Run tests matching pattern
npx playwright test -g "should load homepage"
```

### By Browser

```bash
# Run only on Chromium
npx playwright test --project=chromium

# Run on multiple browsers
npx playwright test --project=chromium --project=firefox
```

## Debugging Tests

### Interactive Debugging

```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Debug specific test
npx playwright test e2e/health.spec.ts --debug
```

### Using Playwright Inspector

The Playwright Inspector allows you to:
- Step through tests
- See element selectors
- View console logs
- Inspect the DOM

### VS Code Integration

1. Install the Playwright Test extension
2. Click the testing icon in the sidebar
3. Run/debug tests directly from VS Code

### Viewing Traces

```bash
# Generate trace
npx playwright test --trace on

# View trace file
npx playwright show-trace trace.zip
```

## CI/CD Integration

Tests automatically run in GitHub Actions on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

### CI Configuration

See `.github/workflows/ci-cd.yml` for the complete CI setup.

Key points:
- Tests run after successful build
- Playwright browsers installed automatically
- Test reports uploaded as artifacts
- Failed tests retry up to 2 times

## Best Practices

### 1. Use Descriptive Test Names

❌ Bad:
```typescript
test('test1', async ({ page }) => { /* ... */ });
```

✅ Good:
```typescript
test('should display error message when login fails', async ({ page }) => {
  /* ... */
});
```

### 2. Keep Tests Independent

Each test should:
- Set up its own data
- Not depend on other tests
- Clean up after itself

### 3. Use Page Objects

For complex pages, create page objects:

```typescript
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// In test file
import { LoginPage } from './pages/LoginPage';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
});
```

### 4. Handle Async Operations

Always await asynchronous operations:

```typescript
// Wait for navigation
await page.click('a[href="/dashboard"]');
await page.waitForURL('**/dashboard');

// Wait for API calls
await Promise.all([
  page.waitForResponse('**/api/users'),
  page.click('button.load-users'),
]);
```

### 5. Use Test Fixtures

Create reusable test fixtures:

```typescript
// e2e/fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Set up authentication
    await page.goto('/login');
    // ... login logic ...
    await use(page);
  },
});

// In test file
import { test } from './fixtures';

test('should access protected route', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/dashboard');
  // Test as authenticated user
});
```

### 6. Avoid Hard-coded Waits

❌ Bad:
```typescript
await page.click('button');
await page.waitForTimeout(5000); // Arbitrary wait
```

✅ Good:
```typescript
await page.click('button');
await page.waitForSelector('.result'); // Wait for specific element
```

## Troubleshooting

### Tests Timeout

```bash
# Increase timeout
npx playwright test --timeout=60000
```

Or in test:
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### Flaky Tests

1. Add explicit waits:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

2. Use retry logic:
   ```typescript
   await expect(async () => {
     const text = await page.textContent('.dynamic-content');
     expect(text).toBe('Expected');
   }).toPass();
   ```

3. Increase retries in config:
   ```typescript
   retries: 3,
   ```

### Element Not Found

1. Check if element is in iframe:
   ```typescript
   const frame = page.frameLocator('iframe');
   await frame.locator('button').click();
   ```

2. Wait for element:
   ```typescript
   await page.waitForSelector('.my-element', { state: 'visible' });
   ```

3. Use more specific selectors:
   ```typescript
   // ❌ Too generic
   await page.click('button');
   
   // ✅ More specific
   await page.click('button[aria-label="Submit form"]');
   ```

### Debugging Failed CI Tests

1. Download test artifacts from GitHub Actions
2. Extract `playwright-report.zip`
3. Open `index.html` in browser
4. Review screenshots and traces

## Performance Testing

### Measuring Page Load Time

```typescript
test('should load page quickly', async ({ page }) => {
  const start = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  
  expect(loadTime).toBeLessThan(3000); // 3 seconds
});
```

### Measuring Core Web Vitals

```typescript
test('should have good Core Web Vitals', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        resolve(entries);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  });
  
  // Assert on metrics
});
```

## Accessibility Testing

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Visual Regression Testing

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI Configuration](https://playwright.dev/docs/ci)

## Getting Help

- Check existing tests in `e2e/` directory
- Review Playwright documentation
- Ask in team chat
- Create issue for test infrastructure problems
