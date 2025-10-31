import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, CreditCard, Clock, CheckCircle } from 'lucide-react';

interface FailedPayment {
  id: string;
  customerId: string;
  customerEmail: string;
  amount: number;
  plan: string;
  failureReason: string;
  attemptCount: number;
  lastAttempt: string;
  nextRetry: string;
  status: 'pending_retry' | 'dunning' | 'cancelled';
}

interface FailedPaymentTrackerProps {
  failedPayments: FailedPayment[];
  totalFailedAmount: number;
  recoveryRate: number;
}

export function FailedPaymentTracker({ 
  failedPayments, 
  totalFailedAmount,
  recoveryRate 
}: FailedPaymentTrackerProps) {
  const handleRetryPayment = (paymentId: string) => {
    console.log('Retrying payment:', paymentId);
    // Implement retry logic
  };

  const handleContactCustomer = (email: string) => {
    console.log('Contacting customer:', email);
    // Implement email notification
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_retry: { variant: 'secondary' as const, label: 'Pending Retry' },
      dunning: { variant: 'destructive' as const, label: 'In Dunning' },
      cancelled: { variant: 'outline' as const, label: 'Cancelled' }
    };
    return variants[status as keyof typeof variants] || variants.pending_retry;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedPayments.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At Risk Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalFailedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total failed amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recoveryRate}%</div>
            <p className="text-xs text-muted-foreground">Successfully recovered</p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Payment Details</CardTitle>
          <CardDescription>Payments requiring retry or customer contact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {failedPayments.map((payment) => (
              <div key={payment.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{payment.customerEmail}</span>
                      <Badge {...getStatusBadge(payment.status)} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payment.plan} Plan - ${payment.amount}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Attempt {payment.attemptCount}/3</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="font-medium">{payment.failureReason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-muted-foreground">Next Retry:</span>
                    <span className="font-medium">{new Date(payment.nextRetry).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRetryPayment(payment.id)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Retry Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleContactCustomer(payment.customerEmail)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Customer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}