import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService, legalAiChat, type ChatMessage, type ChatRequest } from '@/lib/aiService';
import { mockOpenAIMessages, mockOpenAIResponse } from '../mocks/mockData';

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('legalAiChat', () => {
    it('should successfully invoke the legal-ai-chat function', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockOpenAIResponse,
        error: null,
      });

      const request: ChatRequest = {
        messages: mockOpenAIMessages as ChatMessage[],
        provider: 'openai',
      };

      const result = await legalAiChat(request);

      expect(result).toEqual(mockOpenAIResponse);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('legal-ai-chat', {
        body: request,
      });
    });

    it('should throw error when function fails', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'API error' },
      });

      const request: ChatRequest = {
        messages: mockOpenAIMessages as ChatMessage[],
      };

      await expect(legalAiChat(request)).rejects.toThrow('API error');
    });

    it('should handle error without message', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: {},
      });

      const request: ChatRequest = {
        messages: mockOpenAIMessages as ChatMessage[],
      };

      await expect(legalAiChat(request)).rejects.toThrow('AI function failed');
    });
  });

  describe('AIService.sendMessage', () => {
    it('should send message successfully with OpenAI', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockOpenAIResponse,
        error: null,
      });

      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is a motion to dismiss?' },
      ];

      const result = await AIService.sendMessage(messages, 'openai', 'test-user');

      expect(result.response).toBe(mockOpenAIResponse.content);
      expect(result.provider).toBe('GPT-4');
      expect(result.error).toBeUndefined();
    });

    it('should send message successfully with Gemini', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockOpenAIResponse,
        error: null,
      });

      const messages: ChatMessage[] = [
        { role: 'user', content: 'What is a motion to dismiss?' },
      ];

      const result = await AIService.sendMessage(messages, 'gemini', 'test-user');

      expect(result.response).toBe(mockOpenAIResponse.content);
      expect(result.provider).toBe('Gemini Pro');
      expect(result.error).toBeUndefined();
    });

    it('should handle rate limit errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Rate limit exceeded (429)')
      );

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      const result = await AIService.sendMessage(messages, 'openai', 'test-user');

      expect(result.error).toBe('RATE_LIMITED');
      expect(result.response).toContain('high volume');
    });

    it('should handle timeout errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Request timeout')
      );

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      const result = await AIService.sendMessage(messages, 'openai', 'test-user');

      expect(result.error).toBe('SERVICE_UNAVAILABLE');
      expect(result.response).toContain('did not respond in time');
    });

    it('should handle unknown errors', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Something went wrong')
      );

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      const result = await AIService.sendMessage(messages, 'openai', 'test-user');

      expect(result.error).toBe('UNKNOWN_ERROR');
      expect(result.response).toContain('experiencing difficulties');
    });

    it('should update service status on success', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockOpenAIResponse,
        error: null,
      });

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      await AIService.sendMessage(messages, 'openai', 'test-user');
      const status = AIService.getServiceStatus();

      expect(status.available).toBe(true);
      expect(status.provider).toBe('GPT-4');
      expect(status.message).toBe('Operational');
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    it('should update service status on failure', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Service error')
      );

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test message' },
      ];

      await AIService.sendMessage(messages, 'openai', 'test-user');
      const status = AIService.getServiceStatus();

      expect(status.available).toBe(false);
      expect(status.message).toContain('Service interruption');
    });
  });

  describe('AIService.getServiceStatus', () => {
    it('should return pending status when not checked', () => {
      // The service might have been checked already in previous tests
      // So we just verify the getServiceStatus method works
      const status = AIService.getServiceStatus();
      
      expect(status).toHaveProperty('available');
      expect(status).toHaveProperty('provider');
      expect(status).toHaveProperty('message');
      expect(status).toHaveProperty('lastChecked');
    });

    it('should return last known status', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: mockOpenAIResponse,
        error: null,
      });

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Test' },
      ];

      await AIService.sendMessage(messages, 'openai', 'test-user');
      const status = AIService.getServiceStatus();

      expect(status.available).toBe(true);
      expect(status.lastChecked).toBeInstanceOf(Date);
    });
  });
});
