import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Search, Filter, Plus, Settings, Lock, Archive } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { EmailComposer } from './EmailComposer';
import { EmailTemplateManager } from './EmailTemplateManager';
import { EmailSettings } from './EmailSettings';

interface Email {
  id: string;
  subject: string;
  from_email: string;
  to_emails: string[];
  body_text: string;
  case_id?: string;
  client_id?: string;
  is_read: boolean;
  is_important: boolean;
  is_encrypted: boolean;
  provider: string;
  received_at: string;
  labels: string[];
}

export function EmailDashboard() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLabel, setFilterLabel] = useState('all');
  const [showComposer, setShowComposer] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEmails();
    }
  }, [user]);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user?.id)
        .order('received_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmails(data || []);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncEmails = async (provider: 'gmail' | 'outlook') => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('email-integration', {
        body: {
          action: provider === 'gmail' ? 'sync_gmail' : 'sync_outlook',
          userId: user?.id,
          accessToken: 'mock_token' // In production, get from OAuth
        }
      });

      if (error) throw error;
      
      // Save synced emails to database
      if (data.emails?.length > 0) {
        const emailsWithUserId = data.emails.map((email: { message_id: string; [key: string]: unknown }) => ({
          ...email,
          user_id: user?.id
        }));

        await supabase.from('emails').upsert(emailsWithUserId, {
          onConflict: 'message_id'
        });
        
        await loadEmails();
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', emailId);
      
      setEmails(prev => prev.map(email => 
        email.id === emailId ? { ...email, is_read: true } : email
      ));
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterLabel === 'all' || 
                         (filterLabel === 'unread' && !email.is_read) ||
                         (filterLabel === 'important' && email.is_important) ||
                         (filterLabel === 'encrypted' && email.is_encrypted) ||
                         email.labels.includes(filterLabel);
    
    return matchesSearch && matchesFilter;
  });

  if (showComposer) {
    return <EmailComposer onClose={() => setShowComposer(false)} onSent={loadEmails} />;
  }

  if (showTemplates) {
    return <EmailTemplateManager onClose={() => setShowTemplates(false)} />;
  }

  if (showSettings) {
    return <EmailSettings onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => syncEmails('gmail')} variant="outline">
            Sync Gmail
          </Button>
          <Button onClick={() => syncEmails('outlook')} variant="outline">
            Sync Outlook
          </Button>
          <Button onClick={() => setShowComposer(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Inbox
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={filterLabel} onValueChange={setFilterLabel}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unread">Unread</TabsTrigger>
                  <TabsTrigger value="important">Important</TabsTrigger>
                  <TabsTrigger value="encrypted">Encrypted</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    } ${!email.is_read ? 'font-semibold' : ''}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      if (!email.is_read) markAsRead(email.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium truncate">{email.from_email}</span>
                      <div className="flex gap-1">
                        {email.is_important && <Badge variant="destructive" className="text-xs">!</Badge>}
                        {email.is_encrypted && <Lock className="h-3 w-3 text-green-600" />}
                        <Badge variant="outline" className="text-xs">{email.provider}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{email.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(email.received_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                  Templates
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedEmail.subject}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      From: {selectedEmail.from_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      To: {selectedEmail.to_emails.join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedEmail.is_encrypted && (
                      <Badge variant="outline" className="text-green-600">
                        <Lock className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                    <Badge variant="outline">{selectedEmail.provider}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: selectedEmail.body_text }} />
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Button size="sm">Reply</Button>
                  <Button size="sm" variant="outline">Forward</Button>
                  <Button size="sm" variant="outline">
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email to view its contents</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}