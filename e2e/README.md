# End-to-End Tests

This directory contains E2E tests for the DocketChief application using Playwright.

## Test Files

- **`app.spec.ts`** - Core application tests covering basic functionality, navigation, responsive design, error handling, and JavaScript error detection
- **`example-feature.spec.ts`** - Template for feature testing demonstrating best practices
- **`example-performance.spec.ts`** - Performance testing examples

## Running Tests

See the comprehensive [E2E Testing Guide](../.github/E2E_TESTING_GUIDE.md) for detailed instructions.

Quick start:
```bash
# Build and run all tests
npm run build
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Writing New Tests

1. Create a new file: `e2e/your-feature.spec.ts`
2. Use the template in `example-feature.spec.ts` as a starting point
3. Follow best practices:
   - Use `data-testid` attributes for stable selectors
   - Wait for elements and network states
   - Keep tests independent and isolated
   - Group related tests in `describe` blocks
   - Use descriptive test names

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-feature');
    await expect(page.locator('[data-testid="feature-title"]')).toBeVisible();
  });
});
```

## Test Structure

Each test file should:
- Import `test` and `expect` from `@playwright/test`
- Group related tests in `describe` blocks
- Have clear, descriptive test names
- Use proper assertions and waits
- Clean up state if needed

## CI/CD Integration

Tests automatically run on:
- Pull request creation/updates
- Pushes to main branch

Results are available in GitHub Actions as artifacts.

## Resources

- [Full E2E Testing Guide](../.github/E2E_TESTING_GUIDE.md)
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
