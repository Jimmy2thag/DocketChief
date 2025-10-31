import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Copy, Plus } from 'lucide-react';

interface Clause {
  id: string;
  title: string;
  category: string;
  content: string;
  jurisdiction: string;
}

interface ClauseLibraryProps {
  onInsertClause?: (content: string) => void;
}

export const ClauseLibrary: React.FC<ClauseLibraryProps> = ({ onInsertClause }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const clauses: Clause[] = [
    {
      id: '1',
      title: 'Confidentiality',
      category: 'privacy',
      content: 'The parties acknowledge confidential information access and agree to maintain confidentiality.',
      jurisdiction: 'Federal'
    },
    {
      id: '2',
      title: 'Governing Law',
      category: 'legal',
      content: 'This Agreement shall be governed by laws of [JURISDICTION].',
      jurisdiction: 'Federal'
    },
    {
      id: '3',
      title: 'Termination',
      category: 'contract',
      content: 'Either party may terminate with thirty (30) days written notice.',
      jurisdiction: 'Federal'
    }
  ];

  const categories = ['all', 'privacy', 'legal', 'contract', 'payment'];

  const filteredClauses = clauses.filter(clause => {
    const matchesSearch = clause.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || clause.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clauses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredClauses.map(clause => (
          <Card key={clause.id} className="p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium">{clause.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{clause.content}</p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">{clause.category}</Badge>
                  <Badge variant="secondary" className="text-xs">{clause.jurisdiction}</Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onInsertClause?.(clause.content)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};