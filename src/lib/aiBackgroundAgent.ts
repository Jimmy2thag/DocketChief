import { AIService, ChatMessage } from './aiService';
import { EmailService } from './emailService';

type AgentConfig = {
  alertReviewIntervalMs: number;
  failedAlertRetryIntervalMs: number;
  maxAlertsPerReview: number;
  aiProvider: 'openai' | 'gemini';
};

type StoredAlert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  details?: {
    url?: string;
    userAgent?: string;
    stackTrace?: string;
    userId?: string;
  };
  status?: string;
  notes?: string[];
  created_at?: string;
  updated_at?: string;
  aiReview?: {
    status: 'pending' | 'completed' | 'failed';
    provider?: string;
    summary?: string;
    lastAttempt?: string;
    error?: string;
  };
};

const DEFAULT_CONFIG: AgentConfig = {
  alertReviewIntervalMs: 5 * 60 * 1000,
  failedAlertRetryIntervalMs: 60 * 1000,
  maxAlertsPerReview: 3,
  aiProvider: 'openai'
};

const ALERTS_STORAGE_KEY = 'system_alerts';
const AGENT_USER_IDENTIFIER = 'ai-background-agent';

let alertReviewTimer: number | null = null;
let failedAlertTimer: number | null = null;
let isReviewInProgress = false;

function getStoredAlerts(): StoredAlert[] {
  if (typeof localStorage === 'undefined') {
    console.error(
      '[aiBackgroundAgent] localStorage is not available; returning no stored alerts.'
    );
    return [];
  }

  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY) || '[]';
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      '[aiBackgroundAgent] Failed to read or parse stored alerts from localStorage:',
      error
    );
    return [];
  }
}

function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const anyError = error as { name?: string; code?: number };
  // Standard name in modern browsers
  if (anyError.name === 'QuotaExceededError') return true;
  // Fallbacks for older implementations
  const code = anyError.code;
  return code === 22 || code === 1014;
}

function setStoredAlerts(alerts: StoredAlert[]) {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      // Attempt a simple cleanup: drop the oldest alert(s) and retry once.
      let prunedAlerts = alerts.slice();
      if (prunedAlerts.length > 1) {
        prunedAlerts = prunedAlerts
          .slice()
          .sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return aTime - bTime;
          })
          .slice(1);
      } else {
        prunedAlerts = [];
      }

      try {
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(prunedAlerts));
      } catch (retryError) {
        console.warn('Failed to store alerts after quota cleanup attempt.', retryError);
      }
    } else {
      console.warn('Failed to store alerts in localStorage.', error);
    }
  }
}

function shouldRetryReview(review?: StoredAlert['aiReview']): boolean {
  if (!review) return true;
  if (review.status === 'completed') return false;
  if (!review.lastAttempt) return true;
  const lastAttempt = new Date(review.lastAttempt).getTime();
  return Date.now() - lastAttempt > 10 * 60 * 1000;
}

function buildReviewMessages(alert: StoredAlert): ChatMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are an AI background agent helping engineers diagnose frontend errors. Provide a concise summary, probable root cause, and a suggested fix.'
    },
    {
      role: 'user',
      content: `Analyze this alert and suggest next steps:\n\nTitle: ${alert.title}\nSeverity: ${alert.severity}\nMessage: ${alert.message}\nURL: ${alert.details?.url || 'unknown'}\nUser Agent: ${alert.details?.userAgent || 'unknown'}\nStack Trace: ${alert.details?.stackTrace || 'none'}`
    }
  ];
}

