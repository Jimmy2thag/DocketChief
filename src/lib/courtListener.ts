const BASE_URL = 'https://www.courtlistener.com/api/rest/v4/search/';

export interface CourtListenerResult {
  id: string;
  absolute_url: string;
  caseName: string;
  date_filed: string;
  docket_number: string;
  court: string;
  citation: string[];
  snippet: string;
}

interface CourtListenerResponse {
  results: Array<{
    id: string;
    absolute_url: string;
    caseNameShort?: string;
    caseName?: string;
    dateFiled?: string;
    docketNumber?: string;
    court?: string;
    citation?: string[];
    snippet?: string;
  }>;
}

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent': 'DocketChief/1.0 (+https://docketchief.example)',
};

export async function searchCourtListener(query: string, options?: { jurisdiction?: string; limit?: number }) {
  const params = new URLSearchParams({
    q: query,
    type: 'o',
    page_size: String(options?.limit ?? 5),
    order_by: 'score desc',
  });

  if (options?.jurisdiction) {
    params.set('court', options.jurisdiction);
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`CourtListener request failed with status ${response.status}`);
  }

  const data = (await response.json()) as CourtListenerResponse;

  return (data.results || []).map((result) => ({
    id: result.id,
    absolute_url: result.absolute_url,
    caseName: result.caseName || result.caseNameShort || 'Unnamed Case',
    date_filed: result.dateFiled || '',
    docket_number: result.docketNumber || '',
    court: result.court || '',
    citation: result.citation || [],
    snippet: result.snippet || '',
  })) as CourtListenerResult[];
}
