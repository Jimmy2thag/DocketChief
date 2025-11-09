import { vi } from 'vitest';

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockClient = {
    from: vi.fn(() => mockClient),
    select: vi.fn(() => mockClient),
    insert: vi.fn(() => mockClient),
    update: vi.fn(() => mockClient),
    delete: vi.fn(() => mockClient),
    eq: vi.fn(() => mockClient),
    neq: vi.fn(() => mockClient),
    gt: vi.fn(() => mockClient),
    gte: vi.fn(() => mockClient),
    lt: vi.fn(() => mockClient),
    lte: vi.fn(() => mockClient),
    like: vi.fn(() => mockClient),
    ilike: vi.fn(() => mockClient),
    is: vi.fn(() => mockClient),
    in: vi.fn(() => mockClient),
    contains: vi.fn(() => mockClient),
    containedBy: vi.fn(() => mockClient),
    range: vi.fn(() => mockClient),
    order: vi.fn(() => mockClient),
    limit: vi.fn(() => mockClient),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    then: vi.fn((resolve) => resolve({ data: [], error: null })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: null, error: null })),
        download: vi.fn(() => Promise.resolve({ data: null, error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
  };
  return mockClient;
};

// Mock alert data
export const mockAlertData = {
  alertType: 'test_alert',
  severity: 'medium' as const,
  message: 'Test alert message',
  details: { key: 'value' },
  timestamp: new Date().toISOString(),
};

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock session data
export const mockSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Mock payment intent request
export const mockPaymentIntentRequest = {
  amount: 1000,
  currency: 'usd',
  customerEmail: 'customer@example.com',
};

// Mock OpenAI messages
export const mockOpenAIMessages = [
  { role: 'user', content: 'What is a motion to dismiss?' },
];

// Mock OpenAI response
export const mockOpenAIResponse = {
  content: 'A motion to dismiss is a request to the court...',
  usage: {
    prompt_tokens: 20,
    completion_tokens: 50,
    total_tokens: 70,
  },
};
