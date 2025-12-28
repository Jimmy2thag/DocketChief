const BASE_URL = 'https://www.courtlistener.com/api/rest/v4';

export interface CourtListenerResult {
  id: number;
  absolute_url: string;
  caseName: string;
  date_filed: string;
  docket_number: string;
  court: string;
  citation: string[];
  snippet: string;
}

interface OpinionCluster {
  id: number;
  absolute_url: string;
  case_name: string;
  date_filed: string;
  docket: {
    docket_number?: string;
  };
  court: string;
  citations: any[];
  snippet?: string;
}

interface Opinion {
  id: number;
  absolute_url: string;
  cluster?: {
    case_name?: string;
    date_filed?: string;
    docket?: {
      docket_number?: string;
    };
    court?: string;
    citations?: any[];
  };
  plain_text?: string;
}

interface CourtListenerAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: OpinionCluster[];
}

interface OpinionAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Opinion[];
}

const SNIPPET_MAX_LENGTH = 200;

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'DocketChief/1.0 (+https://docketchief.com)',
  };
  
  const token = import.meta.env.VITE_COURTLISTENER_API_TOKEN;
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  
  return headers;
};

export async function searchCourtListener(
  query: string, 
  options?: { jurisdiction?: string; limit?: number }
): Promise<CourtListenerResult[]> {
  const params = new URLSearchParams({
    case_name: query,
    order_by: '-date_filed',
  });

  if (options?.limit) {
    params.set('page_size', String(options.limit));
  } else {
    params.set('page_size', '5');
  }

  if (options?.jurisdiction) {
    params.set('court', options.jurisdiction);
  }

  // Use the clusters endpoint for case opinions
  const url = `${BASE_URL}/clusters/?${params.toString()}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CourtListener API request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = (await response.json()) as CourtListenerAPIResponse;

  return (data.results || []).map((cluster) => ({
    id: cluster.id,
    absolute_url: cluster.absolute_url,
    caseName: cluster.case_name || 'Unnamed Case',
    date_filed: cluster.date_filed || '',
    docket_number: cluster.docket?.docket_number || '',
    court: cluster.court || '',
    citation: cluster.citations || [],
    snippet: cluster.snippet || '',
  }));
}

// Alternative search using the opinions endpoint
export async function searchOpinions(
  query: string,
  options?: { court?: string; limit?: number }
): Promise<CourtListenerResult[]> {
  const params = new URLSearchParams();
  
  if (query) {
    params.set('q', query);
  }
  
  if (options?.limit) {
    params.set('page_size', String(options.limit));
  }
  
  if (options?.court) {
    params.set('court', options.court);
  }

  const url = `${BASE_URL}/opinions/?${params.toString()}`;

  const response = await fetch(url, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CourtListener API request failed with status ${response.status}: ${errorText}`
    );
  }

  const data = (await response.json()) as OpinionAPIResponse;
  
  return (data.results || []).map((opinion) => ({
    id: opinion.id,
    absolute_url: opinion.absolute_url || '',
    caseName: opinion.cluster?.case_name || 'Unnamed Case',
    date_filed: opinion.cluster?.date_filed || '',
    docket_number: opinion.cluster?.docket?.docket_number || '',
    court: opinion.cluster?.court || '',
    citation: opinion.cluster?.citations || [],
    snippet: opinion.plain_text?.substring(0, SNIPPET_MAX_LENGTH) || '',
  }));
}
