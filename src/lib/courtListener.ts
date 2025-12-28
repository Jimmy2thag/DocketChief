const BASE_URL = 'https://www.courtlistener.com/api/rest/v4';

export interface CourtListenerResult {
  id: number;
  absolute_url: string;
  case_name: string;
  date_filed: string;
  docket_number: string;
  court: string;
  court_id: string;
  citation: Citation[];
  snippet: string;
  cite_count?: number;
  precedential_status?: string;
}

interface Citation {
  volume?: string;
  reporter?: string;
  page?: string;
  type?: string;
}

interface SubOpinion {
  id: number;
  type?: string;
  download_url?: string;
  local_path?: string;
}

interface OpinionCluster {
  id: number;
  absolute_url: string;
  case_name: string;
  case_name_short?: string;
  date_filed: string;
  docket: {
    id: number;
    docket_number: string;
    court: string;
  };
  scdb_id?: string;
  citations?: Citation[];
  sub_opinions?: SubOpinion[];
  precedential_status?: string;
  cite_count?: number;
  snippet?: string;
}

interface CourtListenerAPIResponse {
  count: string | number;  // Can be a URL to get count
  next: string | null;
  previous: string | null;
  results: OpinionCluster[];
}

interface SearchResult {
  id: number;
  absolute_url: string;
  caseName?: string;
  case_name?: string;
  dateFiled?: string;
  date_filed?: string;
  docketNumber?: string;
  docket_number?: string;
  court?: string;
  court_id?: string;
  citation?: Citation[];
  snippet?: string;
  citeCount?: number;
  cite_count?: number;
  status?: string;
  precedential_status?: string;
}

interface SearchAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchResult[];
}

/**
 * Get authentication headers for CourtListener API
 * Format: Authorization: Token <token>
 */
const getHeaders = (): Record<string, string> => {
  const apiToken = import.meta.env.VITE_COURTLISTENER_API_TOKEN;
  
  if (!apiToken) {
    throw new Error('CourtListener API token is not configured. Please set VITE_COURTLISTENER_API_TOKEN in your environment.');
  }

  return {
    'Accept': 'application/json',
    'Authorization': `Token ${apiToken}`,
    'User-Agent': 'DocketChief/1.0 (+https://docketchief.com)',
  };
};

/**
 * Search CourtListener using the clusters endpoint
 * This is the main endpoint for case law searches
 * 
 * @param query - Search query (case name)
 * @param options - Optional filters
 * @returns Array of court listener results
 */
export async function searchCourtListener(
  query: string,
  options?: {
    jurisdiction?: string;
    court?: string;
    limit?: number;
    dateFiledAfter?: string;
    dateFiledBefore?: string;
    orderBy?: string;
  }
): Promise<CourtListenerResult[]> {
  try {
    const params = new URLSearchParams();

    // Use case_name__icontains for flexible searching
    if (query) {
      params.set('case_name__icontains', query);
    }

    // Set page size (max is typically 100)
    params.set('page_size', String(options?.limit ?? 20));

    // Default ordering by date filed (descending)
    params.set('order_by', options?.orderBy ?? '-date_filed');

    // Court filter (use court ID like 'scotus', 'ca9', etc.)
    if (options?.court) {
      params.set('court', options.court);
    }

    // Jurisdiction filter (F, FD, FB, etc.)
    if (options?.jurisdiction) {
      params.set('court__jurisdiction', options.jurisdiction);
    }

    // Date range filters (ISO-8601 format: YYYY-MM-DD)
    if (options?.dateFiledAfter) {
      params.set('date_filed__gte', options.dateFiledAfter);
    }
    if (options?.dateFiledBefore) {
      params.set('date_filed__lte', options.dateFiledBefore);
    }

    // Optimize with field selection
    params.set('fields', 'id,absolute_url,case_name,case_name_short,date_filed,docket,citations,precedential_status,cite_count');

    const url = `${BASE_URL}/clusters/?${params.toString()}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle rate limiting (429)
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. CourtListener allows 5,000 queries per hour.');
      }
      
      // Handle authentication errors (401, 403)
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed. Please check your API token.');
      }
      
      throw new Error(
        `CourtListener API error (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as CourtListenerAPIResponse;

    // Transform API response to our interface
    return (data.results || []).map((cluster) => ({
      id: cluster.id,
      absolute_url: cluster.absolute_url,
      case_name: cluster.case_name || cluster.case_name_short || 'Unnamed Case',
      date_filed: cluster.date_filed || '',
      docket_number: cluster.docket?.docket_number || '',
      court: cluster.docket?.court || '',
      court_id: cluster.docket?.court || '',
      citation: cluster.citations || [],
      snippet: cluster.snippet || '',
      cite_count: cluster.cite_count,
      precedential_status: cluster.precedential_status,
    }));
  } catch (error) {
    console.error('CourtListener API Error:', error);
    throw error;
  }
}

/**
 * Search using the search endpoint (alternative method)
 * Useful for full-text search across opinions
 */
export async function searchOpinions(
  query: string,
  options?: {
    court?: string;
    type?: 'o' | 'r' | 'rd' | 'd' | 'p' | 'oa';
    limit?: number;
  }
): Promise<CourtListenerResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: options?.type ?? 'o', // 'o' = opinions
      order_by: 'score desc',
      page_size: String(options?.limit ?? 20),
    });

    if (options?.court) {
      params.set('court', options.court);
    }

    const url = `${BASE_URL}/search/?${params.toString()}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`CourtListener search failed: ${response.status}`);
    }

    const data = (await response.json()) as SearchAPIResponse;

    return (data.results || []).map((result) => ({
      id: result.id,
      absolute_url: result.absolute_url || '',
      case_name: result.caseName || result.case_name || 'Unnamed Case',
      date_filed: result.dateFiled || result.date_filed || '',
      docket_number: result.docketNumber || result.docket_number || '',
      court: result.court || '',
      court_id: result.court_id || result.court || '',
      citation: result.citation || [],
      snippet: result.snippet || '',
      cite_count: result.citeCount || result.cite_count,
      precedential_status: result.status || result.precedential_status,
    }));
  } catch (error) {
    console.error('CourtListener Search Error:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific court
 */
export async function getCourt(courtId: string) {
  const url = `${BASE_URL}/courts/${courtId}/`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch court ${courtId}`);
  }

  return response.json();
}
