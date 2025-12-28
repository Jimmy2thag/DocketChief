// Analytics calculation utilities for subscription metrics

interface Subscription {
  status: string;
  amount?: number;
  interval?: 'month' | 'year';
  created_at: string;
  plan_id?: string;
  [key: string]: unknown;
}

interface Payment {
  created_at: string;
  amount: number;
  subscription_id?: string;
  [key: string]: unknown;
}

export const calculateMRR = (subscriptions: Subscription[]) => {
  return subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, sub) => {
      const amount = sub.amount || 0;
      // Convert to monthly if needed
      if (sub.interval === 'year') return sum + (amount / 12);
      return sum + amount;
    }, 0);
};

export const calculateChurnRate = (subscriptions: Subscription[], payments: Payment[]) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const activeLastMonth = subscriptions.filter(s => 
    new Date(s.created_at) < thisMonth
  ).length;
  
  const cancelledThisMonth = subscriptions.filter(s => 
    s.status === 'cancelled' && 
    s.cancelled_at && 
    new Date(s.cancelled_at) >= thisMonth
  ).length;
  
  return activeLastMonth > 0 ? (cancelledThisMonth / activeLastMonth) * 100 : 0;
};

export const groupByPlan = (subscriptions: Subscription[]) => {
  const planGroups: Record<string, { count: number; revenue: number }> = {};
  
  subscriptions
    .filter(s => s.status === 'active')
    .forEach(sub => {
      const plan = sub.plan_name || 'Unknown';
      if (!planGroups[plan]) {
        planGroups[plan] = { count: 0, revenue: 0 };
      }
      planGroups[plan].count++;
      const amount = sub.amount || 0;
      planGroups[plan].revenue += sub.interval === 'year' ? amount / 12 : amount;
    });
  
  return Object.entries(planGroups).map(([plan, data]) => ({
    plan,
    count: data.count,
    revenue: Math.round(data.revenue)
  }));
};

export const calculateMRRHistory = (payments: Payment[]) => {
  const monthlyData: Record<string, { mrr: number; newMrr: number; churnedMrr: number }> = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = months[date.getMonth()];
    monthlyData[monthKey] = { mrr: 0, newMrr: 0, churnedMrr: 0 };
  }
  
  payments.forEach(payment => {
    const date = new Date(payment.created_at);
    const monthKey = months[date.getMonth()];
    if (monthlyData[monthKey]) {
      const amount = payment.amount || 0;
      if (payment.status === 'succeeded') {
        monthlyData[monthKey].newMrr += amount;
        monthlyData[monthKey].mrr += amount;
      } else if (payment.status === 'failed') {
        monthlyData[monthKey].churnedMrr += amount;
      }
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    mrr: Math.round(data.mrr),
    newMrr: Math.round(data.newMrr),
    churnedMrr: Math.round(data.churnedMrr)
  }));
};
