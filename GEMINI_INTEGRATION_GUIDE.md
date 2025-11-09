# Gemini AI Integration Guide

This guide explains how to set up and use Google Gemini AI in DocketChief alongside OpenAI's GPT-4.

## Overview

DocketChief now supports **dual AI providers**:
- **OpenAI GPT-4** - For advanced reasoning and complex legal analysis
- **Google Gemini Pro** - For fast, efficient legal research and document analysis

Users can switch between providers in real-time through the UI.

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### 2. Configure Environment Variables

#### For Local Development

1. Create a `.env` file in your project root (if not exists)
2. Add the following variables:

```bash
# OpenAI API Key (existing)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API Key (new)
GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

#### For Supabase Edge Functions

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Project Settings** → **Edge Functions**
3. Add the environment variable:
   - Variable name: `GOOGLE_AI_API_KEY`
   - Value: Your Gemini API key

Or use the Supabase CLI:

```bash
supabase secrets set GOOGLE_AI_API_KEY=your_gemini_api_key_here
```

### 3. Deploy Edge Function

After setting the environment variable, redeploy the edge function:

```bash
supabase functions deploy legal-ai-chat
```

## Usage

### In the AI Chat Interface

1. Open the **AI Chat** component in DocketChief
2. Use the dropdown selector to choose between:
   - **GPT-4** (OpenAI)
   - **Gemini Pro** (Google)
3. Type your legal question and send
4. The response will be generated using your selected provider

### In Other Components

The provider selection is also available in:
- **Document Analyzer** - Analyze legal documents
- **File Upload** - AI-powered file analysis
- **Conversation Import** - Import chats from ChatGPT or Gemini

## API Details

### Request Format

The edge function accepts the following parameters:

```typescript
{
  messages: [
    { role: 'user' | 'assistant', content: string }
  ],
  provider: 'openai' | 'gemini',  // Optional, defaults to 'openai'
  model: string,                  // Optional, uses provider default
  system: string,                 // Optional system prompt
  userIdentifier: string          // Optional user ID for tracking
}
```

### Supported Models

#### OpenAI
- `gpt-4o` (default)
- `gpt-4o-mini`
- `gpt-4`
- `gpt-3.5-turbo`

#### Gemini
- `gemini-pro` (default)
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### Response Format

Both providers return a consistent response format:

```typescript
{
  content: string,   // AI-generated response
  usage: object      // Token usage information
}
```

## Technical Implementation

### Message Format Conversion

The edge function automatically converts between OpenAI and Gemini message formats:

**OpenAI format:**
```json
{
  "role": "assistant",
  "content": "Response text"
}
```

**Gemini format:**
```json
{
  "role": "model",
  "parts": [{ "text": "Response text" }]
}
```

### Error Handling

The function provides consistent error handling for both providers:
- API key missing errors
- Rate limiting errors
- Service unavailability
- Invalid request errors

## Best Practices

### When to Use Each Provider

**Use GPT-4 for:**
- Complex legal reasoning
- Multi-step analysis
- Detailed document drafting
- Citation verification

**Use Gemini Pro for:**
- Quick legal research
- Document summarization
- Simple Q&A
- Cost-effective queries

### Rate Limits

Be aware of rate limits for each provider:
- **OpenAI**: Varies by plan (check [OpenAI dashboard](https://platform.openai.com/account/rate-limits))
- **Gemini**: 60 requests per minute (free tier), higher for paid tiers

### Cost Optimization

- Gemini Pro is generally more cost-effective for high-volume usage
- Use GPT-4 for complex tasks that require superior reasoning
- Monitor usage in respective dashboards

## Troubleshooting

### "GOOGLE_AI_API_KEY missing" Error

**Solution:** Ensure the API key is set in Supabase environment variables and the edge function is redeployed.

### Empty or Malformed Responses

**Solution:** Check that you're using a supported Gemini model name. The default `gemini-pro` should always work.

### Rate Limit Errors

**Solution:** 
- Implement exponential backoff in retries
- Consider upgrading to a paid plan
- Switch to the alternate provider temporarily

### Different Response Quality

**Note:** Each AI provider has different strengths. If responses aren't meeting expectations with one provider, try switching to the other.

## Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for all API keys
3. **Rotate keys regularly** for security
4. **Monitor usage** in both provider dashboards
5. **Set up billing alerts** to avoid unexpected charges

## Additional Resources

- [Google AI Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)

## Support

For issues or questions about the Gemini integration:
1. Check the Supabase function logs
2. Review the error messages in the browser console
3. Verify API key validity in Google AI Studio
4. Check rate limits and quotas

---

**Last Updated:** November 2025
**Version:** 1.0
