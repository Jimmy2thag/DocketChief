/**
 * Google Scholar Service
 * Provides integration with Google Scholar for legal research
 * including federal courts and state laws
 */

export interface GoogleScholarSearchParams {
  query: string;
  jurisdiction?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  caseType?: string;
  includeFederalCourts?: boolean;
  includeStateLaws?: boolean;
}

export interface GoogleScholarResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  summary: string;
  url: string;
  docketNumber?: string;
  status?: string;
  citeCount: number;
  relevanceScore: number;
  parsedCitation?: string;
  source: 'google-scholar';
}

/**
 * Build Google Scholar search URL with filters for federal courts and state laws
 */
export function buildGoogleScholarUrl(params: GoogleScholarSearchParams): string {
  const baseUrl = 'https://scholar.google.com/scholar';
  const searchParams = new URLSearchParams();

  // Basic query
  searchParams.set('q', params.query);
  searchParams.set('hl', 'en');
  
  // Include legal opinions - as_sdt=6 includes federal and state case law
  // This parameter is critical for accessing legal documents
  searchParams.set('as_sdt', '6');
  
  // Date range filtering
  if (params.dateRange?.start || params.dateRange?.end) {
    if (params.dateRange.start) {
      const startYear = new Date(params.dateRange.start).getFullYear();
      searchParams.set('as_ylo', startYear.toString());
    }
    if (params.dateRange.end) {
      const endYear = new Date(params.dateRange.end).getFullYear();
      searchParams.set('as_yhi', endYear.toString());
    }
  }

  // Jurisdiction filtering (add to query string)
  if (params.jurisdiction && params.jurisdiction !== 'all') {
    const jurisdictionQuery = getJurisdictionQuery(params.jurisdiction);
    if (jurisdictionQuery) {
      const currentQuery = searchParams.get('q') || '';
      searchParams.set('q', `${currentQuery} ${jurisdictionQuery}`);
    }
  }

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Get jurisdiction-specific query modifier for Google Scholar
 */
function getJurisdictionQuery(jurisdiction: string): string {
  const jurisdictionMap: Record<string, string> = {
    'scotus': 'court:"Supreme Court"',
    'ca1': 'court:"First Circuit"',
    'ca2': 'court:"Second Circuit"',
    'ca3': 'court:"Third Circuit"',
    'ca4': 'court:"Fourth Circuit"',
    'ca5': 'court:"Fifth Circuit"',
    'ca6': 'court:"Sixth Circuit"',
    'ca7': 'court:"Seventh Circuit"',
    'ca8': 'court:"Eighth Circuit"',
    'ca9': 'court:"Ninth Circuit"',
    'ca10': 'court:"Tenth Circuit"',
    'ca11': 'court:"Eleventh Circuit"',
    'cadc': 'court:"D.C. Circuit"',
    // State courts
    'state-ca': 'court:"California"',
    'state-ny': 'court:"New York"',
    'state-tx': 'court:"Texas"',
    'state-fl': 'court:"Florida"',
    'state-il': 'court:"Illinois"',
  };

  return jurisdictionMap[jurisdiction] || '';
}

/**
 * Parse Google Scholar results (mock implementation)
 * In a production environment, this would need to:
 * 1. Use a proxy service to fetch Google Scholar results
 * 2. Parse the HTML response
 * 3. Extract case information
 * 
 * Note: Direct scraping of Google Scholar is against their ToS.
 * Consider using official APIs or services like Serpapi for production.
 */
export async function searchGoogleScholar(
  params: GoogleScholarSearchParams
): Promise<GoogleScholarResult[]> {
  // Generate the Google Scholar URL
  const scholarUrl = buildGoogleScholarUrl(params);
  
  // In production, this would make an API call to a proxy service
  // For now, we'll return enhanced mock data that demonstrates the integration
  
  const mockResults: GoogleScholarResult[] = [
    {
      id: 'gs-1',
      title: 'Miranda v. Arizona',
      citation: '384 U.S. 436 (1966)',
      parsedCitation: 'Miranda v. Arizona, 384 U.S. 436 (1966)',
      court: 'Supreme Court of the United States',
      date: '1966-06-13',
      summary: 'Landmark Supreme Court case establishing that suspects must be informed of their rights to remain silent and to have an attorney present during police interrogations. The Miranda rights are now a fundamental part of criminal procedure.',
      docketNumber: 'No. 759',
      status: 'Final',
      citeCount: 45782,
      relevanceScore: 95,
      url: scholarUrl,
      source: 'google-scholar'
    },
    {
      id: 'gs-2',
      title: 'Brown v. Board of Education',
      citation: '347 U.S. 483 (1954)',
      parsedCitation: 'Brown v. Board of Education, 347 U.S. 483 (1954)',
      court: 'Supreme Court of the United States',
      date: '1954-05-17',
      summary: 'Historic decision declaring state laws establishing separate public schools for black and white students unconstitutional. Overturned Plessy v. Ferguson and was a major victory for the civil rights movement.',
      docketNumber: 'No. 1',
      status: 'Final',
      citeCount: 67234,
      relevanceScore: 92,
      url: scholarUrl,
      source: 'google-scholar'
    },
    {
      id: 'gs-3',
      title: 'Marbury v. Madison',
      citation: '5 U.S. (1 Cranch) 137 (1803)',
      parsedCitation: 'Marbury v. Madison, 5 U.S. (1 Cranch) 137 (1803)',
      court: 'Supreme Court of the United States',
      date: '1803-02-24',
      summary: 'Established the principle of judicial review in the United States, giving federal courts the power to declare legislative and executive acts unconstitutional. Foundational case for American constitutional law.',
      docketNumber: 'No. 137',
      status: 'Final',
      citeCount: 78901,
      relevanceScore: 89,
      url: scholarUrl,
      source: 'google-scholar'
    },
    {
      id: 'gs-4',
      title: 'Roe v. Wade',
      citation: '410 U.S. 113 (1973)',
      parsedCitation: 'Roe v. Wade, 410 U.S. 113 (1973)',
      court: 'Supreme Court of the United States',
      date: '1973-01-22',
      summary: 'Landmark decision on the constitutional right to privacy and abortion. Held that the Constitution protects a woman\'s liberty to choose to have an abortion. Modified by later decisions and overruled in 2022.',
      docketNumber: 'No. 70-18',
      status: 'Overruled',
      citeCount: 54321,
      relevanceScore: 87,
      url: scholarUrl,
      source: 'google-scholar'
    },
    {
      id: 'gs-5',
      title: 'Gideon v. Wainwright',
      citation: '372 U.S. 335 (1963)',
      parsedCitation: 'Gideon v. Wainwright, 372 U.S. 335 (1963)',
      court: 'Supreme Court of the United States',
      date: '1963-03-18',
      summary: 'Established that state courts are required to provide attorneys to criminal defendants who cannot afford their own legal counsel. Extended the Sixth Amendment right to counsel to state prosecutions.',
      docketNumber: 'No. 155',
      status: 'Final',
      citeCount: 38765,
      relevanceScore: 85,
      url: scholarUrl,
      source: 'google-scholar'
    }
  ];

  // Filter results based on search query
  const filteredResults = mockResults.filter(result => {
    const searchTerm = params.query.toLowerCase();
    return (
      result.title.toLowerCase().includes(searchTerm) ||
      result.summary.toLowerCase().includes(searchTerm) ||
      result.citation.toLowerCase().includes(searchTerm) ||
      result.court.toLowerCase().includes(searchTerm)
    );
  });

  // If no matches, return all results to demonstrate the feature
  return filteredResults.length > 0 ? filteredResults : mockResults;
}

/**
 * Get the Google Scholar search URL for external viewing
 */
export function getGoogleScholarSearchUrl(query: string): string {
  return buildGoogleScholarUrl({
    query,
    includeFederalCourts: true,
    includeStateLaws: true
  });
}

/**
 * Get available jurisdictions including federal courts and states
 */
export function getAvailableJurisdictions(): Array<{ value: string; label: string; type: 'federal' | 'state' }> {
  return [
    // Federal Courts
    { value: 'scotus', label: 'Supreme Court', type: 'federal' },
    { value: 'ca1', label: '1st Circuit', type: 'federal' },
    { value: 'ca2', label: '2nd Circuit', type: 'federal' },
    { value: 'ca3', label: '3rd Circuit', type: 'federal' },
    { value: 'ca4', label: '4th Circuit', type: 'federal' },
    { value: 'ca5', label: '5th Circuit', type: 'federal' },
    { value: 'ca6', label: '6th Circuit', type: 'federal' },
    { value: 'ca7', label: '7th Circuit', type: 'federal' },
    { value: 'ca8', label: '8th Circuit', type: 'federal' },
    { value: 'ca9', label: '9th Circuit', type: 'federal' },
    { value: 'ca10', label: '10th Circuit', type: 'federal' },
    { value: 'ca11', label: '11th Circuit', type: 'federal' },
    { value: 'cadc', label: 'D.C. Circuit', type: 'federal' },
    
    // State Courts (major states)
    { value: 'state-ca', label: 'California', type: 'state' },
    { value: 'state-ny', label: 'New York', type: 'state' },
    { value: 'state-tx', label: 'Texas', type: 'state' },
    { value: 'state-fl', label: 'Florida', type: 'state' },
    { value: 'state-il', label: 'Illinois', type: 'state' },
  ];
}
