import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Search, Scale, BookOpen, Brain } from 'lucide-react';

interface CaseData {
  id: string;
  case_name: string;
  citation: string;
  court: string;
  jurisdiction: string;
  court_level: string;
  decision_date: string;
  legal_issues: string[];
  key_holdings: string[];
  case_summary: string;
  outcome: string;
  precedential_value: string;
  distinguishing_factors: string[];
  strategic_implications: string[];
}

export default function CaseLawDatabase() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [courtLevel, setCourtLevel] = useState('');
  const [outcome, setOutcome] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      let query = supabase.from('case_law').select('*');
      
      if (searchQuery) {
        query = query.or(`case_name.ilike.%${searchQuery}%,legal_issues.cs.{${searchQuery}}`);
      }
      if (jurisdiction) query = query.eq('jurisdiction', jurisdiction);
      if (courtLevel) query = query.eq('court_level', courtLevel);
      if (outcome) query = query.eq('outcome', outcome);

      const { data, error } = await query.order('decision_date', { ascending: false });
      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const analyzeSearch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('case-law-analysis', {
        body: { query: searchQuery, jurisdiction, courtLevel, outcome }
      });
      
      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Case Law Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Search cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={jurisdiction} onValueChange={setJurisdiction}>
              <SelectTrigger>
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Federal">Federal</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="California">California</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courtLevel} onValueChange={setCourtLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Court Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="supreme">Supreme</SelectItem>
                <SelectItem value="appellate">Appellate</SelectItem>
                <SelectItem value="district">District</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="plaintiff">Plaintiff</SelectItem>
                <SelectItem value="defendant">Defendant</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchCases} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Cases
            </Button>
            <Button onClick={analyzeSearch} disabled={loading} variant="outline" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>AI Strategic Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={analysis} readOnly className="min-h-[200px]" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {cases.map((case_) => (
          <Card key={case_.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{case_.case_name}</CardTitle>
                  <p className="text-sm text-gray-600">{case_.citation} • {case_.court}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={case_.outcome === 'plaintiff' ? 'default' : 'secondary'}>
                    {case_.outcome}
                  </Badge>
                  <Badge variant={case_.precedential_value === 'binding' ? 'destructive' : 'outline'}>
                    {case_.precedential_value}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{case_.case_summary}</p>
              <div>
                <h4 className="font-medium mb-2">Legal Issues:</h4>
                <div className="flex flex-wrap gap-1">
                  {case_.legal_issues.map((issue, i) => (
                    <Badge key={i} variant="outline">{issue}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Holdings:</h4>
                <ul className="text-sm space-y-1">
                  {case_.key_holdings.map((holding, i) => (
                    <li key={i}>• {holding}</li>
                  ))}
                </ul>
              </div>
              {case_.strategic_implications && case_.strategic_implications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Strategic Implications:</h4>
                  <ul className="text-sm space-y-1">
                    {case_.strategic_implications.map((implication, i) => (
                      <li key={i}>• {implication}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}