async function reviewAlerts(config: AgentConfig) {
  // Prevent concurrent reviews
  if (isReviewInProgress) {
    console.log('[aiBackgroundAgent] Review already in progress, skipping this interval.');
    return;
  }

  isReviewInProgress = true;

  try {
    const alerts = getStoredAlerts();
    const pendingAlerts = alerts.filter((alert) => shouldRetryReview(alert.aiReview));

    if (pendingAlerts.length === 0) {
      return;
    }

    let processed = 0;

    for (const alert of pendingAlerts) {
      if (processed >= config.maxAlertsPerReview) {
        break;
      }

      alert.aiReview = {
        status: 'pending',
        lastAttempt: new Date().toISOString()
      };

      try {
        const response = await AIService.sendMessage(
          buildReviewMessages(alert),
          config.aiProvider,
          AGENT_USER_IDENTIFIER
        );

        alert.aiReview = {
          status: response.error ? 'failed' : 'completed',
          provider: response.provider,
          summary: response.response,
          lastAttempt: new Date().toISOString(),
          error: response.error
        };

        if (!response.error) {
          alert.notes = alert.notes ?? [];
          alert.notes.push(`[AI Review] ${response.response}`);
          alert.updated_at = new Date().toISOString();
        }
      } catch (error) {
        alert.aiReview = {
          status: 'failed',
          lastAttempt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      processed += 1;
    }

    // Write all changes once after the loop completes
    setStoredAlerts(alerts);
  } finally {
    isReviewInProgress = false;
  }
}

async function retryFailedAlerts() {
  const emailService = EmailService.getInstance();
  await emailService.retryFailedAlerts();
}

/**
 * Starts the AI background agent that periodically reviews stored alerts and retries failed emails.
 *
 * The agent runs two independent timers:
 * 1. Alert review timer: Fetches pending alerts from localStorage, sends them to the AI service
 *    for analysis, and annotates alerts with diagnostic summaries and suggested fixes.
 * 2. Failed alert retry timer: Attempts to resend alerts that previously failed email delivery.
 *
 * The agent only operates in browser environments (checks for `window` object) and uses
 * localStorage for persistent alert storage. Concurrent reviews are prevented by an internal flag.
 *
 * @param {Partial<AgentConfig>} [config={}] Optional configuration to override defaults.
 *   - alertReviewIntervalMs: Interval between AI review cycles (default: 5 minutes)
 *   - failedAlertRetryIntervalMs: Interval between email retry cycles (default: 1 minute)
 *   - maxAlertsPerReview: Maximum number of alerts to process per review cycle (default: 3)
 *   - aiProvider: AI provider to use ('openai' or 'gemini', default: 'openai')
 *
 * @returns {() => void} Cleanup function that stops both timers when called. Safe to call
 *   multiple times.
 *
 * @example
 * ```typescript
 * // Start the agent with default config
 * const cleanup = startAIBackgroundAgent();
 *
 * // Start with custom intervals
 * const cleanup = startAIBackgroundAgent({
 *   alertReviewIntervalMs: 10 * 60 * 1000, // 10 minutes
 *   maxAlertsPerReview: 5
 * });
 *
 * // Stop the agent when component unmounts
 * cleanup();
 * ```
 */
export function startAIBackgroundAgent(config: Partial<AgentConfig> = {}) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Prevent starting multiple instances
  if (alertReviewTimer !== null || failedAlertTimer !== null) {
    return stopAIBackgroundAgent;
  }

  reviewAlerts(mergedConfig).catch((error) =>
    console.error('AI background agent reviewAlerts error:', error)
  );
  retryFailedAlerts().catch((error) =>
    console.error('AI background agent retryFailedAlerts error:', error)
  );

  alertReviewTimer = window.setInterval(() => reviewAlerts(mergedConfig), mergedConfig.alertReviewIntervalMs);
  failedAlertTimer = window.setInterval(
    () => retryFailedAlerts(),
    mergedConfig.failedAlertRetryIntervalMs
  );

  return stopAIBackgroundAgent;
}

/**
 * Stops the AI background agent by clearing both timers.
 *
 * This function is safe to call multiple times and will only clear timers if they are active.
 * Any in-progress review or retry operations will complete, but no new cycles will start.
 *
 * @example
 * ```typescript
 * stopAIBackgroundAgent();
 * ```
 */
export function stopAIBackgroundAgent() {
  if (alertReviewTimer) {
    window.clearInterval(alertReviewTimer);
    alertReviewTimer = null;
  }

  if (failedAlertTimer) {
    window.clearInterval(failedAlertTimer);
    failedAlertTimer = null;
  }
}
