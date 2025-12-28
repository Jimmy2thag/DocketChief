import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Eye, Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';

interface DocumentAnalysis {
  id: string;
  file_name: string;
  file_url: string;
  original_text: string;
  analysis_result: {
    documentType?: string;
    summary?: string;
    keyPoints?: string[];
    plainEnglish?: string;
  } | null;
  created_at: string;
}

export function UserDashboard() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<DocumentAnalysis | null>(null);

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('document_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAnalyses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading your documents...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Dashboard</h1>
        <p className="text-gray-600">Manage your uploaded documents and analyses</p>
      </div>

      {analyses.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            You haven't uploaded any documents yet. Use the Document Scanner to get started!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Document History ({analyses.length})</h2>
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {analysis.file_name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(analysis.created_at)}
                        </p>
                        {analysis.analysis_result?.documentType && (
                          <Badge variant="secondary" className="mb-2">
                            {analysis.analysis_result.documentType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAnalysis(analysis.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Analysis Details */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Analysis Details</h2>
            {selectedAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedAnalysis.file_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedAnalysis.analysis_result?.summary && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                        <p className="text-gray-700 text-sm">
                          {selectedAnalysis.analysis_result.summary}
                        </p>
                      </div>
                    )}
                    
                    {selectedAnalysis.analysis_result?.keyPoints && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {selectedAnalysis.analysis_result.keyPoints.map((point: string, idx: number) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedAnalysis.analysis_result?.plainEnglish && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Plain English Explanation</h4>
                        <p className="text-gray-700 text-sm">
                          {selectedAnalysis.analysis_result.plainEnglish}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  Select a document to view its analysis
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
