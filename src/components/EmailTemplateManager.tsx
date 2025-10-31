import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { X, Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplateManagerProps {
  onClose: () => void;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category: string;
  variables: Record<string, string>;
  is_shared: boolean;
  created_at: string;
}

const templateCategories = [
  'client_communication',
  'court_filing',
  'internal',
  'settlement',
  'discovery',
  'scheduling'
];

export function EmailTemplateManager({ onClose }: EmailTemplateManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    category: 'client_communication',
    variables: {} as Record<string, string>
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or(`user_id.eq.${user?.id},is_shared.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const templateData = {
        ...formData,
        user_id: user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        
        toast({
          title: "Template Updated",
          description: "Email template has been updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(templateData);
        
        if (error) throw error;
        
        toast({
          title: "Template Created",
          description: "Email template has been created successfully."
        });
      }

      setShowCreateModal(false);
      setEditingTemplate(null);
      resetForm();
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Email template has been deleted successfully."
      });

      loadTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const duplicateTemplate = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body_html: template.body_html,
          category: template.category,
          variables: template.variables,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Template Duplicated",
        description: "Email template has been duplicated successfully."
      });

      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      category: 'client_communication',
      variables: {}
    });
  };

  const startEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body_html: template.body_html,
      category: template.category,
      variables: template.variables
    });
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <div className="flex gap-2">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingTemplate(null);
                resetForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Client Welcome Email"
                      required
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templateCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Use {{variables}} for dynamic content"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="body">Email Body</Label>
                  <Textarea
                    id="body"
                    value={formData.body_html}
                    onChange={(e) => setFormData(prev => ({ ...prev, body_html: e.target.value }))}
                    placeholder="Use {{client_name}}, {{case_number}}, etc. for dynamic content"
                    rows={10}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.category.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTemplate.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Category: {selectedTemplate.category.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(selectedTemplate)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => duplicateTemplate(selectedTemplate)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deleteTemplate(selectedTemplate.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Subject:</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedTemplate.subject}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Body:</Label>
                    <div className="text-sm bg-gray-50 p-4 rounded mt-1 whitespace-pre-wrap">
                      {selectedTemplate.body_html}
                    </div>
                  </div>

                  {Object.keys(selectedTemplate.variables).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Available Variables:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.keys(selectedTemplate.variables).map((variable) => (
                          <Badge key={variable} variant="secondary">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a template to view its details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}