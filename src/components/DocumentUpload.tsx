import React, { useState, useCallback } from 'react';
import { Upload, FileText, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/lib/supabase';

interface AnalysisResult {
  extractedText: string;
  analysis: string;
  fileName: string;
}

export const DocumentUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'image/jpeg', 
      'image/png', 
      'image/jpg'
    ];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF, DOCX, or image file (JPG, PNG)');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);
    setUploadProgress(0);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be logged in to upload documents');
      }

      setUploadProgress(25);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      // Call upload function
      const { data: uploadData, error: uploadError } = await supabase.functions
        .invoke('upload-document', {
          body: formData
        });

      if (uploadError) throw uploadError;
      setUploadProgress(50);

      // Save to database
      const { error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: uploadData.document.storage_path,
        preview_available: uploadData.document.preview_available
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to save document: ${dbError.message}`);
      }

      setUploadProgress(100);
      setAnalysisResult({
        extractedText: `Document "${file.name}" uploaded successfully`,
        analysis: `File uploaded: ${file.name}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB\nType: ${file.type}\nPreview available: ${uploadData.document.preview_available ? 'Yes' : 'No'}`,
        fileName: file.name
      });

    } catch (err: unknown) {
      console.error('Upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      if (errorMessage.includes('413') || errorMessage.includes('too large')) {
        setError('File size exceeds the 50MB limit');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Document Scanner & Analyzer</h2>
        <p className="text-gray-600">Upload legal documents for AI-powered analysis and plain English explanations</p>
      </div>

      {/* Upload Area */}
      <Card className={`p-8 border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <div
          className="text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <div>
                <p className="text-lg font-medium">Processing Document...</p>
                <Progress value={uploadProgress} className="mt-2" />
                <p className="text-sm text-gray-500 mt-1">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Your Legal Document</h3>
              <p className="text-gray-600 mb-4">Drag and drop or click to select (up to 50MB)</p>
              <div className="flex justify-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  PDF Files
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  DOCX Files
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Image className="h-4 w-4" />
                  Image Files
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Select File
                </label>
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {analysisResult && (
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Document "{analysisResult.fileName}" processed successfully!
            </AlertDescription>
          </Alert>

          {analysisResult.extractedText && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extracted Text
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{analysisResult.extractedText}</pre>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">AI Analysis & Plain English Explanation</h3>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{analysisResult.analysis}</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
