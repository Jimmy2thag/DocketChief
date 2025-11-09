# DocketChief Intelligent Agent System

## Overview

The DocketChief Intelligent Agent is a memory-enabled AI assistant that learns from user interactions to provide increasingly personalized assistance. Unlike traditional chatbots, the agent adapts to user preferences, remembers common workflows, and provides contextual help based on past interactions.

## Key Features

### 🧠 Memory & Learning
- **Persistent Memory**: Stores user preferences, shortcuts, and interaction patterns in local storage
- **Adaptive Behavior**: Learns from corrections, repeated tasks, and user choices
- **Privacy-First**: Requires explicit consent to remember preferences; never stores sensitive data without permission

### 🎯 Smart Assistance
- **Contextual Responses**: Uses conversation history and learned preferences to provide relevant answers
- **Minimal Chatter**: Adapts tone based on user preferences (concise, verbose, or balanced)
- **Confidence-Based Confirmation**: Asks for confirmation when confidence is below threshold

### 🔧 Personalization
- **Custom Defaults**: Learns preferred export formats, file permissions, domains, etc.
- **Shortcuts**: Automatically suggests shortcuts for frequently repeated task sequences
- **Tone Adaptation**: Adjusts communication style based on observed preferences

## Architecture

### Components

1. **AgentMemoryService** (`src/lib/agentMemory.ts`)
   - Manages persistent memory storage using localStorage
   - Handles memory schema updates and migrations
   - Provides memory formatting for AI context injection

2. **DocketChiefAgent** (`src/lib/agentService.ts`)
   - Orchestrates AI interactions with memory context
   - Extracts learnings from AI responses
   - Updates memory based on LEARNINGS_CANDIDATE blocks
   - **NEW: Integrates CourtListener bulk data knowledge**

3. **CourtListenerBulkDataService** (`src/lib/courtListenerBulkData.ts`)
   - Provides context about available legal databases
   - Generates motion guidance and research strategies
   - Recommends data sources based on task type
   - References millions of court opinions, dockets, and cases

4. **AgentContext** (`src/contexts/AgentContext.tsx`)
   - React context provider for app-wide agent state
   - Manages memory refresh and consent updates
   - Provides agent enable/disable toggle
   - **NEW: Exposes bulk data methods (generateMotionGuidance, getRecommendedSources)**

5. **AIChat Component** (`src/components/AIChat.tsx`)
   - Enhanced with agent mode toggle
   - Settings menu for memory management
   - Visual indicators for agent status

### Memory Schema

```typescript
interface AgentMemory {
  persona: {
    tone: 'concise' | 'verbose' | 'balanced';
    prefers_no_filler: boolean;
    confirmation_threshold: number;
  };
  defaults: {
    export_format?: 'PDF' | 'DOCX' | 'TXT';
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
  };
  history_digest: string[];
  last_updated_iso: string;
}
```

## Usage

### For Users

#### Enabling Agent Mode

1. Open the AI Chat interface
2. Click the settings icon (⚙️)
3. Toggle "Enable Agent Mode"
4. Optionally enable "Remember Preferences"

#### Agent Features

- **Learning from Corrections**: If you correct the agent, it remembers the correction
- **Task Shortcuts**: Repeated task sequences are automatically detected and offered as shortcuts
- **Preference Adaptation**: The agent learns your preferred formats, tools, and workflows

#### Privacy Controls

- **Reset Memory**: Clears all learned preferences and starts fresh
- **Disable Memory**: Prevents the agent from storing new preferences
- **Clear Chat**: Removes conversation history (memory persists separately)

### For Developers

#### Using the Agent in Code

```typescript
import { docketChiefAgent } from '@/lib/agentService';

// Send a message with memory context
const response = await docketChiefAgent.sendMessage(
  conversationHistory,
  'openai', // or 'gemini'
  userIdentifier
);

// Access current memory
const memory = docketChiefAgent.getMemory();

// Reset memory
docketChiefAgent.resetMemory();

// Update consent
docketChiefAgent.updateConsents({
  remember_preferences: true,
  store_emails: false
});
```

#### Using the Agent Context

```typescript
import { useAgent } from '@/contexts/AgentContext';

function MyComponent() {
  const { memory, refreshMemory, resetMemory, agentEnabled } = useAgent();
  
  // Use memory in your component
  const defaultFormat = memory.defaults.export_format || 'PDF';
  
  return (
    <div>
      <p>Preferred format: {defaultFormat}</p>
      {agentEnabled && <p>Agent is learning!</p>}
    </div>
  );
}
```

## How Learning Works

### LEARNINGS_CANDIDATE Format

The AI model is instructed to emit a JSON block called `LEARNINGS_CANDIDATE` at the end of each response:

```json
{
  "observed_preferences": [
    {
      "key": "persona.tone",
      "value": "concise",
      "durability_days": 365
    }
  ],
  "corrections": [
    "User corrected assumption about file location"
  ],
  "repeated_tasks": [
    {
      "name": "export_document",
      "trigger_phrases": ["export", "download", "save"],
      "steps": ["select_format", "apply_template", "generate"]
    }
  ],
  "failures_and_fixes": [
    "Export failed until format was specified explicitly"
  ],
  "suggestions_to_lock_in": [
    "Always confirm export format before generating"
  ],
  "redact_notes": [
    "Do not store case numbers or client names"
  ]
}
```

