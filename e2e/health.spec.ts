import { test, expect } from '@playwright/test';

test.describe('Application Health Checks', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page title is set
    await expect(page).toHaveTitle(/Docket Chief/);
    
    // Verify the page is accessible
    const html = await page.content();
    expect(html.length).toBeGreaterThan(0);
  });

  test('should display the navigation header', async ({ page }) => {
    await page.goto('/');
    
    // Look for common navigation elements
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors if any
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('DevTools')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should load without network failures', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out favicon and other non-critical requests
    const criticalFailures = failedRequests.filter(url => 
      !url.includes('favicon') && 
      !url.includes('.map')
    );
    
    expect(criticalFailures).toHaveLength(0);
  });
});
