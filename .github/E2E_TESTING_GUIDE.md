# Running E2E Tests Locally

This guide explains how to set up and run end-to-end (E2E) tests using Playwright for the DocketChief application.

## Prerequisites

1. **Node.js 20+**: Ensure you have the correct Node version
2. **Dependencies installed**: Run `npm install`
3. **Playwright browsers**: Install with `npx playwright install`

## Quick Start

```bash
# Install dependencies if not already done
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Build the application for testing
npm run build

# Run all E2E tests
npm run test:e2e
```

## Available Test Commands

```bash
# Run tests in headless mode (CI/local)
npm run test:e2e

# Run tests with interactive UI (debugging)
npm run test:e2e:ui

# Run tests in debug mode (step through)
npm run test:e2e:debug

# View test results report
npm run test:e2e:report
```

## Running Tests Against Different Environments

### Local Development Server
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run tests against dev server
BASE_URL=http://localhost:5173 npm run test:e2e
```

### Production Build (Recommended)
```bash
# Build and test production version
npm run build
npm run preview &  # Starts server in background
npm run test:e2e   # Uses preview server (localhost:4173)
```

### Against Live Website
```bash
# Test against deployed site
BASE_URL=https://docketchief.com npm run test:e2e
```

## Test Configuration

The tests are configured in `playwright.config.ts`:

- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Parallel**: Disabled on CI, enabled locally
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure

## Writing New Tests

Create test files in the `e2e/` directory:

```typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    await expect(page.locator('h1')).toHaveText('My Feature');
  });
});
```

## Test Environment Variables

Set these in your CI environment or `.env.local`:

```bash
# Base URL for tests (auto-detected locally)
BASE_URL=http://localhost:4173

# For testing with authentication
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Disable payments during testing
VITE_PAYMENTS_ENABLED=false
VITE_ENVIRONMENT=testing
```

## GitHub Actions Integration

Tests run automatically in CI when:
- Pull requests are opened/updated
- Code is pushed to main branch

The workflow will:
1. Build the application
2. Start a preview server
3. Run E2E tests across all browsers
4. Upload test reports as artifacts

## Troubleshooting

### Tests Failing Locally

```bash
# Update Playwright browsers
npx playwright install

# Clear browser cache and retry
rm -rf playwright-report test-results
npm run test:e2e
```

### Port Conflicts
If port 4173 is busy:
```bash
# Use a different port
PORT=4174 npm run preview &
BASE_URL=http://localhost:4174 npm run test:e2e
```

### Debugging Test Failures

```bash
# Run specific test file
npx playwright test e2e/app.spec.ts

# Run with debug mode
npm run test:e2e:debug

# Generate trace files
npx playwright test --trace on

# View traces
npx playwright show-trace trace.zip
```

### CI/CD Environment Setup

For GitHub Actions, ensure these secrets are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Test Coverage

Current tests cover:
- ✅ Basic app loading and navigation
- ✅ Responsive design across devices
- ✅ Error handling (404s, JS errors)
- ⏳ Authentication flows (planned)
- ⏳ Payment processes (planned)
- ⏳ Document management (planned)

## Performance Testing

Playwright can also measure performance:

```typescript
test('should load quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Should load in < 3s
});
```

## Best Practices

1. **Wait for elements**: Always use `waitFor` patterns
2. **Stable selectors**: Use `data-testid` attributes when possible
3. **Independent tests**: Each test should work in isolation
4. **Clean state**: Reset between tests if needed
5. **Realistic data**: Use production-like test data

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Playwright Inspector](https://playwright.dev/docs/inspector)

---
*Last updated: November 2024*
*Add new test scenarios as features are developed*