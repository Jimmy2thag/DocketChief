import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Crown,
  Zap
} from 'lucide-react';
import { BillingHistory } from './BillingHistory';
import { PaymentMethods } from './PaymentMethods';
import { PlanUpgrade } from './PlanUpgrade';

interface Subscription {
  id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  amount: number;
  currency: string;
}

export const SubscriptionDashboard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_123456789',
    plan: 'monthly',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-02-01',
    cancelAtPeriodEnd: false,
    autoRenew: true,
    amount: 49.99,
    currency: 'USD'
  });

  const [loading, setLoading] = useState(false);

  const handleAutoRenewToggle = async (enabled: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscription(prev => ({ ...prev, autoRenew: enabled }));
    } catch (error) {
      console.error('Failed to update auto-renewal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true, autoRenew: false }));
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' },
      past_due: { variant: 'destructive' as const, icon: AlertTriangle, text: 'Past Due' },
      trialing: { variant: 'secondary' as const, icon: Zap, text: 'Trial' }
    };
    
    const config = variants[status as keyof typeof variants];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your legal research platform subscription</p>
        </div>
        {subscription.plan === 'monthly' && (
          <Button variant="outline" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Annual
          </Button>
        )}
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan
            {getStatusBadge(subscription.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">${subscription.amount}/{subscription.plan === 'monthly' ? 'month' : 'year'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Next Billing</p>
                <p className="font-semibold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Auto Renewal</p>
                <Switch 
                  checked={subscription.autoRenew} 
                  onCheckedChange={handleAutoRenewToggle}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be cancelled on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. 
                You'll retain access until then.
              </AlertDescription>
            </Alert>
          )}

          {subscription.status === 'past_due' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your payment is past due. Please update your payment method to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2 pt-4">
            {!subscription.cancelAtPeriodEnd && (
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="plans">Plans & Upgrades</TabsTrigger>
        </TabsList>

        <TabsContent value="billing">
          <BillingHistory />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="plans">
          <PlanUpgrade currentPlan={subscription.plan} />
        </TabsContent>
      </Tabs>
    </div>
  );
};