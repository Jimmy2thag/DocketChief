import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, FileText, Plus, Edit, Copy, Star } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  jurisdiction: string;
  tags: string[];
  content: string;
  isCustom: boolean;
  isFavorite: boolean;
  lastModified: string;
}

interface TemplateLibraryProps {
  onEditTemplate?: (template: Template) => void;
  onAnalyzeTemplate?: (content: string) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onEditTemplate,
  onAnalyzeTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  const templates: Template[] = [
    {
      id: '1',
      title: 'Employment Agreement',
      category: 'contracts',
      description: 'Comprehensive employment contract with standard terms',
      jurisdiction: 'Federal',
      tags: ['employment', 'contract', 'standard'],
      content: 'EMPLOYMENT AGREEMENT\n\nThis Employment Agreement...',
      isCustom: false,
      isFavorite: true,
      lastModified: '2024-01-15'
    },
    {
      id: '2',
      title: 'Motion to Dismiss',
      category: 'motions',
      description: 'Standard motion to dismiss with supporting arguments',
      jurisdiction: 'California',
      tags: ['motion', 'dismiss', 'civil'],
      content: 'MOTION TO DISMISS\n\nTO THE HONORABLE COURT...',
      isCustom: false,
      isFavorite: false,
      lastModified: '2024-01-10'
    },
    {
      id: '3',
      title: 'NDA Template',
      category: 'agreements',
      description: 'Non-disclosure agreement for business transactions',
      jurisdiction: 'New York',
      tags: ['nda', 'confidentiality', 'business'],
      content: 'NON-DISCLOSURE AGREEMENT\n\nThis Agreement...',
      isCustom: false,
      isFavorite: true,
      lastModified: '2024-01-12'
    },
    {
      id: '4',
      title: 'Custom Brief Template',
      category: 'briefs',
      description: 'My customized appellate brief template',
      jurisdiction: 'Texas',
      tags: ['brief', 'appellate', 'custom'],
      content: 'APPELLATE BRIEF\n\nCustom template...',
      isCustom: true,
      isFavorite: false,
      lastModified: '2024-01-20'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'contracts', label: 'Contracts', count: templates.filter(t => t.category === 'contracts').length },
    { id: 'motions', label: 'Motions', count: templates.filter(t => t.category === 'motions').length },
    { id: 'briefs', label: 'Briefs', count: templates.filter(t => t.category === 'briefs').length },
    { id: 'agreements', label: 'Agreements', count: templates.filter(t => t.category === 'agreements').length }
  ];

  const jurisdictions = ['all', 'Federal', 'California', 'New York', 'Texas'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesJurisdiction = selectedJurisdiction === 'all' || template.jurisdiction === selectedJurisdiction;
    
    return matchesSearch && matchesCategory && matchesJurisdiction;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Template Library</h1>
        <p className="text-gray-600">Browse, customize, and create legal document templates with AI assistance</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Jurisdiction</label>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {jurisdictions.map(jurisdiction => (
                    <option key={jurisdiction} value={jurisdiction}>
                      {jurisdiction === 'all' ? 'All Jurisdictions' : jurisdiction}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-2 rounded-md flex justify-between items-center ${
                      selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.label}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {selectedCategory === 'all' ? 'All Templates' : categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-gray-600">{filteredTemplates.length} templates found</p>
            </div>
            <Button onClick={() => onEditTemplate?.({} as Template)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.title}
                        {template.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline">{template.jurisdiction}</Badge>
                    {template.isCustom && <Badge variant="secondary">Custom</Badge>}
                    {template.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onEditTemplate?.(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAnalyzeTemplate?.(template.content)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Modified: {template.lastModified}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};