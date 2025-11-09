# ChatGPT Agent Integration Guide

## Overview

DocketChief integrates advanced AI capabilities through OpenAI's GPT-4 and Google's Gemini Pro models to provide comprehensive legal assistance. This integration enables legal professionals to access AI-powered research, document analysis, and drafting support directly within the application.

## Features

### 1. Dual AI Provider Support
- **OpenAI GPT-4o**: Primary AI provider for legal assistance
- **Gemini Pro**: Alternative AI provider for enhanced flexibility

### 2. Legal-Specialized System Prompt
The AI assistant is configured with a specialized legal system prompt that:
- Focuses on legal research and analysis
- Emphasizes accurate citation formatting
- Provides procedural guidance
- Distinguishes between general information and legal advice
- Never fabricates case citations or legal authorities

### 3. Comprehensive Legal Capabilities
- **Legal Research & Analysis**: Case law, statutes, and regulations analysis
- **Document Review**: Identify key issues, risks, and opportunities
- **Motion & Brief Assistance**: Draft persuasive legal arguments
- **Citation Support**: Format legal citations correctly
- **Procedural Guidance**: Information on legal procedures and requirements

## Architecture

### Frontend Components

#### AIChat Component (`src/components/AIChat.tsx`)
- Real-time chat interface with message history
- Provider selection (GPT-4 or Gemini Pro)
- Rate limiting warnings
- Error handling with user-friendly messages
- Conversation persistence in local state

#### AI Service (`src/lib/aiService.ts`)
- Abstracts AI provider communication
- Handles message formatting
- Manages conversation history
- Error handling and service status tracking

### Backend Edge Function

#### Legal AI Chat (`supabase/functions/legal-ai-chat/index.ts`)
- Supabase Edge Function for secure API key management
- CORS configuration for secure cross-origin requests
- Dual provider support (OpenAI and Gemini)
- Enhanced error handling and logging
- Token usage tracking

## Configuration

### Environment Variables

#### Frontend (Vite)
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=Docket Chief
VITE_ENVIRONMENT=production
VITE_PAYMENTS_ENABLED=false
```

#### Backend (Supabase Edge Functions)
```bash
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...  # Optional for Gemini support
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com,https://www.docketchief.com
```

### Model Configuration

#### OpenAI
- **Model**: gpt-4o (upgraded from gpt-4o-mini)
- **Temperature**: 0.2 (for consistent, focused responses)
- **Max Tokens**: 4000
- **API Endpoint**: https://api.openai.com/v1/chat/completions

#### Gemini
- **Model**: gemini-pro
- **Temperature**: 0.2
- **Max Output Tokens**: 4000
- **API Endpoint**: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent

## Deployment

### Step 1: Set Up Supabase Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy legal-ai-chat

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-your-key
supabase secrets set ALLOWED_ORIGINS=https://docketchief.com,https://www.docketchief.com

# Optional: Add Gemini support
supabase secrets set GOOGLE_AI_API_KEY=your-gemini-key
```

### Step 2: Build and Deploy Frontend

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Deploy (varies by hosting provider)
# For cPanel: Upload contents of dist/ to public_html/
```

## Usage

### Accessing the AI Chat

1. Navigate to DocketChief application
2. Click on "AI Tools" in the navigation menu
3. Select "AI Chat"
4. Choose your preferred AI provider (GPT-4 or Gemini Pro)
5. Start asking legal questions or requesting assistance

### Example Queries

**Legal Research**:
```
"What are the key elements of a motion to dismiss for lack of jurisdiction?"
```

**Document Analysis**:
```
"Review this contract clause and identify any potential risks: [paste clause]"
```

**Citation Formatting**:
```
"How should I cite Smith v. Jones, 123 F.3d 456 (9th Cir. 2020) in a brief?"
```

**Procedural Guidance**:
```
"What are the deadlines for responding to a motion for summary judgment in federal court?"
```

## Rate Limiting

The system includes built-in rate limiting to prevent API abuse:
- User identification by email
- Graceful degradation with user-friendly messages
- Automatic retry suggestions

## Error Handling

### Frontend
- User-friendly error messages
- Visual indicators for service issues
- Fallback responses for technical difficulties

### Backend
- Comprehensive error logging
- HTTP status code management
- Detailed error responses for debugging

## Security

### API Key Management
- API keys stored securely in Supabase secrets
- Never exposed to frontend code
- Environment-specific configuration

### CORS Configuration
- Whitelist of allowed origins
- Secure cross-origin request handling
- Origin validation on every request

### Content Security
- Input validation and sanitization
- Message length limits (1000 characters)
- Response size limits (4000 tokens)

## Monitoring and Maintenance

### Service Status
- Service availability tracking
- Last check timestamp
- Error rate monitoring

### Usage Tracking
- Token usage per request
- Provider selection metrics
- Response time monitoring

## Troubleshooting

### Common Issues

**Issue**: "OPENAI_API_KEY missing"
- **Solution**: Ensure API key is set in Supabase secrets

**Issue**: "Rate limited" message
- **Solution**: Wait a few moments before retrying, or switch AI providers

**Issue**: "Service unavailable"
- **Solution**: Check Supabase Edge Function logs for errors

**Issue**: Gemini not working
- **Solution**: Verify GOOGLE_AI_API_KEY is set in Supabase secrets

### Checking Logs

```bash
# View edge function logs
supabase functions logs legal-ai-chat

# Stream logs in real-time
supabase functions logs legal-ai-chat --follow
```

## Future Enhancements

### Planned Features
1. Conversation history persistence to database
2. Export conversation to PDF
3. Share conversations with colleagues
4. Advanced legal document templates
5. Integration with case management system
6. Voice input support
7. Multi-language support
8. Custom model fine-tuning

### API Upgrades
1. Streaming responses for real-time feedback
2. Function calling for structured outputs
3. Vision support for document image analysis
4. Retrieval Augmented Generation (RAG) for case law

## Best Practices

### For Users
1. Be specific in your queries
2. Provide context when asking about documents
3. Use the AI as a research assistant, not a replacement for legal counsel
4. Verify all citations and legal authorities independently
5. Review all AI-generated content carefully

### For Developers
1. Keep API keys secure and rotate regularly
2. Monitor token usage to control costs
3. Implement rate limiting at multiple levels
4. Log errors for debugging but avoid logging sensitive data
5. Test edge function changes in development environment first
6. Keep system prompts updated with best practices

## Support

For technical support or questions about the ChatGPT integration:
1. Check the logs in Supabase dashboard
2. Review error messages in browser console
3. Consult this documentation
4. Contact the development team

## License

This integration is part of the DocketChief application and follows the same licensing terms.

---

**Last Updated**: 2025-11-09
**Version**: 1.0.0
