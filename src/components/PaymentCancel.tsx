import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCancel() {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    navigate('/pricing');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Why Subscribe?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Access to comprehensive legal databases</li>
              <li>• Advanced search with filters</li>
              <li>• Professional citation formatting</li>
              <li>• Document management tools</li>
              <li>• Priority customer support</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={handleRetryPayment} className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            <p>Need help? Contact our support team at support@legalresearch.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}