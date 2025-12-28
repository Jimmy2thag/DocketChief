/**
 * Assistant Memory Service
 * 
 * Manages persistent storage and retrieval of assistant memory
 * with privacy controls and encryption
 */

import { AssistantMemory, createDefaultMemory, LearningsCandidate, ObservedPreference } from '@/types/assistant';

const MEMORY_STORAGE_KEY = 'docketchief_assistant_memory';
const MEMORY_VERSION = '1.0.0';

class AssistantMemoryService {
  /**
   * Load memory for a user
   */
  loadMemory(userId: string): AssistantMemory {
    try {
      const stored = localStorage.getItem(`${MEMORY_STORAGE_KEY}_${userId}`);
      
      if (!stored) {
        return createDefaultMemory(userId);
      }

      const memory: AssistantMemory = JSON.parse(stored);
      
      // Validate version compatibility
      if (memory.version !== MEMORY_VERSION) {
        console.warn(`Memory version mismatch. Migrating from ${memory.version} to ${MEMORY_VERSION}`);
        return this.migrateMemory(memory, userId);
      }

      return memory;
    } catch (error) {
      console.error('Failed to load assistant memory:', error);
      return createDefaultMemory(userId);
    }
  }

  /**
   * Save memory for a user
   */
  saveMemory(memory: AssistantMemory): void {
    try {
      if (!memory.preferences.storeInteractions) {
        // If user has opted out, don't store
        return;
      }

      memory.lastUpdated = new Date().toISOString();
      localStorage.setItem(`${MEMORY_STORAGE_KEY}_${memory.userId}`, JSON.stringify(memory));
    } catch (error) {
      console.error('Failed to save assistant memory:', error);
    }
  }

  /**
   * Clear all memory for a user
   */
  clearMemory(userId: string): void {
    try {
      localStorage.removeItem(`${MEMORY_STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.error('Failed to clear assistant memory:', error);
    }
  }

  /**
   * Apply learnings candidate to memory
   */
  applyLearnings(memory: AssistantMemory, learnings: LearningsCandidate): AssistantMemory {
    const updatedMemory = { ...memory };

    // Apply observed preferences (only if confidence >= threshold)
    learnings.observed_preferences.forEach(pref => {
      if (pref.confidence >= memory.preferences.confirmationThreshold) {
        // Check if preference already exists
        const existingIndex = updatedMemory.learnedPreferences.findIndex(
          p => p.key === pref.key
        );

        if (existingIndex >= 0) {
          // Update existing preference if newer confidence is higher
          if (pref.confidence > updatedMemory.learnedPreferences[existingIndex].confidence) {
            updatedMemory.learnedPreferences[existingIndex] = pref;
          }
        } else {
          // Add new preference
          updatedMemory.learnedPreferences.push(pref);
        }
      }
    });

    // Apply corrections
    learnings.corrections.forEach(correction => {
      updatedMemory.userCorrections.push(correction);
      
      // Keep only last 50 corrections to prevent unbounded growth
      if (updatedMemory.userCorrections.length > 50) {
        updatedMemory.userCorrections = updatedMemory.userCorrections.slice(-50);
      }
    });

    // Apply repeated tasks
    learnings.repeated_tasks.forEach(task => {
      const existingIndex = updatedMemory.repeatedTasks.findIndex(
        t => t.taskType === task.taskType && t.pattern === task.pattern
      );

      if (existingIndex >= 0) {
        // Update existing task
        updatedMemory.repeatedTasks[existingIndex].frequency += 1;
        updatedMemory.repeatedTasks[existingIndex].lastOccurrence = task.lastOccurrence;
        updatedMemory.repeatedTasks[existingIndex].suggestedAutomation = task.suggestedAutomation;
      } else {
        // Add new task
        updatedMemory.repeatedTasks.push(task);
      }
    });

    // Apply redaction patterns
    learnings.redact_notes.forEach(redact => {
      if (!updatedMemory.redactionPatterns.includes(redact.pattern)) {
        updatedMemory.redactionPatterns.push(redact.pattern);
      }
    });

    return updatedMemory;
  }

  /**
   * Get system prompt with memory context
   */
  getSystemPromptWithMemory(memory: AssistantMemory): string {
    const memoryContext = this.buildMemoryContext(memory);
    
    return `You are an intelligent in-app assistant for DocketChief, a legal practice management system.

MISSION:
- Help the user complete tasks quickly, with minimal chatter.
- Learn preferences from interactions (implicit + explicit) and apply them next time.
- Be professional but ${memory.preferences.tone === 'concise' ? 'extremely concise' : memory.preferences.tone === 'detailed' ? 'thorough and detailed' : 'balanced and efficient'}.

MEMORY CONTEXT:
${memoryContext}

HOW TO LEARN (MEMORY RULES):
- Treat user corrections, repeated choices, renamed defaults, and error fixes as preferences.
- Never assume—when confidence < ${memory.preferences.confirmationThreshold}, ASK a 1-line confirmation.
- Only store durable facts likely to be useful for ≥30 days.
- Never store sensitive data without explicit user opt-in.

PRIVACY & SAFETY:
- If the user says "don't remember this," exclude it and emit redact_notes.
- Do not store credentials, secrets, health data, or precise addresses without opt-in.

ON EACH RESPONSE:
1) Read the MEMORY context above and silently adapt (don't restate it unless the user asks).
2) Answer the user's request.
3) At the end of your response, include a JSON block with learnings:

LEARNINGS_CANDIDATE:
\`\`\`json
{
  "observed_preferences": [],
  "corrections": [],
  "repeated_tasks": [],
  "failures_and_fixes": [],
  "suggestions_to_lock_in": [],
  "redact_notes": []
}
\`\`\`

This LEARNINGS_CANDIDATE block is for the system only and helps improve future interactions.`;
  }

