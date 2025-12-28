# CourtListener API Integration

## Overview
DocketChief uses the CourtListener REST API v4.3 to access case law data.

## Authentication
- Token-based authentication
- Format: `Authorization: Token YOUR_TOKEN`
- Rate limit: 5,000 queries/hour

## Endpoints Used
- `/api/rest/v4/clusters/` - Main case law search
- `/api/rest/v4/opinions/` - Individual opinions
- `/api/rest/v4/search/` - Full-text search

## Usage Examples

### Basic Search
```typescript
const results = await searchCourtListener('miranda');
```

### Filtered Search
```typescript
const results = await searchCourtListener('miranda', {
  court: 'scotus',
  dateFiledAfter: '2020-01-01',
  limit: 50
});
```

## Performance Tips
1. Use field selection to limit payload size
2. Use specific court filters when possible
3. Implement result caching for repeated queries
4. Respect the 5,000 queries/hour rate limit

## Error Handling
- 401/403: Authentication failure
- 429: Rate limit exceeded
- 500: Server error (retry with exponential backoff)
