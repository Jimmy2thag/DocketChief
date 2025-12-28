import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, FileText, Brain, Edit, Scale } from 'lucide-react';
import { legalAiChat } from '@/lib/aiService';
import { searchCourtListener, CourtListenerResult } from '@/lib/courtListener';
import { useToast } from '@/hooks/use-toast';

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

interface DocumentAnalyzerProps {
  initialDocument?: string;
  onResetSeed?: () => void;
}

const detectParties = (text: string) => {
  const matches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
  return Array.from(new Set(matches)).slice(0, 6);
};

const detectDates = (text: string) => {
  const pattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
  return text.match(pattern)?.slice(0, 6) || [];
};

const detectCurrency = (text: string) => {
  const pattern = /\$\s?\d{1,3}(?:,\d{3})*(?:\.\d+)?/g;
  return text.match(pattern)?.slice(0, 6) || [];
};

const detectObligations = (text: string) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => /(shall|must|agree|will)/i.test(sentence))
    .slice(0, 6);
};

const detectRisks = (text: string) => {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => /(risk|breach|penalty|liability)/i.test(sentence))
    .slice(0, 3);
};

const buildFallbackAnalysis = (text: string): AnalysisResult => {
  const parties = detectParties(text);
  const dates = detectDates(text);
  const amounts = detectCurrency(text);
  const obligations = detectObligations(text);
  const risks = detectRisks(text);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  const summary = sentences.slice(0, 2).join(' ').trim() || 'Summary could not be generated. Review the document manually for details.';

  const importantClauses = obligations.map((sentence, index) => ({
    title: `Obligation ${index + 1}`,
    content: sentence,
    importance: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    explanation: 'Identified automatically because the sentence contains mandatory language such as “shall” or “must”.',
  }));

  const suggestedEdits = [
    !/governing law/i.test(text) && {
      section: 'Governing Law',
      current: 'No governing law clause detected.',
      suggested: 'Add a governing law and jurisdiction clause clarifying which forum controls disputes.',
      reason: 'Ensures predictability and reduces venue disputes.',
    },
    !/termination/i.test(text) && {
      section: 'Termination',
      current: 'No explicit termination rights found.',
      suggested: 'Insert termination rights for both parties including notice periods.',
      reason: 'Clarifies exit mechanics and mitigates breach risk.',
    },
  ].filter(Boolean) as AnalysisResult['suggestedEdits'];

  return {
    summary,
    keyInformation: {
      parties,
      dates,
      amounts,
      obligations,
    },
    importantClauses,
    riskAssessment: {
      highRisk: risks,
      mediumRisk: obligations.filter((_, index) => index >= risks.length).slice(0, 3),
      recommendations: [
        'Confirm that all payment and delivery obligations contain specific timelines.',
        'Document any indemnification responsibilities in writing.',
        'Schedule a follow-up review with stakeholders to validate obligations.',
      ],
    },
    suggestedEdits,
    legalCitations: [],
  };
};

const parseAiJson = (content: string) => {
  const cleaned = content.replace(/```json|```/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw error;
  }
};

