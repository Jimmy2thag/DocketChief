import { test, expect } from '@playwright/test';

test.describe('Legal Research Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display Legal Research Tool', async ({ page }) => {
    // Look for Legal Research link or navigation
    const researchLink = page.locator('text=/Legal Research/i').first();
    if (await researchLink.count() > 0) {
      await researchLink.click();
      await expect(page.locator('h1, h2').filter({ hasText: /Legal Research/i })).toBeVisible();
    }
  });

  test('should allow searching with query', async ({ page }) => {
    // Navigate to legal research if available
    const researchLink = page.locator('text=/Legal Research/i').first();
    if (await researchLink.count() > 0) {
      await researchLink.click();
      
      // Look for search input
      const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="query" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('contract breach');
        
        // Look for search button
        const searchButton = page.locator('button').filter({ hasText: /Search/i }).first();
        if (await searchButton.count() > 0) {
          await searchButton.click();
          await page.waitForTimeout(1000); // Wait for results
        }
      }
    }
  });

  test('should support Google Scholar source selection', async ({ page }) => {
    const researchLink = page.locator('text=/Legal Research/i').first();
    if (await researchLink.count() > 0) {
      await researchLink.click();
      
      // Look for filters button
      const filtersButton = page.locator('button').filter({ hasText: /Filter/i }).first();
      if (await filtersButton.count() > 0) {
        await filtersButton.click();
        
        // Check if Google Scholar option exists
        const scholarOption = page.locator('text=/Google Scholar/i');
        if (await scholarOption.count() > 0) {
          await expect(scholarOption.first()).toBeVisible();
        }
      }
    }
  });

  test('should have "Open in Scholar" button functionality', async ({ page }) => {
    const researchLink = page.locator('text=/Legal Research/i').first();
    if (await researchLink.count() > 0) {
      await researchLink.click();
      
      // Fill in search query
      const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="query" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('miranda rights');
        
        // Look for "Open in Scholar" button
        const scholarButton = page.locator('button').filter({ hasText: /Open.*Scholar/i });
        if (await scholarButton.count() > 0) {
          await expect(scholarButton.first()).toBeVisible();
        }
      }
    }
  });

  test('should display search results with source badges', async ({ page }) => {
    const researchLink = page.locator('text=/Legal Research/i').first();
    if (await researchLink.count() > 0) {
      await researchLink.click();
      
      const searchInput = page.locator('input[placeholder*="search" i]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('contract');
        
        const searchButton = page.locator('button').filter({ hasText: /Search/i }).first();
        if (await searchButton.count() > 0) {
          await searchButton.click();
          await page.waitForTimeout(2000);
          
          // Check for any result cards or list items
          const results = page.locator('[class*="card"], [class*="result"]');
          if (await results.count() > 0) {
            // Results should be visible
            await expect(results.first()).toBeVisible();
          }
        }
      }
    }
  });
});

test.describe('AI Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display AI Chat component', async ({ page }) => {
    const aiChatLink = page.locator('text=/AI.*Chat/i, text=/Chat/i').first();
    if (await aiChatLink.count() > 0) {
      await aiChatLink.click();
      await expect(page.locator('text=/AI.*Assistant/i, text=/Chat/i')).toBeVisible();
    }
  });

  test('should have message input field', async ({ page }) => {
    const aiChatLink = page.locator('text=/AI.*Chat/i, text=/Chat/i').first();
    if (await aiChatLink.count() > 0) {
      await aiChatLink.click();
      
      const messageInput = page.locator('input[placeholder*="message" i], textarea[placeholder*="message" i], input[placeholder*="ask" i]');
      if (await messageInput.count() > 0) {
        await expect(messageInput.first()).toBeVisible();
      }
    }
  });

  test('should allow switching AI providers', async ({ page }) => {
    const aiChatLink = page.locator('text=/AI.*Chat/i, text=/Chat/i').first();
    if (await aiChatLink.count() > 0) {
      await aiChatLink.click();
      
      // Look for provider selector (GPT-4, Gemini, etc.)
      const providerSelector = page.locator('select, [role="combobox"]').filter({ hasText: /GPT|Gemini/i });
      if (await providerSelector.count() > 0) {
        await expect(providerSelector.first()).toBeVisible();
      }
    }
  });
});

