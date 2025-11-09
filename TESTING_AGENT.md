# Testing Guide for Agent System

## Manual Testing Checklist

### 1. Basic Agent Functionality

#### Enable Agent Mode
1. Open the application
2. Navigate to the AI Chat interface
3. Click the Settings icon (⚙️)
4. Toggle "Enable Agent Mode" on
5. ✅ Verify "Memory Active" badge appears in the header

#### Memory Preferences
1. In Settings menu, toggle "Remember Preferences" on
2. ✅ Verify toast notification appears
3. Toggle it off
4. ✅ Verify toast notification confirms disabling

### 2. Learning Capabilities

#### Test Preference Learning
1. Enable Agent Mode with Memory
2. Send message: "I prefer PDF format for exports"
3. Send message: "Export the document"
4. ✅ Agent should remember and suggest PDF format
5. Check localStorage: `localStorage.getItem('docketchief_agent_memory')`
6. ✅ Verify memory contains export_format preference

#### Test Repeated Tasks
1. Perform same task 2-3 times (e.g., "format citation in Bluebook style")
2. ✅ Agent should recognize pattern and offer shortcut
3. Check memory for shortcuts array
4. ✅ Verify shortcut is stored

#### Test Corrections
1. Send: "Export to Word"
2. Agent responds
3. Send: "Actually, I meant PDF"
4. ✅ Agent should acknowledge correction
5. ✅ Memory should update to reflect corrected preference

### 3. Privacy & Security

#### Test Consent Enforcement
1. Disable "Remember Preferences"
2. Interact with agent
3. Check localStorage
4. ✅ Memory should not update with new preferences
5. ✅ Previous memory should be cleared

#### Test Redaction
1. Send: "My API key is xyz123, but don't remember it"
2. ✅ Agent should process request but not store the key
3. Check memory
4. ✅ Verify no API key in stored memory

#### Test Reset Memory
1. Build up some preferences
2. Click Settings → "Reset Memory"
3. ✅ Verify confirmation toast
4. Check localStorage
5. ✅ Memory should be reset to defaults

### 4. UI/UX Verification

#### Settings Menu
1. Click Settings icon
2. ✅ Dropdown menu appears with:
   - Enable Agent Mode (checkbox)
   - Remember Preferences (checkbox)
   - Clear Chat (menu item)
   - Reset Memory (menu item)
3. ✅ Remember Preferences is disabled when Agent Mode is off
4. ✅ Reset Memory is disabled when Agent Mode is off

#### Visual Indicators
1. Enable Agent Mode
2. ✅ "Memory Active" badge with brain icon visible
3. Disable Agent Mode
4. ✅ Badge disappears
5. ✅ Agent status reflected in welcome message

#### Provider Selection
1. ✅ GPT-4 / Gemini Pro selector still works
2. ✅ Works with both providers when Agent Mode is enabled
3. ✅ Works with both providers when Agent Mode is disabled

### 5. Fallback & Error Handling

#### Test Standard Mode
1. Disable Agent Mode
2. Send messages
3. ✅ Chat works exactly as before (no regression)
4. ✅ No memory-related errors in console

#### Test with No Memory
1. Clear localStorage completely
2. Reload page
3. Enable Agent Mode
4. ✅ Default memory initializes correctly
5. ✅ No errors in console

#### Test Storage Quota
1. Fill localStorage near capacity
2. Use agent normally
3. ✅ Graceful handling of storage errors (check console)

### 6. Integration Tests

#### Test with Auth Context
1. Log in as a user
2. Use agent
3. ✅ User identifier passed correctly to AI service
4. Log out
5. Use agent as anonymous
6. ✅ Works with 'anonymous' identifier

#### Test with Existing Chat
1. Have existing conversation
2. Enable Agent Mode mid-conversation
3. ✅ Conversation continues seamlessly
4. ✅ Memory starts learning from that point forward

### 7. Performance

#### Memory Size
1. Use agent extensively
2. Check memory size: `localStorage.getItem('docketchief_agent_memory').length`
3. ✅ Memory stays under 10KB even after heavy use
4. ✅ History digest limited to 10 entries

#### Response Time
1. Send message with Agent Mode on
2. Send same type of message with Agent Mode off
3. ✅ Response times should be similar (< 1s difference)

## Automated Testing Notes

### Unit Tests (Future)
- Test `AgentMemoryService` methods
- Test `DocketChiefAgent` learning extraction
- Test memory update logic
- Test consent enforcement

### Integration Tests (Future)
- Test full conversation flow with memory
- Test memory persistence across page reloads
- Test multi-session scenarios

### E2E Tests (Future)
- Test complete user journey with agent
- Test settings interactions
- Test memory reset and consent flows

## Known Limitations

1. **Memory is per-device**: Uses localStorage, not synced across devices
2. **Browser-specific**: Incognito mode won't persist memory
3. **Storage limit**: Subject to browser's localStorage quota (~5-10MB)
4. **AI-dependent**: Learning quality depends on AI model's response format

## Debugging Tips

### View Memory State
```javascript
// In browser console:
JSON.parse(localStorage.getItem('docketchief_agent_memory'))
```

### Clear Memory
```javascript
// In browser console:
localStorage.removeItem('docketchief_agent_memory')
```

### Check Agent Responses
- Open browser DevTools → Network tab
- Monitor calls to `legal-ai-chat` function
- Check response payloads for LEARNINGS_CANDIDATE blocks

### Console Warnings
- Watch for `[AgentMemory]` prefixed messages
- Watch for `[Agent]` prefixed messages
- These indicate memory/learning operations