This block is:
1. Extracted by `DocketChiefAgent`
2. Removed from the user-facing response
3. Used to update `AgentMemory`

### Learning Triggers

The agent learns from:
- **User Corrections**: "Actually, I meant..."
- **Repeated Choices**: Selecting the same option multiple times
- **Renamed Defaults**: Changing default values
- **Error Fixes**: Resolving errors by changing approach
- **Explicit Instructions**: "Remember this for next time"

### Durability Threshold

Only preferences with `durability_days >= 30` are stored. This prevents storing temporary or one-off choices.

## Security & Privacy

### Data Storage
- All memory is stored in browser localStorage
- No server-side storage of preferences
- Memory is device-specific and portable

### Privacy Protections
- Explicit consent required for memory features
- "Don't remember this" command respected
- No storage of:
  - Credentials or secrets
  - Health data
  - Precise addresses
  - Client-specific information (without opt-in)

### Data Redaction
- Sensitive data is automatically excluded from memory
- Users can request specific items not be remembered
- Memory can be reset at any time

## Best Practices

### For Users
1. **Start Fresh**: Reset memory if you want to establish new preferences
2. **Be Explicit**: Tell the agent when something should or shouldn't be remembered
3. **Regular Reviews**: Periodically check memory settings in the agent menu
4. **Privacy First**: Disable memory when working with sensitive information

### For Developers
1. **Respect Consent**: Always check `memory.consents.remember_preferences` before storing
2. **Durability**: Only store preferences likely to be useful for 30+ days
3. **Security**: Never log or transmit memory contents
4. **Testing**: Test with memory enabled and disabled
5. **Backward Compatibility**: Handle missing memory fields gracefully

## Future Enhancements

Potential improvements to the agent system:
- Cross-device sync (with user opt-in)
- Export/import memory profiles
- Team-shared shortcuts and preferences
- Advanced analytics on learning effectiveness
- Voice command integration
- Proactive suggestions based on context

## Troubleshooting

### Agent Not Learning
- Verify "Enable Agent Mode" is turned on
- Check "Remember Preferences" is enabled
- Ensure localStorage is not disabled in browser

### Memory Not Persisting
- Check browser localStorage quota
- Verify no incognito/private mode
- Check for browser extensions blocking storage

### Incorrect Preferences
- Use "Reset Memory" to clear all learned preferences
- Explicitly correct the agent when it makes wrong assumptions
- Check memory state in browser DevTools: `localStorage.getItem('docketchief_agent_memory')`

## CourtListener Bulk Data Integration

The agent now has access to knowledge about CourtListener's comprehensive bulk data storage, making it a powerful legal research brain. See [BULK_DATA_INTEGRATION.md](./BULK_DATA_INTEGRATION.md) for complete details.

### What This Means

The agent can now:
- Reference millions of court opinions, dockets, and legal documents
- Suggest targeted searches across comprehensive legal databases  
- Provide strategic guidance for motions based on successful precedents
- Recommend specific data sources based on your task (motion, research, citation, etc.)
- Guide you to relevant supporting documentation

### Available Data Sources

The agent knows about:
- **Opinions**: Court opinions from all federal and state courts
- **Dockets**: Docket entries and case information
- **Oral Arguments**: Audio recordings and transcripts
- **Financial Disclosures**: Federal judge financial reports
- **Judge Database**: Comprehensive judicial biographical data
- **RECAP Archive**: PACER documents from the RECAP project

Source: https://com-courtlistener-storage.s3-us-west-2.amazonaws.com/list.html?prefix=bulk-data/

### Example Usage

**User**: "Help me draft a motion to dismiss"

**Agent**: Will now provide:
- Research strategy recommendations
- Specific search suggestions for precedents
- Recommended data sources (opinions, dockets, etc.)
- Citation pattern guidance
- Strategic approach based on successful motions

### For Developers

```typescript
import { useAgent } from '@/contexts/AgentContext';

function Component() {
  const { generateMotionGuidance, getRecommendedSources } = useAgent();
  
  // Get guidance for a specific motion
  const guidance = generateMotionGuidance('summary judgment', 'California');
  
  // Get recommended data sources
  const sources = getRecommendedSources('research');
  
  return <div>{guidance}</div>;
}
```

### What It Doesn't Do

The bulk data integration provides **guidance and context**, but does NOT:
- Automatically search and retrieve documents (requires user action)
- Download or cache bulk data locally (too large)
- Perform real-time searches in bulk data (uses CourtListener API)

The agent acts as an intelligent guide that knows what resources exist and how to use them effectively.

## Support

For issues or questions about the agent system:
1. Check this documentation
2. Review the agent settings menu
3. Reset memory if behavior seems incorrect
4. Contact support with specific examples

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-09  
**Maintained By**: DocketChief Development Team