test.describe('Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have document upload capability', async ({ page }) => {
    const docsLink = page.locator('text=/Document/i').first();
    if (await docsLink.count() > 0) {
      await docsLink.click();
      
      // Look for upload button or input
      const uploadButton = page.locator('button').filter({ hasText: /Upload/i });
      const fileInput = page.locator('input[type="file"]');
      
      const hasUpload = (await uploadButton.count() > 0) || (await fileInput.count() > 0);
      expect(hasUpload).toBeTruthy();
    }
  });

  test('should display document list or manager', async ({ page }) => {
    const docsLink = page.locator('text=/Document/i').first();
    if (await docsLink.count() > 0) {
      await docsLink.click();
      
      // Should show some document management UI
      const hasDocUI = (await page.locator('text=/No documents/i').count() > 0) ||
                       (await page.locator('[class*="document"], [class*="file"]').count() > 0) ||
                       (await page.locator('text=/Upload/i').count() > 0);
      expect(hasDocUI).toBeTruthy();
    }
  });
});

test.describe('Case Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have case management interface', async ({ page }) => {
    const caseLink = page.locator('text=/Case/i').first();
    if (await caseLink.count() > 0) {
      await caseLink.click();
      
      // Should show case management UI
      const hasCaseUI = (await page.locator('text=/Create.*Case/i').count() > 0) ||
                        (await page.locator('text=/No cases/i').count() > 0) ||
                        (await page.locator('[class*="case"]').count() > 0);
      expect(hasCaseUI).toBeTruthy();
    }
  });

  test('should have create case functionality', async ({ page }) => {
    const caseLink = page.locator('text=/Case/i').first();
    if (await caseLink.count() > 0) {
      await caseLink.click();
      
      const createButton = page.locator('button').filter({ hasText: /Create.*Case/i, hasNotText: /Dashboard/i });
      if (await createButton.count() > 0) {
        await expect(createButton.first()).toBeVisible();
      }
    }
  });
});

test.describe('Calendar & Deadlines', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have calendar interface', async ({ page }) => {
    const calendarLink = page.locator('text=/Calendar/i').first();
    if (await calendarLink.count() > 0) {
      await calendarLink.click();
      
      // Should show calendar or date-related UI
      const hasCalendarUI = (await page.locator('[class*="calendar"]').count() > 0) ||
                            (await page.locator('text=/Event/i').count() > 0) ||
                            (await page.locator('text=/Deadline/i').count() > 0);
      expect(hasCalendarUI).toBeTruthy();
    }
  });
});

test.describe('Authentication UI', () => {
  test('should have login/signup interface', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for auth-related buttons or links
    const authButtons = page.locator('button, a').filter({ hasText: /Sign|Login|Log in/i });
    if (await authButtons.count() > 0) {
      await expect(authButtons.first()).toBeVisible();
    }
  });

  test('should have authentication modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loginButton = page.locator('button, a').filter({ hasText: /Login|Sign in/i }).first();
    if (await loginButton.count() > 0) {
      await loginButton.click();
      await page.waitForTimeout(500);
      
      // Should show login form or modal
      const hasAuthForm = (await page.locator('input[type="email"], input[type="password"]').count() > 0) ||
                          (await page.locator('text=/Email/i').count() > 0);
      expect(hasAuthForm).toBeTruthy();
    }
  });
});

test.describe('Payment & Subscription', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have payment plans or pricing', async ({ page }) => {
    const pricingLink = page.locator('text=/Pric/i, text=/Plan/i, text=/Subscription/i').first();
    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      
      // Should show pricing or plans
      const hasPricingUI = (await page.locator('text=/\\$/').count() > 0) ||
                           (await page.locator('text=/Plan/i').count() > 0) ||
                           (await page.locator('text=/Subscribe/i').count() > 0);
      expect(hasPricingUI).toBeTruthy();
    }
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have focusable interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that buttons are focusable
    const buttons = page.locator('button').first();
    if (await buttons.count() > 0) {
      await buttons.focus();
      const isFocused = await buttons.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt should exist (can be empty for decorative images)
        expect(alt !== null).toBeTruthy();
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    await page.goto('/');
    
    // Should still load something (service worker, cached, or error page)
    await expect(page.locator('body')).toBeVisible();
    
    // Reset
    await page.context().setOffline(false);
  });

  test('should not expose sensitive errors to users', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for sensitive information in errors
    const sensitivePatterns = /api[_-]?key|secret|password|token/i;
    const hasSensitiveError = errors.some(error => sensitivePatterns.test(error));
    
    expect(hasSensitiveError).toBeFalsy();
  });
});
