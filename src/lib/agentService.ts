// Agent Service - Memory-aware AI assistant for DocketChief
// Implements learning capabilities and preference adaptation

import { AIService, ChatMessage } from './aiService';
import { agentMemoryService, LearningsCandidate } from './agentMemory';

const AGENT_SYSTEM_PROMPT = `You are an intelligent in-app agent for DocketChief, a legal research platform.

MISSION
- Help the user complete tasks quickly, with minimal chatter.
- Learn preferences from interactions (implicit + explicit) and apply them next time.

HOW TO LEARN (MEMORY RULES)
- Treat user corrections, repeated choices, renamed defaults, and error fixes as preferences.
- Never assume—when confidence < 0.7, ASK a 1-line confirmation.
- Only store durable facts likely to be useful for ≥30 days.
- Never store sensitive data without explicit user opt-in.

MEMORY INTERFACE
- You receive a JSON object called MEMORY on every request.
- Use MEMORY to adapt defaults, tone, and steps.
- Propose automations only if they reduce steps for the user.

ON EACH TURN
1) Read MEMORY and silently adapt (don't restate it unless the user asks).
2) Answer the user's request.
3) Emit a one-paragraph "LEARNINGS_CANDIDATE" JSON at the end of your reply with:
   - observed_preferences
   - corrections
   - repeated_tasks
   - failures_and_fixes
   - suggestions_to_lock_in
   - redact_notes
   This block is for the server only and will not be shown to the user.

SAFETY & PRIVACY
- If the user says "don't remember this," exclude it and emit redact_notes.
- Do not store credentials, secrets, health data, or precise addresses without opt-in.

CAPABILITIES
You can help with:
- Legal research & case law analysis
- Document review & drafting
- Motion & brief assistance
- Citation formatting
- Procedural guidance
- Task automation based on learned patterns

Always provide accurate, professional legal research assistance while respecting attorney-client privilege principles.`;

export interface AgentResponse {
  response: string;
  provider: string;
  error?: 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'UNKNOWN_ERROR';
  learnings?: LearningsCandidate;
}

export class DocketChiefAgent {
  /**
   * Send a message to the agent with memory context
   */
  async sendMessage(
    conversationHistory: ChatMessage[],
    provider: 'openai' | 'gemini',
    userIdentifier: string
  ): Promise<AgentResponse> {
    // Get current memory state
    const memory = agentMemoryService.getMemory();
    const memoryContext = agentMemoryService.formatMemoryForPrompt();

    // Build system message with memory context
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `${AGENT_SYSTEM_PROMPT}\n\n${memoryContext}\n\nUser: ${userIdentifier}`
    };

    // Prepare messages array with system prompt
    const messagesWithContext: ChatMessage[] = [
      systemMessage,
      ...conversationHistory
    ];

    // Call AI service
    const aiResponse = await AIService.sendMessage(
      messagesWithContext,
      provider,
      userIdentifier
    );

    // Extract learnings from response
    const learnings = this.extractLearnings(aiResponse.response);
    
    // Update memory if learnings found
    if (learnings) {
      agentMemoryService.updateFromLearnings(learnings);
    }

    // Clean the response (remove LEARNINGS_CANDIDATE block)
    const cleanedResponse = this.cleanResponse(aiResponse.response);

    return {
      response: cleanedResponse,
      provider: aiResponse.provider,
      error: aiResponse.error,
      learnings
    };
  }

  /**
   * Extract LEARNINGS_CANDIDATE JSON from AI response
   */
  private extractLearnings(response: string): LearningsCandidate | null {
    try {
      // Look for LEARNINGS_CANDIDATE JSON block
      const learningsMatch = response.match(/LEARNINGS_CANDIDATE[:\s]*(\{[\s\S]*?\})\s*$/);
      
      if (learningsMatch && learningsMatch[1]) {
        const parsed = JSON.parse(learningsMatch[1]);
        return {
          observed_preferences: parsed.observed_preferences || [],
          corrections: parsed.corrections || [],
          repeated_tasks: parsed.repeated_tasks || [],
          failures_and_fixes: parsed.failures_and_fixes || [],
          suggestions_to_lock_in: parsed.suggestions_to_lock_in || [],
          redact_notes: parsed.redact_notes || []
        };
      }
    } catch (error) {
      console.warn('[Agent] Failed to extract learnings:', error);
    }
    return null;
  }

  /**
   * Remove LEARNINGS_CANDIDATE block from response for display to user
   */
  private cleanResponse(response: string): string {
    // Remove LEARNINGS_CANDIDATE JSON block
    return response.replace(/\n*LEARNINGS_CANDIDATE[:\s]*\{[\s\S]*?\}\s*$/g, '').trim();
  }

  /**
   * Get current memory state
   */
  getMemory() {
    return agentMemoryService.getMemory();
  }

  /**
   * Reset agent memory
   */
  resetMemory() {
    agentMemoryService.reset();
  }

  /**
   * Update consent preferences
   */
  updateConsents(consents: { remember_preferences?: boolean; store_emails?: boolean }) {
    agentMemoryService.updateConsents(consents);
  }
}

// Singleton instance
export const docketChiefAgent = new DocketChiefAgent();
