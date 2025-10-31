import React, { useState } from 'react';

interface DocumentEditorProps {
  motionType: string;
  onClose: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  motionType,
  onClose
}) => {
  const [content, setContent] = useState('');
  const [caseTitle, setCaseTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');

  const handleSave = () => {
    console.log('Saving document:', { motionType, caseTitle, caseNumber, content });
    alert('Document saved successfully!');
  };

  const handleGenerate = () => {
    const template = `IN THE UNITED STATES DISTRICT COURT
FOR THE [DISTRICT]

${caseTitle}
                                                Case No. ${caseNumber}

${motionType.toUpperCase()}

TO THE HONORABLE COURT:

COMES NOW [Party Name], by and through undersigned counsel, and respectfully submits this ${motionType} pursuant to Federal Rule of Civil Procedure [Rule Number].

I. INTRODUCTION

[Brief introduction of the motion and relief sought]

II. FACTUAL BACKGROUND

[Relevant facts supporting the motion]

III. LEGAL ARGUMENT

[Legal analysis and authorities]

WHEREFORE, [Party Name] respectfully requests that this Court grant this ${motionType}.

Respectfully submitted,

[Attorney Name]
[Bar Number]
[Firm Name]`;

    setContent(template);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{motionType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="flex-1 flex">
          <div className="w-1/3 p-6 border-r bg-gray-50">
            <h3 className="font-bold mb-4">Case Information</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Case Title"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Case Number"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleGenerate}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Generate Template
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your motion here..."
              className="w-full h-full border rounded p-4 font-mono text-sm resize-none"
            />
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Document
          </button>
        </div>
      </div>
    </div>
  );
};