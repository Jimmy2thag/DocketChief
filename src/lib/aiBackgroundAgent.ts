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
  try {
    return JSON.parse(localStorage.getItem(ALERTS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setStoredAlerts(alerts: StoredAlert[]) {
  localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
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
  const alerts = getStoredAlerts();
  const pendingAlerts = alerts.filter((alert) => shouldRetryReview(alert.aiReview));

  if (pendingAlerts.length === 0) {
    return;
  }

  const emailService = EmailService.getInstance();
  let processed = 0;

  for (const alert of pendingAlerts) {
    if (processed >= config.maxAlertsPerReview) {
      break;
    }

    alert.aiReview = {
      status: 'pending',
      lastAttempt: new Date().toISOString()
    };

    setStoredAlerts(alerts);

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

    setStoredAlerts(alerts);
    processed += 1;
    await emailService.retryFailedAlerts(1);
  }
}

async function retryFailedAlerts() {
  const emailService = EmailService.getInstance();
  await emailService.retryFailedAlerts();
}

export function startAIBackgroundAgent(config: Partial<AgentConfig> = {}) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  if (alertReviewTimer || failedAlertTimer) {
    return stopAIBackgroundAgent;
  }

  reviewAlerts(mergedConfig).catch((error) =>
    console.error('AI background agent reviewAlerts error:', error)
  );
  retryFailedAlerts().catch((error) =>
    console.error('AI background agent retryFailedAlerts error:', error)
  );
  reviewAlerts(mergedConfig);
  retryFailedAlerts();

  alertReviewTimer = window.setInterval(() => reviewAlerts(mergedConfig), mergedConfig.alertReviewIntervalMs);
  failedAlertTimer = window.setInterval(
    () => retryFailedAlerts(),
    mergedConfig.failedAlertRetryIntervalMs
  );

  return stopAIBackgroundAgent;
}

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
