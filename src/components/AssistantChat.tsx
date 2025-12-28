/**
 * Enhanced Assistant Chat Component
 * 
 * In-app assistant with memory, learning, and privacy controls
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Settings, 
  Download, 
  Trash2,
  Info,
  Brain,
  Shield
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAssistant } from '@/contexts/AssistantContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIService, ChatMessage } from '@/lib/aiService';
import { assistantMemoryService } from '@/lib/assistantMemoryService';
import { AssistantMessage } from '@/types/assistant';
import { toast } from '@/components/ui/use-toast';

export function AssistantChat() {
  const { user } = useAuth();
  const {
    memory,
    messages,
    addMessage,
    clearMessages,
    applyLearnings,
    clearMemory,
    exportMemory,
    updateMemory,
    getSystemPrompt,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create user message
    const userMessage: AssistantMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for AI
      const conversationHistory: ChatMessage[] = messages
        .filter(m => m.role !== 'system')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add system prompt with memory context
      const systemPrompt = getSystemPrompt();
      
      conversationHistory.unshift({
        role: 'system',
        content: systemPrompt,
      });

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: input,
      });

      // Call AI service
      const aiResponse = await AIService.sendMessage(
        conversationHistory.slice(-10), // Keep last 10 messages for context
        'openai',
        user?.email || 'anonymous'
      );

      // Parse learnings candidate from response
      const learnings = assistantMemoryService.parseLearningsCandidate(aiResponse.response);
      
      // Extract clean response (without learnings block)
      const cleanResponse = assistantMemoryService.extractCleanResponse(aiResponse.response);

      // Create assistant message
      const assistantMessage: AssistantMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date().toISOString(),
        learningsCandidate: learnings || undefined,
      };

      addMessage(assistantMessage);

      // Apply learnings if auto-apply is enabled
      if (learnings && memory.preferences.autoApplyLearnings) {
        applyLearnings(learnings);
      }

    } catch (error) {
      console.error('Assistant error:', error);
      
      const errorMessage: AssistantMessage = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };

      addMessage(errorMessage);
      
      toast({
        title: 'Error',
        description: 'Failed to get response from assistant',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast({
      title: 'Chat cleared',
      description: 'Your conversation has been cleared',
    });
  };

  const handleClearMemory = () => {
    if (confirm('Are you sure you want to clear all learned preferences? This cannot be undone.')) {
      clearMemory();
      toast({
        title: 'Memory cleared',
        description: 'All learned preferences have been reset',
      });
    }
  };

  const handleExportMemory = () => {
    try {
      const memoryData = exportMemory();
      const blob = new Blob([memoryData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assistant-memory-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Memory exported',
        description: 'Your assistant memory has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export memory',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            DocketChief Assistant
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Memory-Enhanced
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Assistant Settings</DialogTitle>
                  <DialogDescription>
                    Configure how the assistant learns and adapts to your preferences
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tone">Response Tone</Label>
                    <select
                      id="tone"
                      className="w-full p-2 border rounded-md"
                      value={memory.preferences.tone}
                      onChange={(e) => updateMemory({
                        preferences: {
                          ...memory.preferences,
                          tone: e.target.value as 'concise' | 'detailed' | 'balanced',
                        }
                      })}
                    >
                      <option value="concise">Concise (Quick answers)</option>
                      <option value="balanced">Balanced (Default)</option>
                      <option value="detailed">Detailed (Thorough)</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-learn">Auto-apply learnings</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically adapt based on your interactions
                      </p>
                    </div>
                    <Switch
                      id="auto-learn"
                      checked={memory.preferences.autoApplyLearnings}
                      onCheckedChange={(checked) => updateMemory({
                        preferences: {
                          ...memory.preferences,
                          autoApplyLearnings: checked,
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="store-interactions">Store interactions</Label>
                      <p className="text-sm text-muted-foreground">
                        Remember preferences across sessions
                      </p>
                    </div>
                    <Switch
                      id="store-interactions"
                      checked={memory.preferences.storeInteractions}
                      onCheckedChange={(checked) => updateMemory({
                        preferences: {
                          ...memory.preferences,
                          storeInteractions: checked,
                        }
                      })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Memory Management</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportMemory}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearMemory}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Your data is stored locally on your device. The assistant learns from your
                      interactions to provide better help over time.
                    </AlertDescription>
                  </Alert>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleClearChat}>
              Clear Chat
            </Button>
          </div>
        </div>

        {!memory.preferences.storeInteractions && (
          <Alert className="mt-2">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Memory storage is disabled. The assistant won't remember preferences across sessions.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <Bot className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">How can I help you with DocketChief today?</p>
                <p className="text-xs">I learn from our interactions to serve you better.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.learningsCandidate && memory.preferences.autoApplyLearnings && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        Learning applied
                      </Badge>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about DocketChief..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>
              {memory.learnedPreferences.length > 0 && (
                <>Remembering {memory.learnedPreferences.length} preferences</>
              )}
              {memory.learnedPreferences.length === 0 && (
                <>Learning your preferences as we interact</>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
