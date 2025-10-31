import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
  case_id: string;
  case_title: string;
  uploaded_by_name: string;
}

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const fetchRecentDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          cases(title),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      const formattedDocs = data?.map(doc => ({
        ...doc,
        case_title: doc.cases?.title || 'Unknown Case',
        uploaded_by_name: doc.profiles?.full_name || 'Unknown User'
      })) || [];
      
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching recent documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    return FileText; // Could expand this to show different icons for different file types
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-800';
      case 'xls':
      case 'xlsx':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent documents</p>
              <p className="text-sm">Documents will appear here once uploaded</p>
            </div>
          ) : (
            documents.map((doc) => {
              const FileIcon = getFileIcon(doc.file_type);
              
              return (
                <div key={doc.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => console.log('View document', doc.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log('Download document', doc.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className={`text-xs ${getFileTypeColor(doc.file_type)}`}>
                        {doc.file_type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(doc.file_size)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{doc.case_title}</span>
                      <span>
                        {format(new Date(doc.created_at), 'MMM d, yyyy')} by {doc.uploaded_by_name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}