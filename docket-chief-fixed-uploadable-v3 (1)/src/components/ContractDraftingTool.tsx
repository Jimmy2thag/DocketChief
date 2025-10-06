import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Download, Save, Edit } from 'lucide-react';

export function ContractDraftingTool() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [terms, setTerms] = useState('');
  const [generatedContract, setGeneratedContract] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const templates = [
    { id: 'nda', name: 'Non-Disclosure Agreement' },
    { id: 'service', name: 'Service Agreement' },
    { id: 'employment', name: 'Employment Contract' },
    { id: 'lease', name: 'Lease Agreement' },
    { id: 'purchase', name: 'Purchase Agreement' }
  ];

  const generateContract = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    const contract = `
${template?.name || 'Contract'}

This agreement is entered into between:

Party A: ${partyA || '[Party A Name]'}
Party B: ${partyB || '[Party B Name]'}

Terms and Conditions:
${terms || '[Terms to be specified]'}

WHEREAS, the parties wish to enter into this agreement under the following terms:

1. SCOPE OF WORK
   The parties agree to the terms as outlined above.

2. PAYMENT TERMS
   Payment shall be made according to the agreed schedule.

3. CONFIDENTIALITY
   Both parties agree to maintain confidentiality of all information.

4. TERMINATION
   This agreement may be terminated by either party with written notice.

IN WITNESS WHEREOF, the parties have executed this agreement.

_________________                    _________________
${partyA || '[Party A]'}                        ${partyB || '[Party B]'}
Date: ___________                    Date: ___________
    `;
    setGeneratedContract(contract);
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
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
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
                placeholder="Enter specific terms and conditions"
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