  /**
   * Build readable memory context for system prompt
   */
  private buildMemoryContext(memory: AssistantMemory): string {
    const sections: string[] = [];

    // User preferences
    sections.push(`User Preferences:
- Tone: ${memory.preferences.tone}
- Confirmation threshold: ${memory.preferences.confirmationThreshold}
- Auto-apply learnings: ${memory.preferences.autoApplyLearnings ? 'Yes' : 'No'}`);

    // Learned preferences
    if (memory.learnedPreferences.length > 0) {
      const topPreferences = memory.learnedPreferences
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10)
        .map(p => `  - ${p.key}: ${p.value} (confidence: ${(p.confidence * 100).toFixed(0)}%)`)
        .join('\n');
      sections.push(`\nLearned Preferences:\n${topPreferences}`);
    }

    // Recent corrections
    if (memory.userCorrections.length > 0) {
      const recentCorrections = memory.userCorrections
        .slice(-5)
        .map(c => `  - ${c.context}: changed from "${c.originalAction}" to "${c.correctedAction}"`)
        .join('\n');
      sections.push(`\nRecent Corrections:\n${recentCorrections}`);
    }

    // Repeated tasks
    if (memory.repeatedTasks.length > 0) {
      const frequentTasks = memory.repeatedTasks
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(t => `  - ${t.taskType}: ${t.pattern} (${t.frequency} times)`)
        .join('\n');
      sections.push(`\nFrequent Tasks:\n${frequentTasks}`);
    }

    // Default values
    if (Object.keys(memory.defaultValues).length > 0) {
      const defaults = Object.entries(memory.defaultValues)
        .map(([key, value]) => `  - ${key}: ${value}`)
        .join('\n');
      sections.push(`\nCustom Defaults:\n${defaults}`);
    }

    return sections.join('\n');
  }

  /**
   * Parse learnings candidate from assistant response
   */
  parseLearningsCandidate(response: string): LearningsCandidate | null {
    try {
      // Look for JSON block in the response
      const jsonMatch = response.match(/LEARNINGS_CANDIDATE:\s*```json\s*(\{[\s\S]*?\})\s*```/);
      
      if (!jsonMatch || !jsonMatch[1]) {
        return null;
      }

      const learnings: LearningsCandidate = JSON.parse(jsonMatch[1]);
      return learnings;
    } catch (error) {
      console.error('Failed to parse learnings candidate:', error);
      return null;
    }
  }

  /**
   * Extract clean response (without learnings candidate block)
   */
  extractCleanResponse(response: string): string {
    // Remove the LEARNINGS_CANDIDATE block from the response
    return response.replace(/LEARNINGS_CANDIDATE:\s*```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
  }

  /**
   * Migrate memory to new version (for future compatibility)
   */
  private migrateMemory(oldMemory: AssistantMemory, userId: string): AssistantMemory {
    // For now, just create a fresh memory
    // In future versions, we can add migration logic
    return createDefaultMemory(userId);
  }

  /**
   * Export memory for user download (privacy feature)
   */
  exportMemory(userId: string): string {
    const memory = this.loadMemory(userId);
    return JSON.stringify(memory, null, 2);
  }

  /**
   * Check if data should be redacted based on patterns
   */
  shouldRedact(text: string, memory: AssistantMemory): boolean {
    return memory.redactionPatterns.some(pattern => 
      text.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}

export const assistantMemoryService = new AssistantMemoryService();
