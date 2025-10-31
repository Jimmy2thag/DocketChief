import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Shield, CheckCircle, AlertCircle, Loader2, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { StripeCheckout } from './StripeCheckout';
import { PaymentMethodsManager } from './PaymentMethodsManager';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic',
    price: 49.99,
    interval: 'month',
    stripePriceId: 'price_basic_monthly',
    features: [
      'Legal research tools',
      'Document management',
      'Basic AI assistance',
      'Email support'
    ]
  },
  {
    id: 'professional-monthly',
    name: 'Professional',
    price: 99.99,
    interval: 'month',
    popular: true,
    stripePriceId: 'price_pro_monthly',
    features: [
      'All Basic features',
      'Advanced AI research',
      'Unlimited document storage',
      'Priority support',
      'Team collaboration'
    ]
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise',
    price: 199.99,
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly',
    features: [
      'All Professional features',
      'Custom integrations',
      'Dedicated account manager',
      'Advanced analytics',
      'White-label options'
    ]
  }
];

export function PaymentPortal() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadPaymentMethods();
    loadCurrentSubscription();
  }, []);

  const loadPaymentMethods = async () => {
    // Simulate loading payment methods
    setPaymentMethods([
      {
        id: '1',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true
      }
    ]);
  };

  const loadCurrentSubscription = async () => {
    // Simulate loading current subscription
    setCurrentSubscription('professional-monthly');
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      setError('Please log in to subscribe');
      return;
    }
    setSelectedPlan(plan);
    setShowCheckout(true);
    setError('');
  };

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    try {
      // Simulate subscription activation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedPlan) {
        setCurrentSubscription(selectedPlan.id);
        setSuccess(`Successfully subscribed to ${selectedPlan.name} plan!`);
      }
      setShowCheckout(false);
      setSelectedPlan(null);
    } catch (err) {
      setError('Failed to activate subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
    setSuccess('Payment method added successfully!');
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    setSuccess('Payment method removed');
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    setSuccess('Default payment method updated');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentSubscription('');
      setSuccess('Subscription cancelled successfully');
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (showCheckout && selectedPlan) {
    return (
      <div className="max-w-2xl mx-auto">
        <StripeCheckout
          amount={selectedPlan.price}
          planName={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
          onCancel={() => {
            setShowCheckout(false);
            setSelectedPlan(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {currentSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {subscriptionPlans.find(p => p.id === currentSubscription)?.name} Plan
                    </h3>
                    <p className="text-muted-foreground">
                      ${subscriptionPlans.find(p => p.id === currentSubscription)?.price}/month
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Subscription'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? 'border-primary shadow-lg' : ''
                } ${currentSubscription === plan.id ? 'bg-muted' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <CardTitle className="text-center">{plan.name}</CardTitle>
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.interval}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentSubscription === plan.id}
                  >
                    {currentSubscription === plan.id ? 'Current Plan' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods">
          <PaymentMethodsManager
            methods={paymentMethods}
            onAdd={handleAddPaymentMethod}
            onRemove={handleRemovePaymentMethod}
            onSetDefault={handleSetDefaultPaymentMethod}
          />
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2025-10-01', amount: 99.99, status: 'paid' },
                  { date: '2025-09-01', amount: 99.99, status: 'paid' },
                  { date: '2025-08-01', amount: 99.99, status: 'paid' }
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{invoice.date}</div>
                      </div>
                    </div>
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
