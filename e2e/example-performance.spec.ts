import { test, expect } from '@playwright/test';

/**
 * Performance Testing Example
 * 
 * This example demonstrates how to measure page load performance
 * as mentioned in the E2E Testing Guide.
 */
test.describe('Performance Tests', () => {
  test('should load the homepage quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load navigation without delay', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    const navigation = page.locator('[role="navigation"], nav, header').first();
    await navigation.waitFor({ state: 'visible', timeout: 2000 });
    const navLoadTime = Date.now() - startTime;
    
    // Navigation should appear within 1 second
    expect(navLoadTime).toBeLessThan(1000);
  });
});
