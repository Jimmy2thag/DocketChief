import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIService, ChatMessage } from '@/lib/aiService';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  aiProvider?: string;
  error?: boolean;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('openai');
  const [rateLimitWarning, setRateLimitWarning] = useState<string>('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRateLimitWarning('');

    try {
      // Prepare conversation history for AI
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: input
      });

      // Call AI service
      const aiResponse = await AIService.sendMessage(
        conversationHistory,
        aiProvider,
        user?.email || 'anonymous'
      );

      if (aiResponse.error === 'RATE_LIMITED') {
        setRateLimitWarning(aiResponse.response);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        role: 'assistant',
        timestamp: new Date(),
        aiProvider: aiResponse.provider,
        error: !!aiResponse.error
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment. If the issue persists, you can use the other legal research tools available in the platform.',
        role: 'assistant',
        timestamp: new Date(),
        aiProvider: aiProvider,
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setRateLimitWarning('');
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Legal AI Assistant
            <Badge variant="outline" className="text-xs">
              Enhanced with GPT-4 & Gemini
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={aiProvider} onValueChange={(value: 'openai' | 'gemini') => setAiProvider(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">GPT-4</SelectItem>
                <SelectItem value="gemini">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear
            </Button>
          </div>
        </div>
        
        {rateLimitWarning && (
          <Alert className="mt-2">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {rateLimitWarning}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center max-w-md">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">Legal AI Assistant Ready</h3>
                <p className="text-sm mb-4">Powered by GPT-4 and Gemini Pro for comprehensive legal research assistance</p>
                <div className="text-xs text-left bg-muted p-3 rounded-lg">
                  <strong>I can help with:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Legal research & case law analysis</li>
                    <li>• Document review & drafting</li>
                    <li>• Motion & brief assistance</li>
                    <li>• Citation formatting</li>
                    <li>• Procedural guidance</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Bot className={`h-8 w-8 p-1 rounded-full ${
                        message.error ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                      }`} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : message.error
                        ? 'bg-destructive/10 border border-destructive/20'
                        : 'bg-muted'
                    }`}
                  >
                    {message.error && message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Service Issue</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      {message.aiProvider && (
                        <Badge variant="secondary" className="text-xs">
                          {message.aiProvider}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <User className="h-8 w-8 p-1 bg-secondary text-secondary-foreground rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about legal research, case analysis, document review..."
              disabled={isLoading}
              className="flex-1"
              maxLength={1000}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Responses are for informational purposes only and do not constitute legal advice.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}