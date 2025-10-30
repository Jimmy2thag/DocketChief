import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, FileText, Plus, Edit, Copy, Star, RefreshCw } from 'lucide-react';
import { createEmptyTemplate, getTemplateCategories, TemplateRecord, useTemplateLibrary } from '@/contexts/TemplateContext';
import { useToast } from '@/hooks/use-toast';

interface TemplateLibraryProps {
  onEditTemplate?: (template: TemplateRecord) => void;
  onAnalyzeTemplate?: (content: string, metadata?: TemplateRecord) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  onEditTemplate,
  onAnalyzeTemplate
}) => {
  const { templates, toggleFavorite, resetTemplates } = useTemplateLibrary();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('all');

  const jurisdictions = useMemo(() => {
    const uniques = new Set<string>(['all']);
    templates.forEach(template => uniques.add(template.jurisdiction));
    return Array.from(uniques);
  }, [templates]);

  const categories = useMemo(() => getTemplateCategories(templates), [templates]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesJurisdiction = selectedJurisdiction === 'all' || template.jurisdiction === selectedJurisdiction;
    
    return matchesSearch && matchesCategory && matchesJurisdiction;
  });

  const handleReset = () => {
    resetTemplates();
    toast({
      title: 'Template library restored',
      description: 'Default templates have been reloaded.'
    });
  };

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restore Defaults
              </Button>
              <Button onClick={() => onEditTemplate?.(createEmptyTemplate())}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
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
                      onClick={() => onAnalyzeTemplate?.(template.content, template)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Modified: {template.lastModified}</p>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(template.id)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    {template.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};