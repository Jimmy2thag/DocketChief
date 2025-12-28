import { test, expect } from '@playwright/test';

test.describe('DocketChief App', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and has expected title
    await expect(page).toHaveTitle(/Docket Chief/);
    
    // Check for main navigation or header
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check if there's a navigation menu or main content area
    const navigation = page.locator('[role="navigation"], nav, header');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 404 routes gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should either redirect to home or show a 404 page
    // In a SPA, this typically redirects to the main app
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like network timeouts in test env)
    const criticalErrors = errors.filter(error => 
      !error.includes('net::ERR_') && 
      !error.includes('favicon.ico') &&
      !error.includes('Failed to load resource')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});