import React, { useState } from 'react';
import { MessageSquare, Lightbulb, Shield, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface RebuttalAnalysis {
  weaknesses: string[];
  counter_arguments: string[];
  supporting_law: string[];
  strategic_recommendations: string[];
  evidence_suggestions: string[];
}

const RebuttalAssistant: React.FC = () => {
  const [opponentArgument, setOpponentArgument] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [caseType, setCaseType] = useState('');
  const [rebuttalAnalysis, setRebuttalAnalysis] = useState<RebuttalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!opponentArgument.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter the opponent's argument to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('legal-research', {
        body: {
          query: `rebuttal analysis for: ${opponentArgument}`,
          state: jurisdiction || 'all',
          category: caseType || 'all'
        }
      });

      if (error) throw error;

      if (data.success) {
        // Parse the AI analysis into structured rebuttal components
        const analysis = data.analysis;
        
        // Extract different sections from the analysis
        const weaknesses = extractSection(analysis, 'weakness', 'flaw', 'problem');
        const counterArgs = extractSection(analysis, 'counter', 'argument', 'response');
        const supportingLaw = extractSection(analysis, 'law', 'rule', 'precedent', 'statute');
        const strategies = extractSection(analysis, 'strategy', 'recommend', 'approach');
        const evidence = extractSection(analysis, 'evidence', 'proof', 'document', 'witness');

        setRebuttalAnalysis({
          weaknesses,
          counter_arguments: counterArgs,
          supporting_law: supportingLaw,
          strategic_recommendations: strategies,
          evidence_suggestions: evidence
        });

        toast({
          title: "Analysis Complete",
          description: "Rebuttal strategy has been generated."
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Rebuttal analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze argument. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractSection = (text: string, ...keywords: string[]): string[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences
      .filter(sentence => 
        keywords.some(keyword => 
          sentence.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .map(s => s.trim())
      .slice(0, 4); // Limit to 4 items per section
  };

  return (
    <div className="space-y-6">
      {/* Input Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rebuttal Assistant
          </CardTitle>
          <CardDescription>
            Analyze opponent arguments and generate strategic rebuttals with supporting law
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Opponent's Argument</label>
            <Textarea
              placeholder="Paste the opponent's argument, motion, or legal position here..."
              value={opponentArgument}
              onChange={(e) => setOpponentArgument(e.target.value)}
              rows={12}
              className="resize-y min-h-[300px] max-h-[600px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Jurisdiction (Optional)</label>
              <input
                type="text"
                placeholder="e.g., CA, NY, Federal"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Case Type (Optional)</label>
              <input
                type="text"
                placeholder="e.g., civil_procedure, evidence"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            {isAnalyzing ? 'Analyzing Argument...' : 'Generate Rebuttal Strategy'}
          </Button>
        </CardContent>
      </Card>

      {/* Rebuttal Analysis Results */}
      {rebuttalAnalysis && (
        <Tabs defaultValue="weaknesses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
            <TabsTrigger value="counter">Counter-Args</TabsTrigger>
            <TabsTrigger value="law">Supporting Law</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          <TabsContent value="weaknesses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Target className="h-5 w-5" />
                  Argument Weaknesses
                </CardTitle>
                <CardDescription>
                  Identified flaws and vulnerabilities in the opponent's position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebuttalAnalysis.weaknesses.length > 0 ? (
                    rebuttalAnalysis.weaknesses.map((weakness, index) => (
                      <div key={index} className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                        <p className="text-sm">{weakness}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specific weaknesses identified in the analysis.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="counter">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                  Counter-Arguments
                </CardTitle>
                <CardDescription>
                  Direct responses to challenge the opponent's claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebuttalAnalysis.counter_arguments.length > 0 ? (
                    rebuttalAnalysis.counter_arguments.map((counter, index) => (
                      <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm">{counter}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specific counter-arguments generated.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="law">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  Supporting Law
                </CardTitle>
                <CardDescription>
                  Legal authorities and precedents to support your position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebuttalAnalysis.supporting_law.length > 0 ? (
                    rebuttalAnalysis.supporting_law.map((law, index) => (
                      <div key={index} className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                        <p className="text-sm">{law}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specific legal authorities identified.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Lightbulb className="h-5 w-5" />
                  Strategic Recommendations
                </CardTitle>
                <CardDescription>
                  Tactical approaches for your rebuttal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebuttalAnalysis.strategic_recommendations.length > 0 ? (
                    rebuttalAnalysis.strategic_recommendations.map((strategy, index) => (
                      <div key={index} className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                        <p className="text-sm">{strategy}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specific strategic recommendations provided.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Target className="h-5 w-5" />
                  Evidence Suggestions
                </CardTitle>
                <CardDescription>
                  Types of evidence that could strengthen your position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebuttalAnalysis.evidence_suggestions.length > 0 ? (
                    rebuttalAnalysis.evidence_suggestions.map((evidence, index) => (
                      <div key={index} className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                        <p className="text-sm">{evidence}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No specific evidence suggestions provided.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RebuttalAssistant;