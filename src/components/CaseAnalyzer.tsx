import React, { useState } from 'react';

interface CaseData {
  id: string;
  title: string;
  status: string;
  nextDeadline: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

export const CaseAnalyzer: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cases: CaseData[] = [
    {
      id: '2024-CV-001',
      title: 'Smith v. Johnson Corp',
      status: 'Discovery Phase',
      nextDeadline: 'Motion Due: Jan 15, 2025',
      riskLevel: 'Medium',
      recommendations: [
        'File motion to compel discovery responses',
        'Schedule expert witness depositions',
        'Review Rule 26(f) conference requirements'
      ]
    },
    {
      id: '2024-CR-045',
      title: 'United States v. Davis',
      status: 'Pre-trial Motions',
      nextDeadline: 'Suppression Motion: Jan 20, 2025',
      riskLevel: 'High',
      recommendations: [
        'File motion to suppress evidence',
        'Challenge search warrant validity',
        'Review Brady material disclosure'
      ]
    },
    {
      id: '2024-CV-078',
      title: 'ABC Corp v. XYZ Inc',
      status: 'Summary Judgment',
      nextDeadline: 'Response Due: Jan 10, 2025',
      riskLevel: 'Low',
      recommendations: [
        'Prepare summary judgment opposition',
        'Gather additional evidence',
        'Consider cross-motion for summary judgment'
      ]
    }
  ];

  const filteredCases = cases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Analysis Dashboard</h2>
        <input
          type="text"
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredCases.map((case_) => (
            <div
              key={case_.id}
              onClick={() => setSelectedCase(case_)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer border border-gray-200 hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900">{case_.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(case_.riskLevel)}`}>
                  {case_.riskLevel} Risk
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Case: {case_.id}</p>
              <p className="text-sm text-gray-600 mb-2">Status: {case_.status}</p>
              <p className="text-sm font-medium text-red-600">{case_.nextDeadline}</p>
            </div>
          ))}
        </div>

        {selectedCase && (
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-xl font-bold mb-4">{selectedCase.title}</h3>
            <div className="space-y-3 mb-6">
              <p><span className="font-medium">Case ID:</span> {selectedCase.id}</p>
              <p><span className="font-medium">Status:</span> {selectedCase.status}</p>
              <p><span className="font-medium">Next Deadline:</span> {selectedCase.nextDeadline}</p>
              <p>
                <span className="font-medium">Risk Level:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedCase.riskLevel)}`}>
                  {selectedCase.riskLevel}
                </span>
              </p>
            </div>
            
            <h4 className="font-bold mb-3">Strategic Recommendations:</h4>
            <ul className="space-y-2">
              {selectedCase.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};