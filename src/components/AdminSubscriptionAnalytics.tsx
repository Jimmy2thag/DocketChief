import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { CustomerLifetimeValue } from './CustomerLifetimeValue';
import { FailedPaymentTracker } from './FailedPaymentTracker';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { calculateMRR, calculateChurnRate, groupByPlan, calculateMRRHistory } from '@/lib/analyticsCalculations';
import { calculateAverageCLV, calculateAverageLifespan, calculateCLVByPlan, calculateCohortData } from '@/lib/clvCalculations';

export function AdminSubscriptionAnalytics() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [metricsData, setMetricsData] = useState({
    activeSubscriptions: 0,
    mrr: 0,
    churnRate: 0,
    subscriptionsByPlan: [] as Array<{ plan: string; count: number; revenue: number }>,
    mrrHistory: [] as Array<{ month: string; mrr: number; newMrr: number; churnedMrr: number }>
  });

  const [clvData, setClvData] = useState({
    averageClv: 0,
    averageLifespan: 0,
    clvByPlan: [] as Array<{ plan: string; clv: number; customers: number }>,
    cohortData: [] as Array<{ cohort: string; clv: number; retention: number }>
  });

  const [failedPaymentsData, setFailedPaymentsData] = useState({
    failedPayments: [] as FailedPaymentSummary[],
    totalFailedAmount: 0,
    recoveryRate: 0
  });

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subError) throw subError;

      const { data: payments, error: payError } = await supabase
        .from('payment_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (payError) throw payError;

      const subs = (subscriptions || []) as SubscriptionRecord[];
      const pays = (payments || []) as PaymentRecord[];

      // Calculate metrics
      const activeCount = subs.filter(s => s.status === 'active').length;
      const mrr = calculateMRR(subs);
      const churnRate = calculateChurnRate(subs, pays);
      const planGroups = groupByPlan(subs);
      const mrrHistory = calculateMRRHistory(pays);

      setMetricsData({
        activeSubscriptions: activeCount,
        mrr: Math.round(mrr),
        churnRate: Number(churnRate.toFixed(2)),
        subscriptionsByPlan: planGroups,
        mrrHistory
      });

      // Calculate CLV metrics
      const avgClv = calculateAverageCLV(subs, pays);
      const avgLifespan = calculateAverageLifespan(subs);
      const clvByPlan = calculateCLVByPlan(subs, pays);
      const cohortData = calculateCohortData(subs, pays);

      setClvData({
        averageClv: avgClv,
        averageLifespan: avgLifespan,
        clvByPlan,
        cohortData
      });

      // Calculate failed payments
      const failedPays = pays.filter(p => p.status === 'failed');
      const totalFailed = failedPays.reduce((sum, p) => sum + (p.amount || 0), 0);
      const recovered = pays.filter(p => p.status === 'succeeded' && p.retry_count > 0).length;
      const recoveryRate = failedPays.length > 0 ? (recovered / failedPays.length) * 100 : 0;

      setFailedPaymentsData({
        failedPayments: failedPays.slice(0, 10).map(p => ({
          id: p.id || crypto.randomUUID(),
          customerId: p.customer_id || 'unknown',
          customerEmail: p.customer_email || 'N/A',
          amount: p.amount || 0,
          plan: p.plan_name || 'Unknown',
          failureReason: p.failure_reason || 'Unknown',
          attemptCount: p.retry_count || 1,
          lastAttempt: p.created_at || new Date().toISOString(),
          nextRetry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending_retry' as const
        })),
        totalFailedAmount: Math.round(totalFailed),
        recoveryRate: Math.round(recoveryRate)
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalyticsData();

    // Set up real-time subscriptions
    const subscriptionChannel = supabase
      .channel('subscriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        fetchAnalyticsData();
      })
      .subscribe();

    const paymentChannel = supabase
      .channel('payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_history' }, () => {
        fetchAnalyticsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, [fetchAnalyticsData]);

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Active Subscriptions', metricsData.activeSubscriptions],
      ['MRR', metricsData.mrr],
      ['Churn Rate', metricsData.churnRate],
      ['Average CLV', clvData.averageClv],
      ['Average Lifespan', clvData.averageLifespan]
    ];
    
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscription-analytics.csv';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Analytics</h1>
          <p className="text-muted-foreground">Real-time revenue, subscriptions, and customer metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Subscription Metrics</TabsTrigger>
          <TabsTrigger value="clv">Customer Lifetime Value</TabsTrigger>
          <TabsTrigger value="failed">Failed Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <SubscriptionMetrics {...metricsData} />
        </TabsContent>

        <TabsContent value="clv">
          <CustomerLifetimeValue {...clvData} />
        </TabsContent>

        <TabsContent value="failed">
          <FailedPaymentTracker {...failedPaymentsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
  type SubscriptionRecord = {
    status?: string;
    amount?: number;
    interval?: string;
    plan_name?: string;
    user_id?: string;
    created_at?: string;
    cancelled_at?: string;
    stripe_subscription_id?: string;
  };

  type PaymentRecord = {
    id?: string;
    status?: string;
    amount?: number;
    retry_count?: number;
    customer_id?: string;
    customer_email?: string;
    plan_name?: string;
    failure_reason?: string;
    created_at?: string;
    subscription_id?: string;
  };

  type FailedPaymentSummary = {
    id: string;
    customerId: string;
    customerEmail: string;
    amount: number;
    plan: string;
    failureReason: string;
    attemptCount: number;
    lastAttempt: string;
    nextRetry: string;
    status: 'pending_retry';
  };
