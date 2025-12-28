# Case Law Analysis Edge Function

This Supabase Edge Function provides AI-powered analysis of case law documents.

## Features

- **Case Summaries**: Generate concise case summaries
- **Precedent Analysis**: Identify and analyze cited precedents
- **Holdings Extraction**: Extract and explain legal holdings
- **Full Analysis**: Comprehensive case law analysis
- **Case Comparison**: Compare two cases side-by-side
- **Structured Data Extraction**: Extract key information in JSON format

## Environment Variables

Required environment variables (set in Supabase dashboard or `.env`):

```bash
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=http://localhost:5173,https://docketchief.com
```

## Analysis Types

### 1. Summary

Generate a concise summary of the case.

**Request:**
```json
{
  "caseText": "Full case text...",
  "analysisType": "summary"
}
```

**Response:**
```json
{
  "analysis": "Concise summary including case name, citation, key facts, legal issues, holding, and rationale...",
  "analysisType": "summary",
  "usage": {
    "total_tokens": 650
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Precedents

Analyze cited precedents and their application.

**Request:**
```json
{
  "caseText": "Full case text...",
  "analysisType": "precedents"
}
```

**Response:**
```json
{
  "analysis": "Analysis of key precedents cited, how they were applied, any precedents distinguished or overruled...",
  "analysisType": "precedents",
  "usage": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Holdings

Extract and explain legal holdings.

**Request:**
```json
{
  "caseText": "Full case text...",
  "analysisType": "holdings"
}
```

**Response:**
```json
{
  "analysis": "Detailed extraction of holdings with reasoning and limitations...",
  "analysisType": "holdings",
  "structuredData": {
    "caseName": "Apple Inc. v. Samsung",
    "citation": "580 U.S. 53",
    "court": "Supreme Court",
    "year": "2020",
    "keyHoldings": [
      "First key holding...",
      "Second key holding..."
    ],
    "precedentsCited": [
      "Precedent 1",
      "Precedent 2"
    ]
  },
  "usage": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Full Analysis (Default)

Comprehensive analysis including all aspects.

**Request:**
```json
{
  "caseText": "Full case text...",
  "analysisType": "full",
  "jurisdiction": "California",
  "focusAreas": ["patent claims", "damages calculation"]
}
```

**Parameters:**
- `caseText` (required): Full text of the case (max 15,000 chars)
- `analysisType` (optional): Type of analysis (default: "full")
- `jurisdiction` (optional): Focus on specific jurisdiction
- `focusAreas` (optional): Array of specific areas to focus on

**Response:**
```json
{
  "analysis": "Comprehensive analysis covering:\n1. Case Information\n2. Facts\n3. Legal Issues\n4. Holdings\n5. Reasoning\n6. Significance...",
  "analysisType": "full",
  "structuredData": {
    "caseName": "...",
    "citation": "...",
    "keyHoldings": [...],
    "precedentsCited": [...]
  },
  "usage": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5. Compare

Compare two cases side-by-side.

**Request:**
```json
{
  "caseText": "First case full text...",
  "analysisType": "compare",
  "compareWith": "Second case full text..."
}
```

**Response:**
```json
{
  "analysis": "Detailed comparison covering:\n1. Similarities in facts\n2. Differences in facts\n3. Similar legal issues\n4. Different holdings\n5. Implications...",
  "analysisType": "compare",
  "usage": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Usage Example

```typescript
import { supabase } from '@/lib/supabase'

// Basic summary
const { data: summary } = await supabase.functions.invoke('case-law-analysis', {
  body: { 
    caseText: fullCaseText,
    analysisType: 'summary'
  }
})

// Full analysis with focus areas
const { data: fullAnalysis } = await supabase.functions.invoke('case-law-analysis', {
  body: { 
    caseText: fullCaseText,
    analysisType: 'full',
    jurisdiction: 'New York',
    focusAreas: ['contractual interpretation', 'damages']
  }
})

// Extract holdings
const { data: holdings } = await supabase.functions.invoke('case-law-analysis', {
  body: { 
    caseText: fullCaseText,
    analysisType: 'holdings'
  }
})

// Compare two cases
const { data: comparison } = await supabase.functions.invoke('case-law-analysis', {
  body: { 
    caseText: case1Text,
    analysisType: 'compare',
    compareWith: case2Text
  }
})
```

## Analysis Quality

The function uses GPT-4o-mini with optimized parameters:
- **Temperature**: 0.2 (lower for consistent legal analysis)
- **Max Tokens**: 2000 (comprehensive responses)
- **System Prompts**: Specialized for each analysis type

### Tips for Best Results

1. **Case Text Quality**: Provide clean, well-formatted text
2. **Length**: Optimal length is 2,000-10,000 words
3. **Focus Areas**: Specify focus areas for targeted analysis
4. **Jurisdiction**: Include jurisdiction for context-aware analysis
5. **Multiple Analyses**: Use different types for different perspectives

## Structured Data

For `full` and `holdings` analysis types, structured data is extracted including:

```typescript
interface StructuredData {
  caseName: string
  citation: string
  court: string
  year: string
  keyHoldings: string[]
  precedentsCited: string[]
}
```

This makes it easy to store and search cases in your database.

## Costs

Using GPT-4o-mini:
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens

Typical analysis costs:
- Summary: $0.002 - $0.005
- Full analysis: $0.01 - $0.03
- Comparison: $0.015 - $0.04

## Error Handling

Error responses:
```json
{
  "error": "Description of error",
  "details": "Additional information"
}
```

HTTP status codes:
- `400`: Invalid request (missing caseText or invalid analysisType)
- `500`: Server configuration error (missing OPENAI_API_KEY)
- `502`: OpenAI API error

## Best Practices

1. **Text Preprocessing**: Clean and format text before analysis
2. **Chunking**: For very long cases, analyze in sections
3. **Caching**: Cache analysis results to avoid redundant API calls
4. **Batch Processing**: Process multiple cases sequentially with delays
5. **Error Handling**: Implement retry logic for API failures
6. **Cost Monitoring**: Track token usage to manage costs

## Limitations

- Maximum case text length: 15,000 characters
- AI analysis is not a substitute for professional legal advice
- May miss nuanced legal interpretations
- Performance depends on text quality and formatting
- Rare cases or novel legal issues may have less accurate analysis

## Security

- Store API keys securely as environment variables
- Never expose OpenAI API key in frontend code
- Implement authentication before allowing analysis
- Consider rate limiting to prevent abuse
- Log all analysis requests for audit purposes

## Integration Example

```typescript
// Store analysis in database
const { data: analysis } = await supabase.functions.invoke('case-law-analysis', {
  body: { 
    caseText: caseText,
    analysisType: 'full'
  }
})

if (analysis) {
  await supabase.from('case_analyses').insert({
    case_id: caseId,
    analysis_text: analysis.analysis,
    structured_data: analysis.structuredData,
    analysis_type: analysis.analysisType,
    created_at: analysis.timestamp
  })
}
```
