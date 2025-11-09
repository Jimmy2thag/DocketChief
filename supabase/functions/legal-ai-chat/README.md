# Legal AI Chat Function

This Supabase Edge Function provides AI-powered legal assistance using either OpenAI's GPT-4 or Google's Gemini Pro models.

## Features

- **Dual Provider Support**: Switch between OpenAI (GPT-4) and Google Gemini Pro
- **Conversation History**: Maintains context across multiple messages
- **Legal-Focused System Prompts**: Optimized for legal drafting and research
- **Rate Limiting**: Handles API rate limits gracefully
- **Error Handling**: Comprehensive error handling and user-friendly messages

## Configuration

### Environment Variables

Required environment variables in your Supabase project:

```bash
# For OpenAI support
OPENAI_API_KEY=sk-...

# For Gemini support  
GOOGLE_AI_API_KEY=...

# CORS configuration (optional)
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com,https://www.docketchief.com
```

### Getting API Keys

**OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add to Supabase project secrets as `OPENAI_API_KEY`

**Google AI API Key:**
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to Supabase project secrets as `GOOGLE_AI_API_KEY`

## API Usage

### Request Format

```typescript
POST /functions/v1/legal-ai-chat

{
  "messages": [
    { "role": "user", "content": "What is a motion for summary judgment?" },
    { "role": "assistant", "content": "A motion for summary judgment..." },
    { "role": "user", "content": "When should it be filed?" }
  ],
  "provider": "openai" | "gemini",  // Optional, defaults to "openai"
  "model": "gpt-4o" | "gemini-pro",  // Optional, defaults based on provider
  "system": "Custom system prompt"    // Optional, defaults to legal assistant prompt
}
```

### Response Format

```typescript
{
  "content": "AI response text...",
  "usage": {
    "promptTokens": 100,
    "completionTokens": 50,
    "totalTokens": 150
  }
}
```

### Error Responses

```typescript
// Missing API Key
{
  "error": "OPENAI_API_KEY missing" | "GOOGLE_AI_API_KEY missing"
}

// API Request Failed
{
  "error": "OpenAI request failed" | "Gemini request failed",
  "details": "..."
}

// Invalid Request
{
  "error": "Message is required"
}
```

## Provider Differences

### OpenAI (GPT-4)
- **Model**: `gpt-4o`, `gpt-4o-mini`
- **Strengths**: Excellent reasoning, verbose explanations
- **Rate Limits**: Based on your OpenAI tier
- **System Prompts**: Supports system messages natively

### Google Gemini Pro
- **Model**: `gemini-pro`
- **Strengths**: Fast responses, good context understanding
- **Rate Limits**: 60 requests per minute (free tier)
- **System Prompts**: Converted to user/model conversation pairs

## Deployment

### Deploy to Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy legal-ai-chat

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GOOGLE_AI_API_KEY=...
```

### Local Development

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve legal-ai-chat --env-file .env.local

# Test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/legal-ai-chat' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"Explain attorney-client privilege"}],"provider":"openai"}'
```

## Frontend Integration

The function is called from `src/lib/aiService.ts`:

```typescript
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.functions.invoke('legal-ai-chat', {
  body: {
    messages: conversationHistory,
    provider: 'gemini', // or 'openai'
    model: 'gemini-pro', // or 'gpt-4o'
    userIdentifier: user?.email
  }
})
```

## Rate Limiting

### OpenAI
- Tier 1: 500 RPM, 10,000 TPM
- Tier 2: 5,000 RPM, 100,000 TPM
- Handle 429 errors and implement retry logic

### Gemini
- Free tier: 60 requests per minute
- Paid tier: Higher limits available
- Handle 429 errors with exponential backoff

## Security Considerations

1. **API Keys**: Never expose API keys in client code
2. **CORS**: Configure `ALLOWED_ORIGINS` to restrict access
3. **Rate Limiting**: Implement user-level rate limiting
4. **Input Validation**: All inputs are validated before processing
5. **Content Safety**: Gemini includes built-in safety filters

## Monitoring

Monitor function performance in Supabase Dashboard:
- Go to Edge Functions → legal-ai-chat
- View invocations, errors, and logs
- Set up alerts for error rates

## Troubleshooting

### "API Key missing" Error
- Verify environment variables are set in Supabase project
- Check variable names match exactly (case-sensitive)

### 502 Bad Gateway
- Check API key validity
- Verify API provider status
- Review function logs for detailed error messages

### Slow Responses
- OpenAI: Consider using `gpt-4o-mini` for faster responses
- Gemini: Generally faster, already optimized
- Implement timeout handling on frontend

## Cost Optimization

### OpenAI Costs
- GPT-4o: $2.50 / 1M input tokens, $10.00 / 1M output tokens
- GPT-4o-mini: $0.15 / 1M input tokens, $0.60 / 1M output tokens
- Recommend gpt-4o-mini for most use cases

### Gemini Costs
- Free tier: 60 requests per minute
- Paid tier: $0.00025 / 1K characters (input), $0.0005 / 1K characters (output)
- Generally more cost-effective for high volume

### Best Practices
- Cache common queries
- Implement conversation context limits
- Use cheaper models for simple queries
- Monitor token usage
