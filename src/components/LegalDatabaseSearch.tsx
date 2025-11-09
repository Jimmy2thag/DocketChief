import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, Scale, FileText, ExternalLink, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import CitationFormatter from './CitationFormatter';
interface SearchResult {
  id: string;
  title: string;
  court: string;
  date: string;
  citation: string;
  snippet: string;
  url: string;
  precedential_status: string;
  docket_number: string;
}

interface SearchFilters {
  query: string;
  jurisdiction: string;
  court: string;
  dateFrom: string;
  dateTo: string;
  caseType: string;
}

export default function LegalDatabaseSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    jurisdiction: '',
    court: '',
    dateFrom: '',
    dateTo: '',
    caseType: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const searchDatabase = async () => {
    if (!filters.query.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call the CourtListener search edge function
      const { data, error } = await supabase.functions.invoke('courtlistener-search', {
        body: { 
          searchParams: {
            query: filters.query,
            type: 'o', // opinions
            court: filters.court,
            filed_after: filters.dateFrom,
            filed_before: filters.dateTo,
            order_by: 'score desc'
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        // Transform results to match component interface
        const transformedResults: SearchResult[] = (data.results || []).map((result: any) => ({
          id: result.id,
          title: result.title,
          court: result.court,
          date: result.date_filed,
          citation: result.citation.length > 0 ? result.citation[0] : 'No citation',
          snippet: result.snippet,
          url: result.absolute_url ? `https://www.courtlistener.com${result.absolute_url}` : '',
          precedential_status: result.status,
          docket_number: result.docket_number,
        }));

        setResults(transformedResults);
        setTotalResults(data.count || transformedResults.length);
        
        toast({
          title: "Search Complete",
          description: `Found ${data.count || transformedResults.length} legal precedents`
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      setResults([]);
      setTotalResults(0);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search legal database. Please ensure CourtListener API is configured.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyResult = (result: SearchResult) => {
    const text = `${result.title}\n${result.citation}\n${result.court}\n${result.date}\n\n${result.snippet}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Case details copied to clipboard"
    });
  };

  const downloadResult = (result: SearchResult) => {
    const content = `${result.title}\n${result.citation}\n${result.court}\nDate: ${result.date}\nDocket: ${result.docket_number}\n\n${result.snippet}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Legal Database Search</h1>
        <p className="text-xl text-gray-600">Search comprehensive legal databases with advanced filters</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search case law, statutes, regulations..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="text-lg h-12"
              />
            </div>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="lg"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={searchDatabase}
              disabled={loading}
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jurisdiction</label>
              <Select value={filters.jurisdiction} onValueChange={(value) => setFilters(prev => ({ ...prev, jurisdiction: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="ca">California</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="tx">Texas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Court Level</label>
              <Select value={filters.court} onValueChange={(value) => setFilters(prev => ({ ...prev, court: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supreme">Supreme Court</SelectItem>
                  <SelectItem value="appellate">Appellate Court</SelectItem>
                  <SelectItem value="district">District Court</SelectItem>
                  <SelectItem value="bankruptcy">Bankruptcy Court</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Case Type</label>
              <Select value={filters.caseType} onValueChange={(value) => setFilters(prev => ({ ...prev, caseType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="constitutional">Constitutional</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="tort">Tort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date From</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date To</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Search Results</h2>
            <Badge variant="secondary">{totalResults} results found</Badge>
          </div>

          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-600 mb-2">{result.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Scale className="w-4 h-4" />
                          {result.court}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {result.citation}
                        </span>
                      </div>
                      <Badge variant="outline" className="mb-3">
                        {result.precedential_status}
                      </Badge>
                      <p className="text-gray-700 leading-relaxed">{result.snippet}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyResult(result)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(result)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="text-sm text-gray-500">
                      Docket Number: {result.docket_number}
                    </div>
                    <CitationFormatter 
                      caseData={{
                        title: result.title,
                        citation: result.citation,
                        court: result.court,
                        date: result.date,
                        url: result.url
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching legal databases...</p>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center py-12">
          <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Results Yet</h3>
          <p className="text-gray-500">Enter a search query to find legal precedents and case law</p>
        </div>
      )}
    </div>
  );
}