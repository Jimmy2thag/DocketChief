import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, ExternalLink, Shield, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocketChiefPaymentProps {
  planId: string;
  amount: number;
  period: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DocketChiefPayment({ planId, amount, period, onSuccess, onCancel }: DocketChiefPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRedirectToPayment = () => {
    setLoading(true);
    
    // Create payment URL with parameters
    const paymentParams = new URLSearchParams({
      plan: planId,
      amount: amount.toString(),
      period: period,
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      company: customerInfo.company
    });

    const paymentUrl = `https://pay.docketchief.com?${paymentParams.toString()}`;
    
    toast({
      title: "Redirecting to Payment",
      description: "You'll be redirected to our secure payment portal.",
    });

    // Redirect to DocketChief payment portal
    window.location.href = paymentUrl;
  };

  const handleEmbeddedPayment = () => {
    setLoading(true);
    
    // Open payment in new window/tab
    const paymentParams = new URLSearchParams({
      plan: planId,
      amount: amount.toString(),
      period: period,
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      lastName: customerInfo.lastName,
      company: customerInfo.company,
      embedded: 'true'
    });

    const paymentUrl = `https://pay.docketchief.com?${paymentParams.toString()}`;
    
    const paymentWindow = window.open(
      paymentUrl,
      'DocketChiefPayment',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    // Listen for payment completion
    const checkPayment = setInterval(() => {
      try {
        if (paymentWindow?.closed) {
          clearInterval(checkPayment);
          setLoading(false);
          // Check if payment was successful (you might want to verify this with your backend)
          toast({
            title: "Payment Window Closed",
            description: "Please check your email for payment confirmation.",
          });
        }
      } catch (error) {
        console.error('Error checking payment window:', error);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkPayment);
      setLoading(false);
    }, 300000); // 5 minutes timeout
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          DocketChief Payment Portal
        </CardTitle>
        <div className="text-sm text-gray-600">
          ${amount} / {period} - Legal Research Platform
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-800 mb-2">
            <Shield className="h-4 w-4 mr-2" />
            <span className="font-medium">Secure Payment Processing</span>
          </div>
          <p className="text-sm text-blue-700">
            Your payment will be processed securely through DocketChief's payment portal.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={customerInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={customerInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company/Law Firm</Label>
            <Input
              id="company"
              value={customerInfo.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-1">Payment Summary</div>
          <div className="text-lg font-bold text-gray-900">${amount} / {period}</div>
          <div className="text-sm text-gray-600">Legal Research Platform Subscription</div>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Lock className="h-4 w-4 mr-2 text-green-500" />
          <Shield className="h-4 w-4 mr-2 text-green-500" />
          SSL Encrypted & PCI Compliant
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleRedirectToPayment}
            disabled={loading || !customerInfo.email || !customerInfo.firstName || !customerInfo.lastName}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                Continue to Payment Portal
              </>
            )}
          </Button>

          <Button 
            variant="outline"
            onClick={handleEmbeddedPayment}
            disabled={loading || !customerInfo.email || !customerInfo.firstName || !customerInfo.lastName}
            className="w-full"
          >
            Open Payment in New Window
          </Button>

          <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  );
}