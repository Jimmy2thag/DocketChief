# DocketChief In-App Assistant

## Overview

The DocketChief Assistant is a memory-enhanced AI assistant that learns from user interactions to provide increasingly personalized and efficient help. It follows the principle of minimal chatter while maximizing task completion speed.

## Key Features

### 🧠 Memory-Based Learning
- Learns user preferences from corrections, repeated choices, and workflow patterns
- Stores preferences locally in browser localStorage
- Adapts tone, defaults, and workflows based on learned patterns
- Confidence threshold system (default: 0.7) for when to ask vs. auto-apply

### 🔒 Privacy & Safety
- All data stored locally on user's device
- Explicit opt-in/opt-out controls
- Memory export functionality for transparency
- Redaction patterns for sensitive data
- Never stores credentials, secrets, health data, or addresses without explicit consent

### 💡 Learning Mechanism

The assistant generates a `LEARNINGS_CANDIDATE` JSON object after each interaction containing:

```typescript
{
  observed_preferences: [],    // User preference patterns detected
  corrections: [],             // When user corrects assistant's actions
  repeated_tasks: [],          // Frequently performed tasks
  failures_and_fixes: [],      // Errors encountered and solutions
  suggestions_to_lock_in: [], // Automation suggestions
  redact_notes: []            // Data to exclude from memory
}
```

### ⚙️ Configurable Settings

#### Response Tone
- **Concise**: Extremely brief, quick answers
- **Balanced**: Professional and efficient (default)
- **Detailed**: Thorough and comprehensive

#### Auto-Apply Learnings
Toggle whether the assistant automatically applies learned preferences or asks for confirmation first.

#### Store Interactions
Enable/disable memory persistence across sessions.

## Usage

### Accessing the Assistant

1. **From Home Page**: Click the "🧠 Smart Assistant" card in the legal tools grid
2. **From Menu**: Navigate to AI Tools → Smart Assistant (New)
3. **Direct URL**: `/assistant` route

### Memory Management

**Export Memory**: Download your assistant's memory as JSON for review or backup
**Clear Memory**: Reset all learned preferences and start fresh

### Example Interactions

**Simple Query:**
```
User: "Help me draft a motion"
Assistant: "I'll help you draft a motion. What type: dismissal, summary judgment, or continuance?"
```

**Learning from Correction:**
```
User: "Create a contract"
Assistant: "Starting contract template. Should I use your preferred clause library?"
User: "No, use the standard template"
[Assistant learns preference for standard template]
```

**Repeated Task Recognition:**
```
User: [Third time creating similar document]
Assistant: "I notice you create discovery motions frequently. Would you like me to create a template for this?"
```

## Technical Architecture

### Components

#### `AssistantChat.tsx`
Main UI component with chat interface, settings dialog, and memory controls.

#### `AssistantContext.tsx`
React context provider managing assistant state, memory, and operations throughout the app.

#### `assistantMemoryService.ts`
Core service handling:
- Memory persistence (localStorage)
- Learning application logic
- System prompt generation with memory context
- LEARNINGS_CANDIDATE parsing

### Type Definitions (`types/assistant.ts`)

```typescript
interface AssistantMemory {
  version: string;
  userId: string;
  lastUpdated: string;
  preferences: {
    tone: 'concise' | 'detailed' | 'balanced';
    confirmationThreshold: number;
    autoApplyLearnings: boolean;
    storeInteractions: boolean;
  };
  learnedPreferences: ObservedPreference[];
  userCorrections: UserCorrection[];
  repeatedTasks: RepeatedTask[];
  defaultValues: Record<string, any>;
  customWorkflows: Array<{...}>;
  redactionPatterns: string[];
  optedOutCategories: string[];
}
```

## Integration

The assistant is integrated into the main application through:

1. **App.tsx**: Wraps app with `AssistantProvider`
2. **AppLayout.tsx**: Routes `/assistant` to `AssistantChat` component
3. **Navigation Menu**: Listed in AI Tools dropdown
4. **Legal Tools Grid**: Featured as first tool with 🧠 icon

## Privacy Compliance

### Data Storage
- All data stored in browser localStorage
- No server-side storage by default
- User has full control and visibility

### Sensitive Data Handling
- Automatically detects and redacts patterns
- User can add custom redaction patterns
- Opt-out respected immediately
- Clear warnings when privacy mode is disabled

### User Rights
- **Right to Access**: Export memory at any time
- **Right to Delete**: Clear all memory instantly
- **Right to Control**: Toggle storage preferences
- **Right to Transparency**: View what's being learned

## Development

### Adding New Learning Patterns

1. Update `LearningsCandidate` type in `types/assistant.ts`
2. Modify system prompt in `assistantMemoryService.ts`
3. Update `applyLearnings` method to process new pattern type

### Extending Memory Features

The memory service is designed to be extensible. To add new memory features:

```typescript
// In assistantMemoryService.ts
export interface ExtendedMemory extends AssistantMemory {
  newFeature: YourType;
}

// Update createDefaultMemory(), saveMemory(), loadMemory()
```

## Troubleshooting

### Memory Not Persisting
- Check "Store interactions" is enabled in settings
- Verify localStorage is not disabled in browser
- Check browser privacy settings allow localStorage

### Assistant Not Learning
- Ensure "Auto-apply learnings" is enabled
- Check confidence threshold (lower = more aggressive learning)
- Review console for parsing errors in LEARNINGS_CANDIDATE

### Privacy Concerns
- Use Export feature to review what's stored
- Use Clear Memory to reset
- Disable "Store interactions" for ephemeral usage

## Future Enhancements

Potential improvements:
- Encrypted storage option
- Cloud sync (with user consent)
- Advanced analytics dashboard
- Shared team memory (workspace mode)
- Integration with case management for context-aware help
- Voice interaction support
- Proactive suggestions based on workflow patterns

## License

Part of DocketChief legal practice management system.
