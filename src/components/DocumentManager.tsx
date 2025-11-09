import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FileText, Download, Trash2, Eye, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  preview_available: boolean;
}

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const fallbackDocuments = useMemo<Document[]>(
    () => [
      {
        id: 'sample-nda',
        filename: 'Mutual_NDA.pdf',
        file_type: 'application/pdf',
        file_size: 524288,
        upload_date: new Date().toISOString(),
        preview_available: true,
      },
      {
        id: 'sample-msa',
        filename: 'Master_Service_Agreement.docx',
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_size: 734003,
        upload_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        preview_available: false,
      },
    ],
    []
  );

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
      setError('');
      setUsingFallback(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Unable to reach the document store. Showing cached examples instead.');
      setDocuments(fallbackDocuments);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [fallbackDocuments]);

  const filterDocuments = useCallback(() => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.file_type.includes(typeFilter));
    }

    setFilteredDocs(filtered);
  }, [documents, searchTerm, typeFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    filterDocuments();
  }, [filterDocuments]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDocuments(docs => docs.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📁';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Manager</h1>
        <p className="text-gray-600">Manage your uploaded legal documents</p>
      </div>

      {loading && <div className="p-4 rounded border text-sm text-gray-600 bg-gray-50">Loading documents...</div>}
      {!loading && error && (
        <div className="p-4 rounded border border-amber-300 bg-amber-50 text-sm text-amber-800">{error}</div>
      )}
      {usingFallback && (
        <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-700">
          Displaying read-only sample documents while the Supabase connection is unavailable.
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF Files</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="word">Word Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getFileTypeIcon(doc.file_type)}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate" title={doc.filename}>
                    {doc.filename}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.file_size)}
                  </p>
                </div>
              </div>
              <Badge variant={doc.preview_available ? "default" : "secondary"} className="text-xs">
                {doc.preview_available ? "Preview" : "No Preview"}
              </Badge>
            </div>

            <div className="text-xs text-gray-500 mb-3">
              Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleDelete(doc.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started'
            }
          </p>
          {!loading && (
            <Button className="mt-4" variant="outline" onClick={fetchDocuments}>
              Refresh
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;