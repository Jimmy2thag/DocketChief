const BASE_URL = 'https://www.courtlistener.com/api/rest/v4';

export interface CourtListenerResult {
  id: number;
  absolute_url: string;
  case_name: string;
  caseName: string;  // Alias for backward compatibility
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
  count: string | number;  // Total count (may be a string in some API responses)
  next: string | null;
  previous: string | null;
  results: OpinionCluster[];
}

/**
 * Search endpoint result (API may return either camelCase or snake_case fields)
 */
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
    return (data.results || []).map((cluster) => {
      const caseName = cluster.case_name || cluster.case_name_short || 'Unnamed Case';
      return {
        id: cluster.id,
        absolute_url: cluster.absolute_url,
        case_name: caseName,
        caseName: caseName,  // Backward compatibility alias
        date_filed: cluster.date_filed || '',
        docket_number: cluster.docket?.docket_number || '',
        court: cluster.docket?.court || '',
        court_id: cluster.docket?.court || '',
        citation: cluster.citations || [],
        snippet: cluster.snippet || '',
        cite_count: cluster.cite_count,
        precedential_status: cluster.precedential_status,
      };
    });
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
        `CourtListener search failed (${response.status}): ${errorText}`
      );
    }

    const data = (await response.json()) as SearchAPIResponse;

    return (data.results || []).map((result) => {
      const caseName = result.caseName || result.case_name || 'Unnamed Case';
      return {
        id: result.id,
        absolute_url: result.absolute_url || '',
        case_name: caseName,
        caseName: caseName,  // Backward compatibility alias
        date_filed: result.dateFiled || result.date_filed || '',
        docket_number: result.docketNumber || result.docket_number || '',
        court: result.court || '',
        court_id: result.court_id || result.court || '',
        citation: result.citation || [],
        snippet: result.snippet || '',
        cite_count: result.citeCount || result.cite_count,
        precedential_status: result.status || result.precedential_status,
      };
    });
  } catch (error) {
    console.error('CourtListener Search Error:', error);
    throw error;
  }
}

interface Court {
  id: string;
  name: string;
  short_name?: string;
  jurisdiction?: string;
  position?: number;
  citation_string?: string;
  start_date?: string;
  end_date?: string;
  url?: string;
  has_opinion_scraper?: boolean;
  has_oral_argument_scraper?: boolean;
}

/**
 * Get detailed information about a specific court
 * @param courtId - Court identifier (e.g., 'scotus', 'ca9', 'cal')
 * @returns Court details
 */
export async function getCourt(courtId: string): Promise<Court> {
  // Validate courtId input
  if (!courtId || typeof courtId !== 'string' || courtId.trim().length === 0) {
    throw new Error('Court ID is required and must be a non-empty string');
  }

  // Sanitize courtId to prevent URL injection (allow alphanumeric, hyphens, and underscores)
  const sanitizedCourtId = courtId.trim().replace(/[^a-z0-9-_]/gi, '');
  if (sanitizedCourtId.length === 0) {
    throw new Error('Invalid court ID format');
  }

  try {
    const url = `${BASE_URL}/courts/${sanitizedCourtId}/`;
    
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
      
      // Handle not found (404)
      if (response.status === 404) {
        throw new Error(`Court '${sanitizedCourtId}' not found`);
      }
      
      throw new Error(
        `Failed to fetch court ${sanitizedCourtId} (${response.status}): ${errorText}`
      );
    }

    return (await response.json()) as Court;
  } catch (error) {
    console.error('CourtListener Court Fetch Error:', error);
    throw error;
  }
}
