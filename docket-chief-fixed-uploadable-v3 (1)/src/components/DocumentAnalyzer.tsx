import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, Brain, Edit, Scale } from 'lucide-react';

interface AnalysisResult {
  summary: string;
  keyInformation: {
    parties: string[];
    dates: string[];
    amounts: string[];
    obligations: string[];
  };
  importantClauses: Array<{
    title: string;
    content: string;
    importance: 'high' | 'medium' | 'low';
    explanation: string;
  }>;
  riskAssessment: {
    highRisk: string[];
    mediumRisk: string[];
    recommendations: string[];
  };
  suggestedEdits: Array<{
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }>;
  legalCitations: string[];
}

export default function DocumentAnalyzer() {
  const [documentText, setDocumentText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeDocument = async () => {
    if (!documentText.trim()) {
      setError('Please enter document text to analyze');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock analysis for demo - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis: AnalysisResult = {
        summary: "This employment contract establishes terms between ABC Corp and John Smith for a Software Engineer position with competitive compensation and standard benefits.",
        keyInformation: {
          parties: ["ABC Corporation", "John Smith"],
          dates: ["Start Date: January 15, 2024", "Contract Term: 2 years"],
          amounts: ["$85,000 annual salary", "$5,000 signing bonus"],
          obligations: ["40 hours/week", "Confidentiality agreement", "Non-compete clause"]
        },
        importantClauses: [
          {
            title: "Non-Compete Clause",
            content: "Employee agrees not to work for competitors within 50 miles for 12 months after termination.",
            importance: "high" as const,
            explanation: "This clause may be overly restrictive and could limit future employment opportunities."
          },
          {
            title: "Intellectual Property",
            content: "All work product created during employment belongs to the company.",
            importance: "high" as const,
            explanation: "Standard IP assignment clause - ensure personal projects are excluded."
          }
        ],
        riskAssessment: {
          highRisk: ["Broad non-compete clause", "Unlimited IP assignment"],
          mediumRisk: ["At-will employment terms", "Limited severance provision"],
          recommendations: ["Negotiate non-compete scope", "Clarify IP exceptions", "Review termination terms"]
        },
        suggestedEdits: [
          {
            section: "Section 5 - Non-Compete",
            current: "within 50 miles for 12 months",
            suggested: "within 25 miles for 6 months",
            reason: "Reduce geographic and time restrictions for enforceability"
          }
        ],
        legalCitations: [
          "California Business and Professions Code Section 16600",
          "Uniform Trade Secrets Act",
          "Restatement (Second) of Contracts § 188"
        ]
      };

      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Document Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your legal document text here for AI analysis..."
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-2">
              <Button onClick={analyzeDocument} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Document'}
              </Button>
              <Button variant="outline" onClick={() => setDocumentText('')}>
                Clear
              </Button>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="clauses">Key Clauses</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="edits">Suggested Edits</TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{analysis.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">Parties</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.keyInformation.parties.map((party, i) => (
                        <Badge key={i} variant="outline">{party}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Important Dates</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.keyInformation.dates.map((date, i) => (
                        <Badge key={i} variant="secondary">{date}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Financial Terms</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysis.keyInformation.amounts.map((amount, i) => (
                        <Badge key={i} variant="outline">{amount}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clauses">
            <div className="space-y-4">
              {analysis.importantClauses.map((clause, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{clause.title}</CardTitle>
                      <Badge variant={clause.importance === 'high' ? 'destructive' : clause.importance === 'medium' ? 'default' : 'secondary'}>
                        {clause.importance} priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm">{clause.content}</p>
                    </div>
                    <p className="text-gray-600 text-sm">{clause.explanation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    High Risk Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskAssessment.highRisk.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Medium Risk Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskAssessment.mediumRisk.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.riskAssessment.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="edits">
            <div className="space-y-4">
              {analysis.suggestedEdits.map((edit, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5" />
                      {edit.section}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Current Text:</h4>
                      <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                        <p className="text-sm">{edit.current}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Suggested Revision:</h4>
                      <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                        <p className="text-sm">{edit.suggested}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Reasoning:</h4>
                      <p className="text-gray-600 text-sm">{edit.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="citations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal Citations & References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.legalCitations.map((citation, i) => (
                    <li key={i} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="text-sm font-mono">{citation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}