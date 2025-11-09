import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabase', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should create a supabase client with URL and anon key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    const { supabase } = await import('@/lib/supabase');
    
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should warn when environment variables are missing', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    vi.stubEnv('VITE_SUPABASE_URL', undefined);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', undefined);

    // This will warn but still create a client with invalid values
    // The actual supabase client will throw, but we're testing the warning logic
    try {
      await import('@/lib/supabase');
    } catch (e) {
      // Expected to fail with invalid URL
    }
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
    );
    
    consoleSpy.mockRestore();
  });

  it('should be a singleton instance', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    const module1 = await import('@/lib/supabase');
    const module2 = await import('@/lib/supabase');
    
    expect(module1.supabase).toBe(module2.supabase);
  });
});
