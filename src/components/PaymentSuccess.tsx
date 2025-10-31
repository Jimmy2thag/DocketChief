import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleDownloadReceipt = () => {
    // Generate receipt download
    const receiptData = {
      date: new Date().toLocaleDateString(),
      amount: '$49.99',
      plan: 'Legal Research Platform - Monthly',
      transactionId: `TXN_${Date.now()}`
    };
    
    const receiptText = `
LEGAL RESEARCH PLATFORM
Payment Receipt

Date: ${receiptData.date}
Amount: ${receiptData.amount}
Plan: ${receiptData.plan}
Transaction ID: ${receiptData.transactionId}

Thank you for your subscription!
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receiptData.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for subscribing to our Legal Research Platform. 
            Your account has been activated and you now have full access to all features.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Access comprehensive legal databases</li>
              <li>• Use advanced search and filters</li>
              <li>• Generate professional citations</li>
              <li>• Manage your legal documents</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownloadReceipt}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <div className="flex items-center justify-center">
              <Mail className="h-3 w-3 mr-1" />
              A confirmation email has been sent to your inbox
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}