import React, { useState } from 'react';
import { Upload, FileText, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

interface ConversationImportProps {
  onImportComplete?: (conversation: { id: string; title: string; platform: string }) => void;
}

export function ConversationImport({ onImportComplete }: ConversationImportProps) {
  const [platform, setPlatform] = useState<'chatgpt' | 'gemini'>('chatgpt');
  const [title, setTitle] = useState('');
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [textData, setTextData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ title: string; messageCount: number; tags: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      const text = await file.text();
      const data = JSON.parse(text);
      await processImport(data);
    } catch (err) {
      setError('Failed to parse file. Please ensure it\'s a valid JSON export.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextImport = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const data = JSON.parse(textData);
      await processImport(data);
    } catch (err) {
      setError('Failed to parse JSON data. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processImport = async (conversationData: Record<string, unknown>) => {
    try {
      // Process the conversation data
      const { data: processedResult, error: processError } = await supabase.functions.invoke('conversation-import', {
        body: { conversationData, platform, title }
      });

      if (processError) throw processError;

      // Save to database
      const { data: savedConversation, error: saveError } = await supabase
        .from('imported_conversations')
        .insert({
          title: processedResult.data.title,
          platform,
          conversation_data: processedResult.data.processedData,
          tags: processedResult.data.tags
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setResult(processedResult.data);
      onImportComplete?.(savedConversation);
      
      // Reset form
      setTitle('');
      setTextData('');
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to import conversation');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Import AI Conversations
          </CardTitle>
          <CardDescription>
            Import your existing conversations from ChatGPT or Gemini to continue research and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="platform">AI Platform</Label>
              <Select value={platform} onValueChange={(value: 'chatgpt' | 'gemini') => setPlatform(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatgpt">ChatGPT</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Import Method</Label>
              <Select value={importMethod} onValueChange={(value: 'file' | 'paste') => setImportMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">Upload File</SelectItem>
                  <SelectItem value="paste">Paste JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Conversation Title (Optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a custom title for this conversation"
            />
          </div>

          {importMethod === 'file' ? (
            <div>
              <Label htmlFor="file">Upload Export File</Label>
              <Input
                id="file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload your {platform === 'chatgpt' ? 'ChatGPT' : 'Gemini'} conversation export (JSON format)
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="data">Paste Conversation Data</Label>
              <Textarea
                id="data"
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
                placeholder={`Paste your ${platform === 'chatgpt' ? 'ChatGPT' : 'Gemini'} conversation JSON data here...`}
                rows={8}
              />
              <Button 
                onClick={handleTextImport}
                disabled={isProcessing || !textData.trim()}
                className="mt-2"
              >
                {isProcessing ? 'Processing...' : 'Import Conversation'}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully imported "{result.title}" with {result.messageCount} messages.
                Tags: {result.tags.join(', ') || 'None'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Export Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">ChatGPT:</h4>
            <p className="text-sm text-gray-600">
              1. Go to Settings → Data Controls → Export Data<br/>
              2. Download your data and extract the conversations.json file<br/>
              3. Upload the file or copy its contents here
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Gemini:</h4>
            <p className="text-sm text-gray-600">
              1. Go to your Gemini activity page<br/>
              2. Use the export feature or copy conversation data<br/>
              3. Paste the JSON data here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}