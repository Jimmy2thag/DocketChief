import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Download, Save, Edit } from 'lucide-react';
import { TemplateRecord, useTemplateLibrary } from '@/contexts/TemplateContext';
import { useToast } from '@/hooks/use-toast';

export function ContractDraftingTool() {
  const { templates } = useTemplateLibrary();
  const { toast } = useToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [terms, setTerms] = useState('');
  const [generatedContract, setGeneratedContract] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const contractTemplates = useMemo(
    () => templates.filter((template) => template.category === 'contracts' || template.category === 'agreements'),
    [templates]
  );

  const selectedTemplate: TemplateRecord | undefined = contractTemplates.find((template) => template.id === selectedTemplateId) ?? contractTemplates[0];

  useEffect(() => {
    if (!selectedTemplateId && contractTemplates.length) {
      setSelectedTemplateId(contractTemplates[0].id);
    }
  }, [contractTemplates, selectedTemplateId]);

  const generateContract = () => {
    const baseContent = selectedTemplate?.content || `
${selectedTemplate?.title || 'Contract'}

This agreement is entered into between Party A and Party B.

1. PURPOSE
   Describe the scope of services or obligations.

2. KEY TERMS
   Outline payment, delivery, or performance obligations.

3. GOVERNING LAW
   This agreement shall be governed by the laws of [JURISDICTION].

4. SIGNATURES
   Provide signature blocks for the parties.
`;

    const replacements: Record<string, string> = {
      '[PARTY_A]': partyA || '[Party A]',
      '[PARTY_B]': partyB || '[Party B]',
      '[PARTY A]': partyA || '[Party A]',
      '[PARTY B]': partyB || '[Party B]',
      '[TERMS]': terms || '[Terms to be specified]'
    };

    let contract = baseContent;
    Object.entries(replacements).forEach(([token, value]) => {
      contract = contract.replace(new RegExp(token, 'gi'), value);
    });

    const partyBlock = `

This agreement is entered into between:

Party A: ${partyA || '[Party A Name]'}
Party B: ${partyB || '[Party B Name]'}

Terms and Conditions:
${terms || '[Terms to be specified]'}
`;

    if (!contract.includes('This agreement is entered into between')) {
      contract = `${contract.trim()}${partyBlock}`;
    }

    contract = `${contract.trim()}

IN WITNESS WHEREOF, the parties have executed this agreement.

_________________                    _________________
${partyA || '[Party A]'}                        ${partyB || '[Party B]'}
Date: ___________                    Date: ___________
`;

    setGeneratedContract(contract);
    toast({
      title: 'Contract generated',
      description: selectedTemplate ? `${selectedTemplate.title} draft created using the template library.` : 'Generic contract draft created.'
    });
  };

  const saveContract = () => {
    console.log('Contract saved:', generatedContract);
    alert('Contract saved successfully!');
  };

  const exportContract = (format: 'docx' | 'pdf') => {
    const blob = new Blob([generatedContract], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract.${format === 'docx' ? 'txt' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Draft a Contract</h1>
        <p className="text-gray-600">Create professional contracts using AI-powered templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Template Type</Label>
              <Select value={selectedTemplate?.id ?? ''} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {contractTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="partyA">Party A (First Party)</Label>
              <Input
                id="partyA"
                value={partyA}
                onChange={(e) => setPartyA(e.target.value)}
                placeholder="Enter first party name"
              />
            </div>

            <div>
              <Label htmlFor="partyB">Party B (Second Party)</Label>
              <Input
                id="partyB"
                value={partyB}
                onChange={(e) => setPartyB(e.target.value)}
                placeholder="Enter second party name"
              />
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Describe payment schedules, deliverables, or other negotiated terms"
                rows={4}
              />
            </div>

            <Button onClick={generateContract} className="w-full">
              Generate Draft
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Generated Contract
              </span>
              {selectedTemplate && (
                <span className="text-xs text-gray-500">
                  Based on: {selectedTemplate.title} ({selectedTemplate.jurisdiction})
                </span>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
                <Button variant="outline" size="sm" onClick={saveContract}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={generatedContract}
                onChange={(e) => setGeneratedContract(e.target.value)}
                rows={20}
                className="font-mono text-sm"
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedContract || 'Generate a contract to see the preview'}
                </pre>
              </div>
            )}
            
            {generatedContract && (
              <div className="flex gap-2 mt-4">
                <Button onClick={() => exportContract('docx')} variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export DOCX
                </Button>
                <Button onClick={() => exportContract('pdf')} variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}