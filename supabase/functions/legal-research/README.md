# Legal Research Edge Function

This Supabase Edge Function provides legal research capabilities through CourtListener API integration and AI-powered summaries.

## Features

- **Case Search**: Search legal cases using CourtListener database
- **Opinion Retrieval**: Get detailed opinion documents
- **Docket Information**: Retrieve docket details
- **AI Summaries**: Generate AI-powered summaries of legal text
- **Combined Search**: Search and automatically summarize results

## Environment Variables

Required environment variables (set in Supabase dashboard or `.env`):

```bash
COURTLISTENER_API_TOKEN=your_courtlistener_token
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com
```

## CourtListener Setup

1. Go to [CourtListener](https://www.courtlistener.com/)
2. Create an account
3. Go to User Profile → API
4. Generate an API token
5. Add `COURTLISTENER_API_TOKEN` to environment variables

## Operations

### 1. Search Cases

Search for cases in the CourtListener database.

**Request:**
```json
{
  "op": "search",
  "query": "patent infringement",
  "court": "scotus",
  "caseName": "Apple",
  "dateFrom": "2020-01-01",
  "dateTo": "2023-12-31",
  "maxResults": 10
}
```

**Parameters:**
- `query` (required): Search query
- `court` (optional): Court identifier
- `caseName` (optional): Filter by case name
- `citation` (optional): Search by citation
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)
- `maxResults` (optional): Number of results (default: 10)

**Response:**
```json
{
  "results": [
    {
      "id": 123,
      "caseName": "Apple Inc. v. Samsung",
      "citation": "580 U.S. 53",
      "court": "Supreme Court",
      "dateField": "2020-06-15",
      "snippet": "Case snippet...",
      ...
    }
  ],
  "count": 42,
  "next": "https://...",
  "previous": null
}
```

### 2. Get Opinion

Retrieve a specific opinion document.

**Request:**
```json
{
  "op": "get_opinion",
  "opinionId": 123456
}
```

**Response:**
```json
{
  "opinion": {
    "id": 123456,
    "author": "Justice Smith",
    "type": "Lead Opinion",
    "text": "Full opinion text...",
    "date_filed": "2020-06-15",
    ...
  }
}
```

### 3. Get Docket

Retrieve docket information.

**Request:**
```json
{
  "op": "get_docket",
  "docketId": 789
}
```

**Response:**
```json
{
  "docket": {
    "id": 789,
    "case_name": "Apple Inc. v. Samsung",
    "docket_number": "14-1234",
    "court": "Supreme Court",
    "date_filed": "2014-03-15",
    ...
  }
}
```

### 4. Summarize Legal Text

Generate AI-powered summary of legal text.

**Request:**
```json
{
  "op": "summarize",
  "text": "Full legal text to summarize...",
  "focusArea": "patent claims analysis"
}
```

**Parameters:**
- `text` (required): Legal text to summarize (max 10,000 chars)
- `focusArea` (optional): Specific area to focus on

**Response:**
```json
{
  "summary": "AI-generated summary...",
  "usage": {
    "prompt_tokens": 500,
    "completion_tokens": 200,
    "total_tokens": 700
  }
}
```

### 5. Search and Summarize

Combined operation: search cases and generate AI summary.

**Request:**
```json
{
  "op": "search_and_summarize",
  "query": "patent infringement smartphones",
  "court": "cafc"
}
```

**Response:**
```json
{
  "results": [
    {
      "caseName": "Apple Inc. v. Samsung",
      "snippet": "...",
      ...
    }
  ],
  "count": 5,
  "summary": "AI analysis of search results highlighting key legal principles...",
  "usage": {
    "total_tokens": 850
  }
}
```

## Usage Example

```typescript
import { supabase } from '@/lib/supabase'

// Search for cases
const { data: searchResults } = await supabase.functions.invoke('legal-research', {
  body: { 
    op: 'search',
    query: 'trademark dilution',
    court: 'ca2',
    maxResults: 20
  }
})

// Get specific opinion
const { data: opinion } = await supabase.functions.invoke('legal-research', {
  body: { 
    op: 'get_opinion',
    opinionId: 123456
  }
})

// Summarize legal text
const { data: summary } = await supabase.functions.invoke('legal-research', {
  body: { 
    op: 'summarize',
    text: opinionText,
    focusArea: 'key holdings'
  }
})

// Search and get AI summary
const { data: analysis } = await supabase.functions.invoke('legal-research', {
  body: { 
    op: 'search_and_summarize',
    query: 'fair use doctrine digital media',
    court: 'ca9'
  }
})
```

## Court Identifiers

Common court identifiers for filtering:
- `scotus`: Supreme Court
- `ca1` - `ca11`: Circuit Courts of Appeal
- `cafc`: Court of Appeals for the Federal Circuit
- `cadc`: D.C. Circuit
- State courts: `cal`, `ny`, `tex`, etc.

See [CourtListener API docs](https://www.courtlistener.com/api/rest-info/) for complete list.

## API Limits

CourtListener has rate limits:
- Free tier: 5,000 requests/day
- Paid tiers available for higher limits

OpenAI costs:
- gpt-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens

## Error Handling

Error responses:
```json
{
  "error": "Description of error",
  "details": "Additional error information"
}
```

HTTP status codes:
- `400`: Invalid request parameters
- `500`: Server configuration error (missing API keys)
- `502`: External API error (CourtListener or OpenAI)

## Best Practices

1. **Cache Results**: Cache search results to reduce API calls
2. **Batch Processing**: For multiple summaries, process in batches
3. **Error Handling**: Handle rate limits gracefully
4. **Text Length**: Trim long texts before summarization
5. **Focus Areas**: Use specific focus areas for better summaries

## Security

- Store API tokens securely as environment variables
- Never expose tokens in frontend code
- Implement authentication before allowing research queries
- Consider rate limiting to prevent abuse
- Log all queries for audit purposes