export default function DocumentAnalyzer({ initialDocument, onResetSeed }: DocumentAnalyzerProps) {
  const [documentText, setDocumentText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refinedDraft, setRefinedDraft] = useState('');
  const [refineLoading, setRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState('');
  const [supportingCases, setSupportingCases] = useState<CourtListenerResult[]>([]);
  const [fetchingCases, setFetchingCases] = useState(false);
  const [casesError, setCasesError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (initialDocument) {
      setDocumentText(initialDocument);
      setAnalysis(null);
      setError('');
      setNotice('');
      setRefinedDraft('');
      setSupportingCases([]);
      onResetSeed?.();
    }
  }, [initialDocument, onResetSeed]);

  const gatherSupportingCases = async (analysisData: AnalysisResult) => {
    const keywords = [
      analysisData.importantClauses[0]?.title,
      analysisData.keyInformation.obligations[0],
      analysisData.summary,
    ].filter(Boolean) as string[];

    if (keywords.length === 0) {
      setSupportingCases([]);
      return;
    }

    setFetchingCases(true);
    setCasesError('');

    try {
      const results = await searchCourtListener(keywords[0]!.slice(0, 120), { limit: 3 });
      setSupportingCases(results);
    } catch (err) {
      console.error('Failed to fetch CourtListener cases', err);
      setCasesError(err instanceof Error ? err.message : 'Failed to fetch supporting authority');
      setSupportingCases([]);
    } finally {
      setFetchingCases(false);
    }
  };

  const analyzeDocument = async () => {
    if (!documentText.trim()) {
      setError('Please enter document text to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    setAnalysis(null);
    setSupportingCases([]);
    setRefinedDraft('');

    try {
      const { content } = await legalAiChat({
        system: 'You are an AI legal assistant that extracts structured insights from legal documents. Always respond with valid JSON that matches the AnalysisResult TypeScript type with snake_case keys converted to camelCase. Arrays must always be arrays even if empty.',
        messages: [
          {
            role: 'user',
            content: `Analyze the following legal document and return JSON matching this schema:
{
  "summary": string,
  "keyInformation": {
    "parties": string[],
    "dates": string[],
    "amounts": string[],
    "obligations": string[]
  },
  "importantClauses": Array<{
    "title": string,
    "content": string,
    "importance": "high" | "medium" | "low",
    "explanation": string
  }>,
  "riskAssessment": {
    "highRisk": string[],
    "mediumRisk": string[],
    "recommendations": string[]
  },
  "suggestedEdits": Array<{
    "section": string,
    "current": string,
    "suggested": string,
    "reason": string
  }>,
  "legalCitations": string[]
}

Document:
"""${documentText}"""`,
          },
        ],
      });

      let parsed;
      try {
        parsed = parseAiJson(content);
      } catch (parseError) {
        console.warn('AI response was not valid JSON. Falling back to heuristics.', parseError);
        const fallback = buildFallbackAnalysis(documentText);
        setAnalysis(fallback);
        setNotice('AI response could not be parsed. Displaying heuristic analysis.');
        await gatherSupportingCases(fallback);
        return;
      }

      const normalizeArray = (value: unknown): string[] => {
        if (Array.isArray(value)) {
          return value.map(String).filter(Boolean);
        }
        if (!value) return [];
        return [String(value)];
      };

      const normalized: AnalysisResult = {
        summary: parsed.summary || 'No summary available.',
        keyInformation: {
          parties: normalizeArray(parsed.keyInformation?.parties),
          dates: normalizeArray(parsed.keyInformation?.dates),
          amounts: normalizeArray(parsed.keyInformation?.amounts),
          obligations: normalizeArray(parsed.keyInformation?.obligations),
        },
        importantClauses: Array.isArray(parsed.importantClauses)
          ? parsed.importantClauses.map((clause: { title?: string; content?: string; importance?: string; explanation?: string }) => ({
              title: clause?.title || 'Untitled Clause',
              content: clause?.content || 'No clause content provided.',
              importance: clause?.importance === 'low' || clause?.importance === 'medium' ? clause.importance as 'low' | 'medium' : 'high',
              explanation: clause?.explanation || 'No explanation provided.',
            }))
          : [],
        riskAssessment: {
          highRisk: normalizeArray(parsed.riskAssessment?.highRisk),
          mediumRisk: normalizeArray(parsed.riskAssessment?.mediumRisk),
          recommendations: normalizeArray(parsed.riskAssessment?.recommendations),
        },
        suggestedEdits: Array.isArray(parsed.suggestedEdits)
          ? parsed.suggestedEdits.map((edit: { section?: string; current?: string; suggested?: string; reason?: string }) => ({
              section: edit?.section || 'Unspecified Section',
              current: edit?.current || 'No current text provided.',
              suggested: edit?.suggested || 'No suggestion provided.',
              reason: edit?.reason || 'No reasoning provided.',
            }))
          : [],
        legalCitations: normalizeArray(parsed.legalCitations),
      };

      setAnalysis(normalized);
      await gatherSupportingCases(normalized);
    } catch (err) {
      console.error('Document analysis failed', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(errorMessage);
      
      if (documentText) {
        const fallback = buildFallbackAnalysis(documentText);
        setAnalysis(fallback);
        
        // Provide more helpful notice based on the error
        if (errorMessage.includes('not deployed')) {
          setNotice('⚠️ Edge function not deployed. Contact admin to deploy legal-ai-chat function. Showing local analysis.');
        } else if (errorMessage.includes('CORS')) {
          setNotice('⚠️ CORS configuration issue. Check edge function settings. Showing local analysis.');
        } else if (errorMessage.includes('Authentication')) {
          setNotice('⚠️ Authentication issue. Check Supabase configuration. Showing local analysis.');
        } else {
          setNotice('⚠️ AI service unavailable. Showing local heuristic analysis.');
        }
        
        await gatherSupportingCases(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const refineDocument = async () => {
    if (!documentText.trim()) {
      setRefineError('Provide a document before requesting a refined draft.');
      return;
    }

    setRefineError('');
    setRefineLoading(true);
    try {
      const messages = [
        {
          role: 'user' as const,
          content: `Please refine the following legal document. Focus on clarity, risk mitigation, and compliance with procedural rules.\n\nDocument:\n"""${documentText}"""`,
        },
      ];

      if (analysis) {
        messages.push({
          role: 'assistant' as const,
          content: `Context about the document: ${JSON.stringify(analysis)}`,
        });
      }

      const { content } = await legalAiChat({
        system:
          'You are a senior legal editor. Rewrite the provided document for clarity, ensure obligations comply with relevant rules of civil procedure, and highlight suggested improvements in Markdown. Include a short “Key Changes” bullet list followed by the revised draft.',
        messages,
      });

      setRefinedDraft(content.trim());
      toast({ title: 'Document refined', description: 'A revised draft has been generated below.' });
    } catch (err) {
      console.error('Document refinement failed', err);
      setRefineError(err instanceof Error ? err.message : 'Unable to refine the document.');
    } finally {
      setRefineLoading(false);
    }
  };

  const copyRefinedDraft = () => {
    if (!refinedDraft) return;
    navigator.clipboard.writeText(refinedDraft);
    toast({ title: 'Copied', description: 'Refined draft copied to clipboard.' });
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
              <Button onClick={refineDocument} variant="secondary" disabled={refineLoading || loading}>
                {refineLoading ? 'Refining...' : 'Refine Draft'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDocumentText('');
                  setAnalysis(null);
                  setError('');
                  setNotice('');
                  setRefinedDraft('');
                  setSupportingCases([]);
                  setCasesError('');
                  setRefineError('');
                }}
              >
                Clear
              </Button>
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            {notice && (
              <div className="text-amber-600 text-sm">{notice}</div>
            )}
            {refineError && (
              <div className="text-red-600 text-sm">{refineError}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {refinedDraft && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Refined Document Draft
              </span>
              <Button size="sm" variant="outline" onClick={copyRefinedDraft}>
                Copy Refined Draft
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded border font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
              {refinedDraft}
            </div>
          </CardContent>
        </Card>
      )}

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
                {fetchingCases && (
                  <div className="text-sm text-gray-500 mt-4">Retrieving recent authorities from CourtListener...</div>
                )}
                {casesError && (
                  <div className="text-sm text-red-600 mt-4">{casesError}</div>
                )}
                {supportingCases.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">Recent authorities from CourtListener</h4>
                    <ul className="space-y-3">
                      {supportingCases.map((item) => (
                        <li key={item.id} className="p-3 rounded border bg-white shadow-sm">
                          <div className="text-sm font-semibold text-blue-700">
                            <a href={`https://www.courtlistener.com${item.absolute_url}`} target="_blank" rel="noreferrer" className="hover:underline">
                              {item.caseName}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500">{item.court} · {item.date_filed || 'Date unavailable'}</div>
                          {item.citation.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">{item.citation.join(', ')}</div>
                          )}
                          {item.snippet && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-3">{item.snippet}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
