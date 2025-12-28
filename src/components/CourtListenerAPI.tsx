import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, ExternalLink, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query: string;
  type: 'o' | 'r' | 'rd' | 'd' | 'p' | 'oa';
  court: string;
  filed_after: string;
  filed_before: string;
  order_by: string;
}

interface SearchResult {
  id: number;
  title: string;
  court: string;
  court_id: string;
  date_filed: string;
  citation: string[];
  docket_number: string;
  snippet: string;
  absolute_url: string;
  status: string;
  cite_count: number;
  opinions: any[];
  type: string;
}

export default function CourtListenerAPI() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'o',
    court: '',
    filed_after: '',
    filed_before: '',
    order_by: 'score desc'
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  const searchTypes = [
    { value: 'o', label: 'Case Law Opinions' },
    { value: 'r', label: 'PACER Cases (with docs)' },
    { value: 'rd', label: 'PACER Documents' },
    { value: 'd', label: 'PACER Dockets' },
    { value: 'p', label: 'Judges' },
    { value: 'oa', label: 'Oral Arguments' }
  ];

  const orderOptions = [
    { value: 'score desc', label: 'Relevance' },
    { value: 'dateFiled desc', label: 'Date Filed (Newest)' },
    { value: 'dateFiled asc', label: 'Date Filed (Oldest)' },
    { value: 'citeCount desc', label: 'Most Cited' },
    { value: 'caseName asc', label: 'Case Name A-Z' }
  ];

  const performSearch = async (page = 1) => {
    if (!filters.query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // This would normally call the Supabase edge function
      // const { data, error } = await supabase.functions.invoke('courtlistener-search', {
      //   body: { 
      //     searchParams: {
      //       ...filters,
      //       page,
      //       page_size: 20
      //     }
      //   }
      // });

      // For demonstration, we'll simulate the API response structure
      // In production, this would be replaced with the actual API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

      // Mock response that matches CourtListener API v4 structure
      const mockResponse = {
        count: 1247,
        next: page < 5 ? `page=${page + 1}` : null,
        previous: page > 1 ? `page=${page - 1}` : null,
        results: [
          {
            id: `case_${page}_1`,
            title: `${filters.query} v. State of California`,
            court: "California Supreme Court",
            court_id: "cal",
            date_filed: "2023-11-15",
            citation: ["2023 Cal. LEXIS 1234", "123 Cal.4th 567"],
            docket_number: "S123456",
            snippet: `This case involves ${filters.query} and addresses important constitutional questions regarding due process and equal protection under the law...`,
            absolute_url: `/opinion/123456/${filters.query.toLowerCase()}-v-state/`,
            status: "Published",
            cite_count: 42,
            opinions: [{ type: "majority", author: "Justice Smith" }],
            type: filters.type
          },
          {
            id: `case_${page}_2`,
            title: `United States v. ${filters.query}`,
            court: "U.S. Court of Appeals for the Ninth Circuit",
            court_id: "ca9",
            date_filed: "2023-10-22",
            citation: ["2023 U.S. App. LEXIS 5678"],
            docket_number: "23-1234",
            snippet: `Federal appellate case examining ${filters.query} in the context of criminal procedure and Fourth Amendment protections...`,
            absolute_url: `/opinion/789012/united-states-v-${filters.query.toLowerCase()}/`,
            status: "Published",
            cite_count: 18,
            opinions: [{ type: "majority", author: "Judge Johnson" }],
            type: filters.type
          }
        ]
      };

      setResults(mockResponse.results);
      setTotalCount(mockResponse.count);
      setCurrentPage(page);
      setHasNextPage(!!mockResponse.next);

      toast({
        title: "Search Complete",
        description: `Found ${mockResponse.count} results for "${filters.query}"`
      });

    } catch (err: any) {
      setError(err.message || 'Search failed');
      toast({
        title: "Search Error",
        description: err.message || 'Failed to search legal database',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard"
    });
  };

  const downloadCase = (result: SearchResult) => {
    const content = `${result.title}\n${result.citation.join(', ')}\n${result.court}\nFiled: ${result.date_filed}\n\n${result.snippet}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            CourtListener Legal Database Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Query</label>
              <Input
                placeholder="Enter case name, citation, or keywords..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search Type</label>
              <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {searchTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Court</label>
              <Input
                placeholder="e.g., scotus, ca9, cal"
                value={filters.court}
                onChange={(e) => setFilters(prev => ({ ...prev, court: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filed After</label>
              <Input
                type="date"
                value={filters.filed_after}
                onChange={(e) => setFilters(prev => ({ ...prev, filed_after: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filed Before</label>
              <Input
                type="date"
                value={filters.filed_before}
                onChange={(e) => setFilters(prev => ({ ...prev, filed_before: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={filters.order_by} onValueChange={(value) => setFilters(prev => ({ ...prev, order_by: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => performSearch(1)} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Legal Database
              </>
            )}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({totalCount.toLocaleString()} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{result.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${result.title}\n${result.citation.join(', ')}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadCase(result)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.courtlistener.com${result.absolute_url}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="secondary">{result.court}</Badge>
                    <Badge variant="outline">{result.status}</Badge>
                    <Badge variant="outline">Cited {result.cite_count} times</Badge>
                    {result.date_filed && (
                      <Badge variant="outline">Filed: {result.date_filed}</Badge>
                    )}
                  </div>

                  {result.citation.length > 0 && (
                    <p className="text-sm text-blue-600 mb-2">
                      {result.citation.join(' • ')}
                    </p>
                  )}

                  {result.docket_number && (
                    <p className="text-sm text-gray-600 mb-2">
                      Docket: {result.docket_number}
                    </p>
                  )}

                  <p className="text-sm text-gray-700">{result.snippet}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => performSearch(currentPage - 1)}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage}
              </span>
              
              <Button
                variant="outline"
                disabled={!hasNextPage || loading}
                onClick={() => performSearch(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">Production Integration Notes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• CourtListener API token configured in environment variables</li>
            <li>• Edge function ready for deployment with proper CORS and error handling</li>
            <li>• Rate limiting and pagination implemented for production use</li>
            <li>• Real-time search with advanced filtering capabilities</li>
            <li>• Currently showing mock data - replace with actual API calls when deployed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}