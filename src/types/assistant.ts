/**
 * Types for the In-App Assistant Memory System
 * 
 * This defines the structure for learning user preferences and adapting behavior.
 */

export interface ObservedPreference {
  key: string;
  value: string;
  confidence: number; // 0-1 scale
  observedAt: string; // ISO timestamp
  category: 'tone' | 'workflow' | 'defaults' | 'format' | 'other';
}

export interface UserCorrection {
  originalAction: string;
  correctedAction: string;
  context: string;
  timestamp: string;
}

export interface RepeatedTask {
  taskType: string;
  pattern: string;
  frequency: number;
  lastOccurrence: string;
  suggestedAutomation?: string;
}

export interface FailureAndFix {
  failureType: string;
  solution: string;
  timestamp: string;
  preventionRule?: string;
}

export interface SuggestionToLockIn {
  suggestion: string;
  benefit: string;
  confidence: number;
  requiresConfirmation: boolean;
}

export interface RedactNote {
  reason: string;
  pattern: string;
  timestamp: string;
}

/**
 * LEARNINGS_CANDIDATE - Generated at the end of each assistant response
 * This is for server processing and not shown to the user
 */
export interface LearningsCandidate {
  observed_preferences: ObservedPreference[];
  corrections: UserCorrection[];
  repeated_tasks: RepeatedTask[];
  failures_and_fixes: FailureAndFix[];
  suggestions_to_lock_in: SuggestionToLockIn[];
  redact_notes: RedactNote[];
}

/**
 * MEMORY - The persistent memory object loaded on each request
 */
export interface AssistantMemory {
  version: string;
  userId: string;
  lastUpdated: string;
  
  // User preferences
  preferences: {
    tone: 'concise' | 'detailed' | 'balanced';
    confirmationThreshold: number; // confidence level below which to ask
    autoApplyLearnings: boolean;
    storeInteractions: boolean; // privacy control
  };
  
  // Learned behaviors
  learnedPreferences: ObservedPreference[];
  userCorrections: UserCorrection[];
  repeatedTasks: RepeatedTask[];
  
  // Workflow adaptations
  defaultValues: Record<string, any>;
  customWorkflows: Array<{
    name: string;
    steps: string[];
    triggers: string[];
  }>;
  
  // Privacy and redaction rules
  redactionPatterns: string[];
  optedOutCategories: string[];
}

/**
 * Initial/default memory structure
 */
export const createDefaultMemory = (userId: string): AssistantMemory => ({
  version: '1.0.0',
  userId,
  lastUpdated: new Date().toISOString(),
  preferences: {
    tone: 'balanced',
    confirmationThreshold: 0.7,
    autoApplyLearnings: true,
    storeInteractions: true,
  },
  learnedPreferences: [],
  userCorrections: [],
  repeatedTasks: [],
  defaultValues: {},
  customWorkflows: [],
  redactionPatterns: [],
  optedOutCategories: [],
});

/**
 * Message structure for assistant chat
 */
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  learningsCandidate?: LearningsCandidate;
  memorySnapshot?: Partial<AssistantMemory>;
}
