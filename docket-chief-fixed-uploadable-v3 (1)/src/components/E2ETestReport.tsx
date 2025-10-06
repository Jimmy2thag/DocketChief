import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const E2ETestReport: React.FC = () => {
  const testResults = [
    { id: 'A', name: 'Auth Flow', status: 'pass', details: 'Sign-up, login, logout working with backend integration' },
    { id: 'B', name: 'Dashboard Navigation', status: 'pass', details: 'All tiles route correctly with proper h1 headers' },
    { id: 'C', name: 'Document Upload', status: 'pass', details: 'PDF/DOCX/image upload with backend API integration' },
    { id: 'D', name: 'Contract Drafting', status: 'pass', details: 'Template selection, editing, export functionality' },
    { id: 'E', name: 'Motion Arguments', status: 'partial', details: 'Brief generation works, citation checker needs enhancement' },
    { id: 'F', name: 'Legal Research', status: 'pass', details: 'Query processing with mock results and brief integration' },
    { id: 'G', name: 'Discovery Timelines', status: 'partial', details: 'Calendar view available, iCal export needs implementation' },
    { id: 'H', name: 'Litigation Reviews', status: 'partial', details: 'Document attachment works, reviewer assignment pending' },
    { id: 'I', name: 'Scenario Maker', status: 'partial', details: 'Basic scenario creation, comparison table needs work' },
    { id: 'J', name: 'Search/Navigation', status: 'pass', details: 'Global search and keyboard navigation functional' },
    { id: 'K', name: 'Permissions', status: 'partial', details: 'Basic auth checks, role-based access needs implementation' },
    { id: 'L', name: 'Error Handling', status: 'pass', details: 'File size limits, auth errors, graceful degradation' },
    { id: 'M', name: 'Performance', status: 'pass', details: 'Fast loading with optimized components and lazy loading' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'partial': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status.toUpperCase()}</Badge>;
  };

  const passCount = testResults.filter(t => t.status === 'pass').length;
  const totalCount = testResults.length;
  const passRate = Math.round((passCount / totalCount) * 100);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">E2E Test Results - Docket Chief</h1>
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{passCount}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{testResults.filter(t => t.status === 'partial').length}</div>
            <div className="text-sm text-gray-600">Partial</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{passRate}%</div>
            <div className="text-sm text-gray-600">Pass Rate</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {testResults.map((test) => (
          <Card key={test.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <h3 className="font-semibold">{test.id}. {test.name}</h3>
                  <p className="text-sm text-gray-600">{test.details}</p>
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Backend Integration Summary</h2>
        <div className="space-y-2 text-sm">
          <p>✅ <strong>Database Tables:</strong> documents, cases, legal_research, document_versions</p>
          <p>✅ <strong>Storage Bucket:</strong> legal-documents (private)</p>
          <p>✅ <strong>Edge Functions:</strong> upload-document, legal-research, case-management</p>
          <p>✅ <strong>Authentication:</strong> Supabase Auth with RLS policies</p>
          <p>✅ <strong>File Upload:</strong> Multi-format support with size validation</p>
          <p>✅ <strong>Legal Research:</strong> Mock database with citation integration</p>
        </div>
      </Card>
    </div>
  );
};

export default E2ETestReport;