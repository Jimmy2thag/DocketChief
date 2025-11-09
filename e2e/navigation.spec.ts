import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login/signup options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for authentication related elements (buttons, links, etc.)
    // This is a generic check that can be customized based on the actual UI
    const bodyText = await page.textContent('body');
    
    // Check if common auth terms are present
    const hasAuthElements = 
      bodyText?.toLowerCase().includes('sign') ||
      bodyText?.toLowerCase().includes('login') ||
      bodyText?.toLowerCase().includes('auth');
    
    expect(hasAuthElements).toBeTruthy();
  });

  test('should navigate to login page if exists', async ({ page }) => {
    await page.goto('/');
    
    // Try to find and click login/signin links
    const loginLink = page.getByRole('link', { name: /sign in|login/i }).first();
    
    if (await loginLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await loginLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a login page
      const url = page.url();
      expect(url).toMatch(/login|signin|auth/i);
    } else {
      // Skip if no login link found
      test.skip();
    }
  });

  test('should navigate to signup page if exists', async ({ page }) => {
    await page.goto('/');
    
    // Try to find and click signup/register links
    const signupLink = page.getByRole('link', { name: /sign up|register|get started/i }).first();
    
    if (await signupLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify we're on a signup page
      const url = page.url();
      expect(url).toMatch(/signup|register|auth/i);
    } else {
      // Skip if no signup link found
      test.skip();
    }
  });
});

test.describe('Navigation', () => {
  test('should allow navigation through main routes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all navigation links
    const navLinks = page.locator('nav a, header a').filter({ hasText: /.+/ });
    const count = await navLinks.count();
    
    // Verify there are some navigation links
    expect(count).toBeGreaterThan(0);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');
    
    // Either returns 404 or redirects (which is acceptable)
    expect(response?.status()).toBeLessThan(500);
  });
});
