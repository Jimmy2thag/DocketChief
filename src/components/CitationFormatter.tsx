import React, { useState } from 'react';
import { Copy, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CaseData {
  title: string;
  citation: string;
  court: string;
  date: string;
  url: string;
  volume?: string;
  reporter?: string;
  page?: string;
  year?: string;
}

interface CitationFormatterProps {
  caseData: CaseData;
}

export default function CitationFormatter({ caseData }: CitationFormatterProps) {
  const [citationStyle, setCitationStyle] = useState('bluebook');
  const { toast } = useToast();

  const formatCitation = (style: string): string => {
    const { title, citation, court, date, volume, reporter, page, year } = caseData;
    
    switch (style) {
      case 'bluebook':
        return `${title}, ${citation} (${court} ${new Date(date).getFullYear()}).`;
      
      case 'alwd':
        return `${title}, ${citation} (${court} ${new Date(date).getFullYear()}).`;
      
      case 'mla':
        return `"${title}." ${court}, ${new Date(date).toLocaleDateString()}. Web.`;
      
      case 'apa':
        return `${title}. (${new Date(date).getFullYear()}). ${court}.`;
      
      case 'chicago':
        return `"${title}," ${court}, ${new Date(date).toLocaleDateString()}.`;
      
      case 'harvard':
        return `${title} (${court}, ${new Date(date).getFullYear()})`;
      
      default:
        return citation;
    }
  };

  const copyCitation = () => {
    const formatted = formatCitation(citationStyle);
    navigator.clipboard.writeText(formatted);
    toast({
      title: "Citation Copied",
      description: `${citationStyle.toUpperCase()} citation copied to clipboard`
    });
  };

  const downloadCitation = () => {
    const formatted = formatCitation(citationStyle);
    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseData.title.replace(/[^a-zA-Z0-9]/g, '_')}_citation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Citation Formatter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Citation Style</label>
          <Select value={citationStyle} onValueChange={setCitationStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bluebook">Bluebook (Legal)</SelectItem>
              <SelectItem value="alwd">ALWD Citation Manual</SelectItem>
              <SelectItem value="mla">MLA Style</SelectItem>
              <SelectItem value="apa">APA Style</SelectItem>
              <SelectItem value="chicago">Chicago Style</SelectItem>
              <SelectItem value="harvard">Harvard Style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Formatted Citation:</h4>
          <p className="text-sm leading-relaxed">{formatCitation(citationStyle)}</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={copyCitation} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy Citation
          </Button>
          <Button onClick={downloadCitation} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}