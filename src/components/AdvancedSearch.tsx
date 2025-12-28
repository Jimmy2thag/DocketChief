import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, FileText, MessageSquare, Users, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  type: 'document' | 'conversation' | 'case' | 'collaboration';
  title: string;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export const AdvancedSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search documents
      if (searchType === 'all' || searchType === 'document') {
        const { data: docs } = await supabase
          .from('uploaded_documents')
          .select('*')
          .eq('user_id', user.id)
          .ilike('file_name', `%${searchQuery}%`);
        
        if (docs) {
          searchResults.push(...docs.map(doc => ({
            id: doc.id,
            type: 'document' as const,
            title: doc.file_name,
            content: doc.analysis_result || 'No analysis available',
            created_at: doc.created_at,
            metadata: { size: doc.file_size, type: doc.file_type }
          })));
        }
      }

      // Search conversations
      if (searchType === 'all' || searchType === 'conversation') {
        const { data: convs } = await supabase
          .from('imported_conversations')
          .select('*')
          .eq('user_id', user.id)
          .ilike('title', `%${searchQuery}%`);
        
        if (convs) {
          searchResults.push(...convs.map(conv => ({
            id: conv.id,
            type: 'conversation' as const,
            title: conv.title,
            content: JSON.stringify(conv.messages).substring(0, 200) + '...',
            created_at: conv.created_at,
            metadata: { platform: conv.platform, messageCount: conv.messages?.length || 0 }
          })));
        }
      }

      // Search collaborations
      if (searchType === 'all' || searchType === 'collaboration') {
        const { data: collabs } = await supabase
          .from('collaborations')
          .select('*')
          .ilike('name', `%${searchQuery}%`);
        
        if (collabs) {
          searchResults.push(...collabs.map(collab => ({
            id: collab.id,
            type: 'collaboration' as const,
            title: collab.name,
            content: collab.description || 'No description',
            created_at: collab.created_at,
            metadata: { owner: collab.owner_id }
          })));
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'conversation': return <MessageSquare className="h-4 w-4" />;
      case 'collaboration': return <Users className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Advanced Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search across all your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="conversation">Conversations</SelectItem>
                  <SelectItem value="collaboration">Collaborations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({results.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(result.type)}
                        <h3 className="font-medium">{result.title}</h3>
                        <Badge variant="outline">{result.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{result.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(result.created_at).toLocaleDateString()}</span>
                        {result.metadata && (
                          <span>
                            {result.type === 'document' && `${result.metadata.type} • ${result.metadata.size} bytes`}
                            {result.type === 'conversation' && `${result.metadata.platform} • ${result.metadata.messageCount} messages`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
