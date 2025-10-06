import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Check, 
  Zap, 
  Users, 
  Database, 
  Shield, 
  Clock,
  TrendingUp,
  Star,
  ArrowRight
} from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  savings?: string;
}

interface PlanUpgradeProps {
  currentPlan: 'monthly' | 'yearly';
}

export const PlanUpgrade: React.FC<PlanUpgradeProps> = ({ currentPlan }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 49.99,
      period: 'month',
      description: 'Perfect for getting started with legal research',
      features: [
        { name: 'Unlimited case law searches', included: true },
        { name: 'Document analysis', included: true },
        { name: 'Basic AI research assistant', included: true },
        { name: 'Email support', included: true },
        { name: 'Cloud storage', included: true, limit: '10GB' },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false },
        { name: 'Custom integrations', included: false }
      ]
    },
    {
      id: 'yearly',
      name: 'Annual Plan',
      price: 399,
      period: 'year',
      description: 'Best value for serious legal professionals',
      popular: true,
      savings: 'Save $200/year',
      features: [
        { name: 'Unlimited case law searches', included: true },
        { name: 'Document analysis', included: true },
        { name: 'Advanced AI research assistant', included: true },
        { name: 'Priority email & phone support', included: true },
        { name: 'Cloud storage', included: true, limit: '100GB' },
        { name: 'Advanced analytics & reporting', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'White-label options', included: true }
      ]
    }
  ];

  const handlePlanChange = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (planId === 'yearly' && currentPlan === 'monthly') {
        // Upgrade to yearly
        console.log('Upgrading to yearly plan');
      } else if (planId === 'monthly' && currentPlan === 'yearly') {
        // Downgrade to monthly
        console.log('Downgrading to monthly plan');
      }
      
      // In real implementation, redirect to payment page or show success
      alert(`Plan change to ${planId} initiated successfully!`);
      
    } catch (error) {
      console.error('Failed to change plan:', error);
      alert('Failed to change plan. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const calculateSavings = () => {
    const monthlyTotal = 49.99 * 12;
    const yearlyTotal = 399;
    return monthlyTotal - yearlyTotal;
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Alert */}
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          You're currently on the <strong>{currentPlan === 'monthly' ? 'Monthly' : 'Annual'}</strong> plan. 
          {currentPlan === 'monthly' && ` Upgrade to Annual and save $${calculateSavings().toFixed(2)} per year!`}
        </AlertDescription>
      </Alert>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-4xl font-bold">
                  ${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {plan.savings}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''}`}>
                      {feature.name}
                      {feature.limit && (
                        <span className="text-muted-foreground ml-1">({feature.limit})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                variant={currentPlan === plan.id ? 'secondary' : 'default'}
                disabled={currentPlan === plan.id || loading}
                onClick={() => handlePlanChange(plan.id)}
              >
                {loading && selectedPlan === plan.id ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.id ? (
                  'Current Plan'
                ) : currentPlan === 'monthly' && plan.id === 'yearly' ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </>
                ) : (
                  <>
                    Change to {plan.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Upgrade to Annual?</CardTitle>
          <CardDescription>Get more value with our annual subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold">Save Money</h4>
                <p className="text-sm text-muted-foreground">
                  Save ${calculateSavings().toFixed(2)} compared to monthly billing
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Zap className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold">Premium Features</h4>
                <p className="text-sm text-muted-foreground">
                  Access advanced analytics and priority support
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-semibold">Price Protection</h4>
                <p className="text-sm text-muted-foreground">
                  Lock in current pricing for a full year
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Downgrade Warning */}
      {currentPlan === 'yearly' && (
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> Downgrading to monthly will take effect at the end of your current billing period. 
            You'll lose access to premium features but keep all your data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};