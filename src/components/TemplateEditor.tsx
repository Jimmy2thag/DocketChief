import React, { useState } from 'react';
import { TemplateRecord } from '@/contexts/TemplateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Save, Eye, Wand2, User, Building, Calendar } from 'lucide-react';

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

interface TemplateEditorProps {
  template?: TemplateRecord;
  onSave?: (template: TemplateRecord) => void;
  onClose?: () => void;
  onAnalyze?: (content: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onClose,
  onAnalyze
}) => {
  const [title, setTitle] = useState(template?.title || '');
  const [category, setCategory] = useState(template?.category || 'contracts');
  const [jurisdiction, setJurisdiction] = useState(template?.jurisdiction || 'Federal');
  const [content, setContent] = useState(template?.content || '');
  const [tags, setTags] = useState(template?.tags?.join(', ') || '');
  const [description, setDescription] = useState(template?.description || '');
  const [showPreview, setShowPreview] = useState(false);

  const clientInfo: ClientInfo = {
    name: 'John Smith',
    company: 'Smith & Associates LLC',
    address: '123 Main St, Anytown, ST 12345',
    email: 'john@smithlaw.com',
    phone: '(555) 123-4567'
  };

  const autoPopulateFields = () => {
    const populatedContent = content
      .replace(/\[CLIENT_NAME\]/g, clientInfo.name)
      .replace(/\[CLIENT_COMPANY\]/g, clientInfo.company)
      .replace(/\[CLIENT_ADDRESS\]/g, clientInfo.address)
      .replace(/\[CLIENT_EMAIL\]/g, clientInfo.email)
      .replace(/\[CLIENT_PHONE\]/g, clientInfo.phone)
      .replace(/\[DATE\]/g, new Date().toLocaleDateString())
      .replace(/\[YEAR\]/g, new Date().getFullYear().toString());
    
    setContent(populatedContent);
  };

  const insertClause = (clauseText: string) => {
    setContent(prev => prev + '\n\n' + clauseText);
  };

  const commonClauses = [
    {
      title: 'Confidentiality Clause',
      content: 'The parties acknowledge that they may have access to certain confidential information of the other party. Each party agrees to maintain the confidentiality of such information and not to disclose it to any third party without prior written consent.'
    },
    {
      title: 'Governing Law',
      content: 'This Agreement shall be governed by and construed in accordance with the laws of [JURISDICTION], without regard to its conflict of laws principles.'
    },
    {
      title: 'Termination Clause',
      content: 'Either party may terminate this Agreement upon thirty (30) days written notice to the other party. Upon termination, all rights and obligations shall cease, except for those that by their nature should survive termination.'
    },
    {
      title: 'Force Majeure',
      content: 'Neither party shall be liable for any failure or delay in performance under this Agreement which is due to fire, flood, earthquake, elements of nature, acts of God, acts of war, terrorism, riots, civil disorders, rebellions or other similar causes beyond the reasonable control of such party.'
    }
  ];

  const handleSave = () => {
    const templateData: TemplateRecord = {
      id: template?.id || `template-${Date.now()}`,
      title,
      category,
      jurisdiction,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      description,
      isCustom: template?.isCustom ?? true,
      isFavorite: template?.isFavorite ?? false,
      lastModified: new Date().toISOString().split('T')[0]
    };
    onSave?.(templateData);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Editor</h1>
          <p className="text-gray-600">Create and customize legal document templates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Template title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="contracts">Contracts</option>
                  <option value="motions">Motions</option>
                  <option value="briefs">Briefs</option>
                  <option value="agreements">Agreements</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Jurisdiction</label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Federal">Federal</option>
                  <option value="California">California</option>
                  <option value="New York">New York</option>
                  <option value="Texas">Texas</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="contract, employment, standard"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of template"
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={autoPopulateFields} 
                  variant="outline" 
                  className="w-full mb-2"
                >
                  <User className="h-4 w-4 mr-2" />
                  Auto-populate Client Info
                </Button>
                
                <Button 
                  onClick={() => onAnalyze?.(content)} 
                  variant="outline" 
                  className="w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Common Clauses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {commonClauses.map((clause, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertClause(clause.content)}
                    className="w-full text-left justify-start"
                  >
                    {clause.title}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Document Content</CardTitle>
              <CardDescription>
                Use placeholders like [CLIENT_NAME], [DATE], [CLIENT_COMPANY] for auto-population
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPreview ? (
                <div className="prose max-w-none bg-white p-6 border rounded-lg min-h-[600px]">
                  <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {content || 'No content to preview'}
                  </pre>
                </div>
              ) : (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your template content here..."
                  className="min-h-[600px] font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};