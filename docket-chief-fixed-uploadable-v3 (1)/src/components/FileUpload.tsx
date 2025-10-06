import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  extractedText?: string;
  analysis?: string;
  aiProvider?: string;
  uploadedAt: Date;
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void;
  multiple?: boolean;
}

export function FileUpload({ onFileUploaded, multiple = true }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');

  const maxSize = 10 * 1024 * 1024; // 10MB
  const acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];

  const validateFile = (file: File): string | null => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type ${fileExtension} not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const fileId = `${Date.now()}-${file.name}`;
      const filePath = `legal-documents/${fileId}`;

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      setProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('legal-documents')
        .getPublicUrl(filePath);

      setProgress(75);

      // Analyze document with selected AI provider
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('document-analysis', {
          body: { 
            fileUrl: publicUrl,
            fileName: file.name,
            fileType: file.type,
            aiProvider: aiProvider
          }
        });

      if (analysisError) {
        console.warn('Analysis failed:', analysisError);
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        extractedText: analysisData?.extractedText || '',
        analysis: analysisData?.analysis || '',
        aiProvider: analysisData?.aiProvider || aiProvider,
        uploadedAt: new Date()
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      onFileUploaded?.(uploadedFile);
      setProgress(100);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      uploadFile(file);
    });
  }, [aiProvider]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      uploadFile(file);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <Label htmlFor="ai-provider">AI Analysis Provider:</Label>
        <Select value={aiProvider} onValueChange={(value: 'openai' | 'gemini') => setAiProvider(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                ChatGPT
              </div>
            </SelectItem>
            <SelectItem value="gemini">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Gemini
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            Drop legal documents here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports: {acceptedTypes.join(', ')} • Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={uploading}
        >
          Select Files
        </Button>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading and analyzing with {aiProvider === 'openai' ? 'ChatGPT' : 'Gemini'}...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Recently Uploaded</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {file.aiProvider && (
                      <>
                        <span>•</span>
                        <span>Analyzed by {file.aiProvider === 'openai' ? 'ChatGPT' : 'Gemini'}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.analysis && (
                  <CheckCircle className="h-5 w-5 text-green-500" title="AI Analysis Complete" />
                )}
                <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}