import React from 'react';
import { Calendar, MapPin, FileText, Scale, Building } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface AdvancedSearchFiltersProps {
  filters: {
    jurisdiction: string;
    dateRange: { start: string; end: string };
    caseType: string;
    citationFormat: string;
    courtLevel: string;
    practiceArea: string;
  };
  onFilterChange: (key: string, value: string | { start: string; end: string }) => void;
}

export const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const jurisdictions = [
    { value: 'all', label: 'All Jurisdictions' },
    { value: 'federal', label: 'Federal Courts' },
    { value: 'state', label: 'State Courts' },
    { value: 'scotus', label: 'Supreme Court' },
    { value: 'ca1', label: '1st Circuit' },
    { value: 'ca2', label: '2nd Circuit' },
    { value: 'ca3', label: '3rd Circuit' },
    { value: 'ca4', label: '4th Circuit' },
    { value: 'ca5', label: '5th Circuit' },
    { value: 'ca6', label: '6th Circuit' },
    { value: 'ca7', label: '7th Circuit' },
    { value: 'ca8', label: '8th Circuit' },
    { value: 'ca9', label: '9th Circuit' },
    { value: 'ca10', label: '10th Circuit' },
    { value: 'ca11', label: '11th Circuit' },
    { value: 'cadc', label: 'D.C. Circuit' },
    { value: 'cafc', label: 'Federal Circuit' }
  ];

  const caseTypes = [
    { value: 'all', label: 'All Case Types' },
    { value: 'civil', label: 'Civil' },
    { value: 'criminal', label: 'Criminal' },
    { value: 'constitutional', label: 'Constitutional' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'tax', label: 'Tax' },
    { value: 'bankruptcy', label: 'Bankruptcy' },
    { value: 'intellectual-property', label: 'Intellectual Property' },
    { value: 'employment', label: 'Employment' },
    { value: 'environmental', label: 'Environmental' }
  ];

  const courtLevels = [
    { value: 'all', label: 'All Court Levels' },
    { value: 'supreme', label: 'Supreme Court' },
    { value: 'appellate', label: 'Appellate Courts' },
    { value: 'district', label: 'District Courts' },
    { value: 'bankruptcy', label: 'Bankruptcy Courts' },
    { value: 'magistrate', label: 'Magistrate Courts' }
  ];

  const practiceAreas = [
    { value: 'all', label: 'All Practice Areas' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'litigation', label: 'Litigation' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'family', label: 'Family Law' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'personal-injury', label: 'Personal Injury' },
    { value: 'securities', label: 'Securities' },
    { value: 'healthcare', label: 'Healthcare' }
  ];

  const citationFormats = [
    { value: 'bluebook', label: 'Bluebook (20th ed.)' },
    { value: 'alwd', label: 'ALWD Citation Manual' },
    { value: 'mla', label: 'MLA Style' },
    { value: 'apa', label: 'APA Style' },
    { value: 'chicago', label: 'Chicago Manual' }
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Jurisdiction
          </label>
          <Select 
            value={filters.jurisdiction} 
            onValueChange={(value) => onFilterChange('jurisdiction', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {jurisdictions.map(j => (
                <SelectItem key={j.value} value={j.value}>{j.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Court Level
          </label>
          <Select 
            value={filters.courtLevel} 
            onValueChange={(value) => onFilterChange('courtLevel', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courtLevels.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Case Type
          </label>
          <Select 
            value={filters.caseType} 
            onValueChange={(value) => onFilterChange('caseType', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {caseTypes.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Practice Area
          </label>
          <Select 
            value={filters.practiceArea} 
            onValueChange={(value) => onFilterChange('practiceArea', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {practiceAreas.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date From
          </label>
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => onFilterChange('dateRange', { 
              ...filters.dateRange, 
              start: e.target.value 
            })}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date To
          </label>
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => onFilterChange('dateRange', { 
              ...filters.dateRange, 
              end: e.target.value 
            })}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <label className="text-sm font-medium mb-2 block">
          Citation Format
        </label>
        <div className="flex gap-2 flex-wrap">
          {citationFormats.map(format => (
            <Badge
              key={format.value}
              variant={filters.citationFormat === format.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onFilterChange('citationFormat', format.value)}
            >
              {format.label}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};
