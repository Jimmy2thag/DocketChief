// Agent Memory Schema and Service
// Handles persistent memory for the in-app agent to learn user preferences

export interface AgentMemory {
  persona: {
    tone: 'concise' | 'verbose' | 'balanced';
    prefers_no_filler: boolean;
    confirmation_threshold: number;
  };
  defaults: {
    deploy_target?: string;
    file_perms_dirs?: string;
    file_perms_files?: string;
    export_format?: 'PDF' | 'DOCX' | 'TXT';
    domain?: string;
    ssl_preference?: string;
    [key: string]: string | undefined;
  };
  shortcuts: Array<{
    name: string;
    trigger_phrases: string[];
    steps: string[];
  }>;
  avoid: string[];
  blacklist: string[];
  consents: {
    remember_preferences: boolean;
    store_emails: boolean;
    [key: string]: boolean;
  };
  history_digest: string[];
  last_updated_iso: string;
}

export interface LearningsCandidate {
  observed_preferences: Array<{
    key: string;
    value: string | boolean | number;
    durability_days: number;
  }>;
  corrections: string[];
  repeated_tasks: Array<{
    name: string;
    trigger_phrases: string[];
    steps: string[];
  }>;
  failures_and_fixes: string[];
  suggestions_to_lock_in: string[];
  redact_notes: string[];
}

const DEFAULT_MEMORY: AgentMemory = {
  persona: {
    tone: 'balanced',
    prefers_no_filler: false,
    confirmation_threshold: 0.7,
  },
  defaults: {
    export_format: 'PDF',
  },
  shortcuts: [],
  avoid: [],
  blacklist: [],
  consents: {
    remember_preferences: true,
    store_emails: false,
  },
  history_digest: [],
  last_updated_iso: new Date().toISOString(),
};

const MEMORY_STORAGE_KEY = 'docketchief_agent_memory';

export class AgentMemoryService {
  private memory: AgentMemory;

  constructor() {
    this.memory = this.loadMemory();
  }

  /**
   * Load memory from localStorage
   */
  private loadMemory(): AgentMemory {
    try {
      const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_MEMORY, ...parsed };
      }
    } catch (error) {
      console.error('[AgentMemory] Failed to load memory:', error);
    }
    return { ...DEFAULT_MEMORY };
  }

  /**
   * Save memory to localStorage
   */
  private saveMemory(): void {
    try {
      this.memory.last_updated_iso = new Date().toISOString();
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memory));
    } catch (error) {
      console.error('[AgentMemory] Failed to save memory:', error);
    }
  }

  /**
   * Get current memory state
   */
  getMemory(): AgentMemory {
    return { ...this.memory };
  }

  /**
   * Update memory with new learnings
   */
  updateFromLearnings(learnings: LearningsCandidate): void {
    if (!this.memory.consents.remember_preferences) {
      return;
    }

    // Apply observed preferences
    for (const pref of learnings.observed_preferences) {
      if (pref.durability_days >= 30) {
        const [namespace, key] = pref.key.split('.');
        
        if (namespace === 'defaults' && key) {
          this.memory.defaults[key] = String(pref.value);
        } else if (namespace === 'persona' && key) {
          // @ts-expect-error - dynamic key assignment for persona properties
          this.memory.persona[key] = pref.value;
        }
      }
    }

    // Add shortcuts from repeated tasks
    for (const task of learnings.repeated_tasks) {
      const existingShortcut = this.memory.shortcuts.find(s => s.name === task.name);
      if (!existingShortcut) {
        this.memory.shortcuts.push(task);
      } else {
        // Update existing shortcut
        existingShortcut.trigger_phrases = [
          ...new Set([...existingShortcut.trigger_phrases, ...task.trigger_phrases])
        ];
        existingShortcut.steps = task.steps;
      }
    }

    // Add to history digest
    const today = new Date().toISOString().split('T')[0];
    if (learnings.corrections.length > 0) {
      this.memory.history_digest.push(
        `${today}: ${learnings.corrections.join('; ')}`
      );
    }

    // Keep only last 10 history items
    if (this.memory.history_digest.length > 10) {
      this.memory.history_digest = this.memory.history_digest.slice(-10);
    }

    this.saveMemory();
  }

  /**
   * Reset memory to defaults
   */
  reset(): void {
    this.memory = { ...DEFAULT_MEMORY };
    this.saveMemory();
  }

  /**
   * Update consent preferences
   */
  updateConsents(consents: Partial<AgentMemory['consents']>): void {
    this.memory.consents = { ...this.memory.consents, ...consents };
    
    // If user opts out of memory, reset it
    if (!this.memory.consents.remember_preferences) {
      this.reset();
    } else {
      this.saveMemory();
    }
  }

  /**
   * Format memory for injection into system prompt
   */
  formatMemoryForPrompt(): string {
    return `MEMORY = ${JSON.stringify(this.memory, null, 2)}`;
  }
}

// Singleton instance
export const agentMemoryService = new AgentMemoryService();
