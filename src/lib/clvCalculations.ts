// Customer Lifetime Value calculation utilities

type SubscriptionRecord = {
  status?: string;
  user_id?: string;
  created_at?: string;
  cancelled_at?: string;
  plan_name?: string;
  stripe_subscription_id?: string;
};

type PaymentRecord = {
  status?: string;
  amount?: number;
  subscription_id?: string;
};

export const calculateAverageCLV = (subscriptions: SubscriptionRecord[], payments: PaymentRecord[]) => {
  if (subscriptions.length === 0) return 0;
  
  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const uniqueCustomers = new Set(subscriptions.map(s => s.user_id)).size;
  
  return uniqueCustomers > 0 ? Math.round(totalRevenue / uniqueCustomers) : 0;
};

export const calculateAverageLifespan = (subscriptions: SubscriptionRecord[]) => {
  const cancelledSubs = subscriptions.filter(s => s.status === 'cancelled' && s.cancelled_at);
  
  if (cancelledSubs.length === 0) return 0;
  
  const totalMonths = cancelledSubs.reduce((sum, sub) => {
    const start = new Date(sub.created_at);
    const end = new Date(sub.cancelled_at);
    const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return sum + months;
  }, 0);
  
  return Math.round(totalMonths / cancelledSubs.length);
};

export const calculateCLVByPlan = (subscriptions: SubscriptionRecord[], payments: PaymentRecord[]) => {
  const planData: Record<string, { totalRevenue: number; customers: Set<string> }> = {};
  
  subscriptions.forEach(sub => {
    const plan = sub.plan_name || 'Unknown';
    if (!planData[plan]) {
      planData[plan] = { totalRevenue: 0, customers: new Set() };
    }
    planData[plan].customers.add(sub.user_id);
  });
  
  payments
    .filter(p => p.status === 'succeeded')
    .forEach(payment => {
      const sub = subscriptions.find(s => s.stripe_subscription_id === payment.subscription_id);
      if (sub) {
        const plan = sub.plan_name || 'Unknown';
        if (planData[plan]) {
          planData[plan].totalRevenue += payment.amount || 0;
        }
      }
    });
  
  return Object.entries(planData).map(([plan, data]) => ({
    plan,
    clv: data.customers.size > 0 ? Math.round(data.totalRevenue / data.customers.size) : 0,
    customers: data.customers.size
  }));
};

export const calculateCohortData = (subscriptions: SubscriptionRecord[], payments: PaymentRecord[]) => {
  const cohorts: Record<string, { revenue: number; customers: Set<string>; retained: Set<string> }> = {};
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  
  subscriptions.forEach(sub => {
    const date = new Date(sub.created_at);
    const quarter = quarters[Math.floor(date.getMonth() / 3)];
    const cohortKey = `${quarter} ${date.getFullYear()}`;
    
    if (!cohorts[cohortKey]) {
      cohorts[cohortKey] = { revenue: 0, customers: new Set(), retained: new Set() };
    }
    cohorts[cohortKey].customers.add(sub.user_id);
    if (sub.status === 'active') {
      cohorts[cohortKey].retained.add(sub.user_id);
    }
  });
  
  return Object.entries(cohorts)
    .slice(0, 4)
    .map(([cohort, data]) => ({
      cohort,
      clv: data.customers.size > 0 ? Math.round(data.revenue / data.customers.size) : 0,
      retention: data.customers.size > 0 ? Math.round((data.retained.size / data.customers.size) * 100) : 0
    }));
};
