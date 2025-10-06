import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Zap, Star } from 'lucide-react';
import DocketChiefPayment from './DocketChiefPayment';
import PaymentSuccess from './PaymentSuccess';
import PaymentCancel from './PaymentCancel';
interface PaymentPlansProps {
  onClose?: () => void;
}

export default function PaymentPlans({ onClose }: PaymentPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    price: number;
    period: string;
  } | null>(null);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'payment' | 'success' | 'cancel'>('plans');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 49.99,
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Full access to legal database',
        'Advanced search & filters',
        'Citation formatting',
        'Case law research',
        'Document management',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'yearly',
      name: 'Annual Plan',
      price: 399,
      period: 'year',
      description: 'Best value - Save $200!',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Custom reports',
        'API access',
        'Bulk operations',
        '2 months free!'
      ],
      popular: true
    }
  ];

  const handleSubscribe = (planId: string, price: number, period: string) => {
    setSelectedPlan({ id: planId, price, period });
    setPaymentStep('payment');
  };

  const handlePaymentSuccess = () => {
    setPaymentStep('success');
  };

  const handlePaymentCancel = () => {
    setPaymentStep('cancel');
  };

  const handleBackToPlans = () => {
    setPaymentStep('plans');
    setSelectedPlan(null);
  };

  if (paymentStep === 'payment' && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <DocketChiefPayment
          planId={selectedPlan.id}
          amount={selectedPlan.price}
          period={selectedPlan.period}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </div>
    );
  }

  if (paymentStep === 'success') {
    return <PaymentSuccess onBackToPlans={handleBackToPlans} />;
  }

  if (paymentStep === 'cancel') {
    return <PaymentCancel onBackToPlans={handleBackToPlans} onRetry={handleBackToPlans} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Legal Research Plan
        </h2>
        <p className="text-lg text-gray-600">
          Access comprehensive legal databases and research tools powered by DocketChief
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">${plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                onClick={() => handleSubscribe(plan.id, plan.price, plan.period)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe with DocketChief
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-center justify-center text-blue-800 mb-2">
            <CreditCard className="h-5 w-5 mr-2" />
            <span className="font-medium">Powered by DocketChief Payment Portal</span>
          </div>
          <p className="text-sm text-blue-700">
            Secure, PCI-compliant payment processing at pay.docketchief.com
          </p>
        </div>

        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-500" />
            SSL Encrypted
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-2 text-blue-500" />
            Instant Access
          </div>
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
            Cancel Anytime
          </div>
        </div>
      </div>

      {onClose && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}