import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface Subscription {
  id: string;
  planName: string;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
}

interface SubscriptionManagerProps {
  subscription: Subscription | null;
  onUpgrade: () => void;
  onCancel: () => void;
  onReactivate: () => void;
}

export function SubscriptionManager({
  subscription,
  onUpgrade,
  onCancel,
  onReactivate
}: SubscriptionManagerProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!subscription) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
            <p className="text-muted-foreground mb-4">
              Subscribe to a plan to access premium features
            </p>
            <Button onClick={onUpgrade}>View Plans</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysUntilRenewal = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Details</CardTitle>
            <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
              {subscription.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-xl font-semibold">{subscription.planName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-xl font-semibold">${subscription.amount.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Billing Cycle</p>
              <p className="text-sm font-medium">{daysUntilRenewal} days remaining</p>
            </div>
            <Progress value={(daysUntilRenewal / 30) * 100} />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will be cancelled on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={onUpgrade} className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
            {subscription.cancelAtPeriodEnd ? (
              <Button onClick={onReactivate} variant="outline" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
            ) : (
              <Button
                onClick={() => setShowCancelConfirm(true)}
                variant="outline"
                className="flex-1"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showCancelConfirm && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Are you sure you want to cancel?</p>
            <p className="text-sm mb-4">
              You'll lose access to premium features at the end of your billing period.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  onCancel();
                  setShowCancelConfirm(false);
                }}
              >
                Confirm Cancellation
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Subscription
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}