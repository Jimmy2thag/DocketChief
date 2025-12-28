import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPaymentIntent } from '@/lib/stripeService';
import { mockPaymentIntentRequest } from '../mocks/mockData';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('stripeService', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = import.meta.env.VITE_PAYMENTS_ENABLED;
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      vi.stubEnv('VITE_PAYMENTS_ENABLED', originalEnv);
    }
  });

  describe('createPaymentIntent', () => {
    it('should throw error when payments are disabled', async () => {
      vi.stubEnv('VITE_PAYMENTS_ENABLED', 'false');
      
      // Need to re-import to pick up new env value
      vi.resetModules();
      const { createPaymentIntent: createPaymentIntentFresh } = await import('@/lib/stripeService');

      await expect(
        createPaymentIntentFresh(mockPaymentIntentRequest)
      ).rejects.toThrow('Payments are disabled in this environment');
    });

    it('should create payment intent when payments are enabled', async () => {
      vi.stubEnv('VITE_PAYMENTS_ENABLED', 'true');
      
      const mockResponse = {
        data: { clientSecret: 'test_secret', id: 'pi_test' },
        error: null,
      };

      vi.resetModules();
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);
      
      const { createPaymentIntent: createPaymentIntentFresh } = await import('@/lib/stripeService');
      const result = await createPaymentIntentFresh(mockPaymentIntentRequest);

      expect(result).toEqual(mockResponse.data);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('payments', {
        body: { op: 'create_payment_intent', ...mockPaymentIntentRequest },
      });
    });

    it('should throw error when supabase function fails', async () => {
      vi.stubEnv('VITE_PAYMENTS_ENABLED', 'true');
      
      const mockError = {
        data: null,
        error: { message: 'Payment processing failed' },
      };

      vi.resetModules();
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockError);
      
      const { createPaymentIntent: createPaymentIntentFresh } = await import('@/lib/stripeService');

      await expect(
        createPaymentIntentFresh(mockPaymentIntentRequest)
      ).rejects.toThrow('Payment processing failed');
    });

    it('should include currency and email in request', async () => {
      vi.stubEnv('VITE_PAYMENTS_ENABLED', 'true');
      
      const mockResponse = { data: { id: 'pi_test' }, error: null };

      vi.resetModules();
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue(mockResponse);
      
      const { createPaymentIntent: createPaymentIntentFresh } = await import('@/lib/stripeService');
      await createPaymentIntentFresh({
        amount: 5000,
        currency: 'eur',
        customerEmail: 'test@example.com',
      });

      expect(supabase.functions.invoke).toHaveBeenCalledWith('payments', {
        body: {
          op: 'create_payment_intent',
          amount: 5000,
          currency: 'eur',
          customerEmail: 'test@example.com',
        },
      });
    });
  });
});
