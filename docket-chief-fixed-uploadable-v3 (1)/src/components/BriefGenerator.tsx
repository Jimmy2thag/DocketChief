import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { legalAiChat } from '@/lib/aiService';
import { CourtListenerResult, searchCourtListener } from '@/lib/courtListener';

interface BriefData {
  briefType: string;
  caseTitle: string;
  facts: string;
  legalIssues: string;
  jurisdiction: string;
  clientPosition: string;
  relevantCases: string;
}

export function BriefGenerator() {
  const [briefData, setBriefData] = useState<BriefData>({
    briefType: '',
    caseTitle: '',
    facts: '',
    legalIssues: '',
    jurisdiction: '',
    clientPosition: '',
    relevantCases: ''
  });
  const [generatedBrief, setGeneratedBrief] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [authorities, setAuthorities] = useState<CourtListenerResult[]>([]);
  const [authorityError, setAuthorityError] = useState('');
  const [isFetchingAuthorities, setIsFetchingAuthorities] = useState(false);
  const { toast } = useToast();

  const briefTypes = [
    { value: 'appellate', label: 'Appellate Brief' },
    { value: 'trial', label: 'Trial Brief' },
    { value: 'summary_judgment', label: 'Summary Judgment Motion' },
    { value: 'motion_to_dismiss', label: 'Motion to Dismiss' },
    { value: 'opposition', label: 'Opposition Brief' }
  ];

  const jurisdictions = [
    'Federal Circuit', 'Supreme Court', 'District Court',
    'California', 'New York', 'Texas', 'Florida', 'Illinois'
  ];

  const handleInputChange = (field: keyof BriefData, value: string) => {
    setBriefData(prev => ({ ...prev, [field]: value }));
  };

  const generateBrief = async () => {
    if (!briefData.briefType || !briefData.caseTitle || !briefData.facts || !briefData.legalIssues) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsFetchingAuthorities(true);
    setAuthorityError('');
    try {
      const retrievedAuthorities = await searchCourtListener(briefData.legalIssues, {
        jurisdiction: briefData.jurisdiction,
        limit: 5,
      }).catch((err) => {
        setAuthorityError(err instanceof Error ? err.message : 'Unable to reach CourtListener.');
        return [] as CourtListenerResult[];
      });

      setAuthorities(retrievedAuthorities);

      const proceduralRules: Record<string, string[]> = {
        appellate: ['Fed. R. App. P. 28', 'Fed. R. App. P. 32'],
        trial: ['Fed. R. Civ. P. 8', 'Fed. R. Civ. P. 56'],
        summary_judgment: ['Fed. R. Civ. P. 56', 'Fed. R. Civ. P. 12'],
        motion_to_dismiss: ['Fed. R. Civ. P. 12(b)(6)', 'Fed. R. Civ. P. 12(b)(1)'],
        opposition: ['Fed. R. Civ. P. 7', 'Local Rule 7-3'],
      };

      const ruleCitations = proceduralRules[briefData.briefType as keyof typeof proceduralRules] || ['Fed. R. Civ. P. 1'];
      const authoritySummary = retrievedAuthorities
        .map((result) => `${result.caseName} (${result.court}, ${result.date_filed || 'n.d.'}) - ${result.citation.join(', ')}`)
        .slice(0, 3)
        .join('\n');

      const { content } = await legalAiChat({
        system:
          'You are an expert litigator. Draft briefs that strictly follow applicable procedural rules and rely on the provided authorities. Use Markdown headings, a Table of Authorities, Statement of the Issues, Argument, and Conclusion. Do not invent citations.',
        messages: [
          {
            role: 'user',
            content: `Draft a ${briefTypes.find((t) => t.value === briefData.briefType)?.label ?? 'legal brief'} with the following context.\n\nCase Title: ${briefData.caseTitle}\nJurisdiction: ${briefData.jurisdiction || 'Federal'}\nFacts: ${briefData.facts}\nLegal Issues: ${briefData.legalIssues}\nClient Position: ${briefData.clientPosition || 'Not specified'}\nRules to Apply: ${ruleCitations.join(', ')}\nUser Provided Authorities: ${briefData.relevantCases || 'None'}\nCourtListener Authorities:\n${authoritySummary || 'No authorities retrieved.'}\n\nReturn the full brief in Markdown, making sure each citation references the supplied authorities or rules.`,
          },
        ],
      });

      setGeneratedBrief(content.trim());
      toast({
        title: "Brief Generated",
        description: "Your legal brief has been generated successfully",
      });
    } catch (error) {
      console.error('Brief generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate brief. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setIsFetchingAuthorities(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBrief);
    toast({
      title: "Copied",
      description: "Brief copied to clipboard"
    });
  };

  const downloadBrief = () => {
    const blob = new Blob([generatedBrief], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${briefData.caseTitle.replace(/\s+/g, '_')}_brief.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Brief Generator</h1>
          <p className="text-gray-600">Generate professional legal briefs with AI assistance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Brief Information</CardTitle>
            <CardDescription>Enter case details and legal issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="briefType">Brief Type *</Label>
                <Select value={briefData.briefType} onValueChange={(value) => handleInputChange('briefType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brief type" />
                  </SelectTrigger>
                  <SelectContent>
                    {briefTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select value={briefData.jurisdiction} onValueChange={(value) => handleInputChange('jurisdiction', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {jurisdictions.map(jurisdiction => (
                      <SelectItem key={jurisdiction} value={jurisdiction}>{jurisdiction}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="caseTitle">Case Title *</Label>
              <Input
                id="caseTitle"
                value={briefData.caseTitle}
                onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                placeholder="e.g., Smith v. Jones"
              />
            </div>

            <div>
              <Label htmlFor="facts">Statement of Facts *</Label>
              <Textarea
                id="facts"
                value={briefData.facts}
                onChange={(e) => handleInputChange('facts', e.target.value)}
                placeholder="Describe the relevant facts of the case..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="legalIssues">Legal Issues *</Label>
              <Textarea
                id="legalIssues"
                value={briefData.legalIssues}
                onChange={(e) => handleInputChange('legalIssues', e.target.value)}
                placeholder="What are the key legal issues to be addressed?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="clientPosition">Client Position</Label>
              <Textarea
                id="clientPosition"
                value={briefData.clientPosition}
                onChange={(e) => handleInputChange('clientPosition', e.target.value)}
                placeholder="What is your client's position or desired outcome?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="relevantCases">Relevant Case Law</Label>
              <Textarea
                id="relevantCases"
                value={briefData.relevantCases}
                onChange={(e) => handleInputChange('relevantCases', e.target.value)}
                placeholder="List any relevant cases, statutes, or legal authorities..."
                rows={3}
              />
            </div>

            <Button 
              onClick={generateBrief} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Brief...
                </>
              ) : (
                'Generate Brief'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Brief</CardTitle>
            <CardDescription>AI-generated legal brief ready for review</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingAuthorities && (
              <div className="text-sm text-gray-500 mb-3">Querying CourtListener for recent authorities...</div>
            )}
            {authorityError && (
              <div className="text-sm text-red-600 mb-3">{authorityError}</div>
            )}
            {authorities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700">Authorities referenced</h4>
                <ul className="mt-2 space-y-2">
                  {authorities.map((authority) => (
                    <li key={authority.id} className="text-xs text-gray-600">
                      <a
                        href={`https://www.courtlistener.com${authority.absolute_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {authority.caseName}
                      </a>
                      {authority.citation.length > 0 && (
                        <span className="block text-gray-500">{authority.citation.join(', ')}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {generatedBrief ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button onClick={downloadBrief} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Badge variant="secondary">
                    {briefTypes.find(t => t.value === briefData.briefType)?.label}
                  </Badge>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedBrief}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Generated brief will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}