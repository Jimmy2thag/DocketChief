import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Calendar, Tag, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

interface Conversation {
  id: string;
  title: string;
  platform: 'chatgpt' | 'gemini';
  tags: string[];
  created_at: string;
  conversation_data: {
    messages?: Array<{ role: string; content: string }>;
    [key: string]: unknown;
  };
}

export function ConversationManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm, platformFilter]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('imported_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterConversations = () => {
    let filtered = conversations;

    if (searchTerm) {
      filtered = filtered.filter(conv =>
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(conv => conv.platform === platformFilter);
    }

    setFilteredConversations(filtered);
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('imported_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setConversations(prev => prev.filter(conv => conv.id !== id));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const exportConversation = (conversation: Conversation) => {
    const dataStr = JSON.stringify(conversation.conversation_data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const continueConversation = (conversation: Conversation) => {
    // Navigate to AI Chat with pre-loaded conversation
    const event = new CustomEvent('continueConversation', { 
      detail: { conversation } 
    });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading conversations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="chatgpt">ChatGPT</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredConversations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations found</h3>
              <p className="text-gray-500">
                {conversations.length === 0 
                  ? "Import your first conversation to get started" 
                  : "Try adjusting your search or filter criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{conversation.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant={conversation.platform === 'chatgpt' ? 'default' : 'secondary'}>
                        {conversation.platform === 'chatgpt' ? 'ChatGPT' : 'Gemini'}
                      </Badge>
                      <Calendar className="h-4 w-4" />
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>{conversation.title}</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                          <div className="space-y-4">
                            {conversation.conversation_data.messages?.map((message: { role: string; content: string }, index: number) => (
                              <div key={index} className={`p-3 rounded-lg ${
                                message.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                              }`}>
                                <div className="font-medium text-sm mb-1">
                                  {message.role === 'user' ? 'You' : 'AI'}
                                </div>
                                <div className="text-sm">{message.content}</div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={() => continueConversation(conversation)}>
                            Continue Conversation
                          </Button>
                          <Button variant="outline" onClick={() => exportConversation(conversation)}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => continueConversation(conversation)}
                    >
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteConversation(conversation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {conversation.tags.length > 0 && (
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-gray-400" />
                    {conversation.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}