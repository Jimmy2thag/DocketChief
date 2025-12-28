import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Send, Paperclip, Lock, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmailComposerProps {
  onClose: () => void;
  onSent: () => void;
}

interface Case {
  id: string;
  title: string;
  case_number: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  variables: Record<string, string>;
}

export function EmailComposer({ onClose, onSent }: EmailComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: '',
    case_id: '',
    client_id: '',
    is_encrypted: false
  });
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [casesResult, clientsResult, templatesResult] = await Promise.all([
        supabase.from('cases').select('id, title, case_number').limit(50),
        supabase.from('clients').select('id, name, email').limit(50),
        supabase.from('email_templates').select('*').eq('user_id', user?.id)
      ]);

      setCases(casesResult.data || []);
      setClients(clientsResult.data || []);
      setTemplates(templatesResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        body: template.body_html
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.to || !formData.subject) return;

    setSending(true);
    try {
      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('email-integration', {
        body: {
          action: 'send',
          to: formData.to.split(',').map(email => email.trim()),
          cc: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
          bcc: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
          subject: formData.subject,
          body: formData.body,
          is_encrypted: formData.is_encrypted
        }
      });

      if (error) throw error;

      // Save to database
      await supabase.from('emails').insert({
        user_id: user?.id,
        case_id: formData.case_id || null,
        client_id: formData.client_id || null,
        subject: formData.subject,
        from_email: user?.email,
        to_emails: formData.to.split(',').map(email => email.trim()),
        cc_emails: formData.cc ? formData.cc.split(',').map(email => email.trim()) : [],
        bcc_emails: formData.bcc ? formData.bcc.split(',').map(email => email.trim()) : [],
        body_html: formData.body,
        body_text: formData.body.replace(/<[^>]*>/g, ''),
        is_encrypted: formData.is_encrypted,
        provider: 'smtp',
        sent_at: new Date().toISOString()
      });

      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully."
      });

      onSent();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Compose Email</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  if (value) applyTemplate(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Case (Optional)</Label>
                <Select value={formData.case_id} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, case_id: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case..." />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((case_) => (
                      <SelectItem key={case_.id} value={case_.id}>
                        {case_.case_number} - {case_.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                placeholder="recipient@example.com, another@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  type="email"
                  value={formData.cc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="cc@example.com"
                />
              </div>
              <div>
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  type="email"
                  value={formData.bcc}
                  onChange={(e) => setFormData(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder="bcc@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
                required
              />
            </div>

            <div>
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Compose your email..."
                rows={12}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4 mr-1" />
                  Attach Files
                </Button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_encrypted}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_encrypted: e.target.checked }))}
                    className="rounded"
                  />
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Encrypt Email</span>
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
