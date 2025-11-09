import { test, expect } from '@playwright/test';

/**
 * Feature Testing Example
 * 
 * This is an example template for testing new features as described
 * in the "Writing New Tests" section of the E2E Testing Guide.
 * 
 * Copy this template when adding tests for new features.
 */
test.describe('Example Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the feature page before each test
    await page.goto('/');
  });

  test('should display feature heading', async ({ page }) => {
    // Example: Check for heading with data-testid
    // await expect(page.locator('[data-testid="feature-heading"]')).toBeVisible();
    
    // For now, just check the page is visible as a template
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    // Example: Test button clicks, form submissions, etc.
    // const button = page.locator('[data-testid="submit-button"]');
    // await button.click();
    // await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Template placeholder
    await page.waitForLoadState('networkidle');
  });

  test('should validate form inputs', async ({ page }) => {
    // Example: Test form validation
    // await page.fill('[data-testid="email-input"]', 'invalid-email');
    // await page.click('[data-testid="submit-button"]');
    // await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email');
    
    // Template placeholder
    await page.waitForLoadState('networkidle');
  });
});

/**
 * Best Practices Demonstrated:
 * 
 * 1. ✅ Use data-testid attributes for stable selectors
 * 2. ✅ Group related tests in describe blocks
 * 3. ✅ Use beforeEach for common setup
 * 4. ✅ Test one behavior per test
 * 5. ✅ Use descriptive test names
 * 6. ✅ Wait for elements and states appropriately
 */
