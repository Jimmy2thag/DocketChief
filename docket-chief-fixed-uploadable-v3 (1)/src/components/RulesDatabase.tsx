import React, { useState } from 'react';
import { Search, BookOpen, Scale, FileText, Gavel } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface LegalRule {
  id: string;
  title: string;
  content: string;
  jurisdiction: 'federal' | 'state';
  state_code?: string;
  category: string;
  rule_number?: string;
  citation?: string;
  tags?: string[];
  strategies?: string[];
  counter_arguments?: string[];
}

interface SearchResult {
  rules: LegalRule[];
  analysis: string;
  query: string;
  resultsCount: number;
}

const RulesDatabase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const states = [
    { code: 'all', name: 'All States' },
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'civil_procedure', label: 'Civil Procedure' },
    { value: 'evidence', label: 'Evidence' },
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'constitutional', label: 'Constitutional Law' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'torts', label: 'Torts' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search term.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-research', {
        body: {
          query: searchQuery,
          state: selectedState,
          category: selectedCategory
        }
      });

      if (error) throw error;

      if (data.success) {
        setSearchResults(data);
        toast({
          title: "Search Complete",
          description: `Found ${data.resultsCount} relevant rules and analysis.`
        });
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search legal database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Legal Research Database
          </CardTitle>
          <CardDescription>
            Search across state and federal laws, procedures, and doctrines with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search legal rules, procedures, or concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="rules">Legal Rules ({searchResults.resultsCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Comprehensive Legal Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of relevant state and federal law for: "{searchResults.query}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {searchResults.analysis}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            {searchResults.rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rule.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={rule.jurisdiction === 'federal' ? 'default' : 'secondary'}>
                          {rule.jurisdiction === 'federal' ? 'Federal' : `${rule.state_code} State`}
                        </Badge>
                        {rule.citation && <span className="text-sm">{rule.citation}</span>}
                      </CardDescription>
                    </div>
                    <Gavel className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Rule Content</h4>
                    <p className="text-sm leading-relaxed">{rule.content}</p>
                  </div>

                  {rule.strategies && rule.strategies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-700">Strategies</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.strategies.map((strategy, index) => (
                          <li key={index} className="text-sm">{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rule.counter_arguments && rule.counter_arguments.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-red-700">Counter-Arguments</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.counter_arguments.map((counter, index) => (
                          <li key={index} className="text-sm">{counter}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rule.tags && rule.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rule.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RulesDatabase;