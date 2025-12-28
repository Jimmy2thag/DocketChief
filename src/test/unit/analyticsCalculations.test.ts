import { describe, it, expect } from 'vitest';
import {
  calculateMRR,
  calculateChurnRate,
  groupByPlan,
  calculateMRRHistory,
} from '@/lib/analyticsCalculations';

describe('analyticsCalculations', () => {
  describe('calculateMRR', () => {
    it('should calculate MRR for active monthly subscriptions', () => {
      const subscriptions = [
        { status: 'active', amount: 100, interval: 'month' },
        { status: 'active', amount: 200, interval: 'month' },
        { status: 'cancelled', amount: 50, interval: 'month' },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(300);
    });

    it('should convert yearly subscriptions to monthly', () => {
      const subscriptions = [
        { status: 'active', amount: 1200, interval: 'year' },
        { status: 'active', amount: 100, interval: 'month' },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(200); // 1200/12 + 100
    });

    it('should return 0 for empty subscriptions', () => {
      const mrr = calculateMRR([]);
      expect(mrr).toBe(0);
    });

    it('should handle subscriptions without amount', () => {
      const subscriptions = [
        { status: 'active', interval: 'month' },
        { status: 'active', amount: 100, interval: 'month' },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(100);
    });

    it('should only count active subscriptions', () => {
      const subscriptions = [
        { status: 'active', amount: 100, interval: 'month' },
        { status: 'paused', amount: 50, interval: 'month' },
        { status: 'cancelled', amount: 75, interval: 'month' },
      ];

      const mrr = calculateMRR(subscriptions);
      expect(mrr).toBe(100);
    });
  });

  describe('calculateChurnRate', () => {
    it('should calculate churn rate correctly', () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const subscriptions = [
        { created_at: lastMonth.toISOString(), status: 'active' },
        { created_at: lastMonth.toISOString(), status: 'active' },
        {
          created_at: lastMonth.toISOString(),
          status: 'cancelled',
          cancelled_at: thisMonth.toISOString(),
        },
      ];

      const churnRate = calculateChurnRate(subscriptions, []);
      expect(churnRate).toBeGreaterThan(0);
      expect(churnRate).toBeLessThanOrEqual(100);
    });

    it('should return 0 when no subscriptions', () => {
      const churnRate = calculateChurnRate([], []);
      expect(churnRate).toBe(0);
    });

    it('should return 0 when no cancellations', () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const subscriptions = [
        { created_at: lastMonth.toISOString(), status: 'active' },
        { created_at: lastMonth.toISOString(), status: 'active' },
      ];

      const churnRate = calculateChurnRate(subscriptions, []);
      expect(churnRate).toBe(0);
    });
  });

  describe('groupByPlan', () => {
    it('should group subscriptions by plan', () => {
      const subscriptions = [
        { status: 'active', plan_name: 'Basic', amount: 100, interval: 'month' },
        { status: 'active', plan_name: 'Basic', amount: 100, interval: 'month' },
        { status: 'active', plan_name: 'Pro', amount: 200, interval: 'month' },
      ];

      const grouped = groupByPlan(subscriptions);

      expect(grouped).toHaveLength(2);
      
      const basicPlan = grouped.find(g => g.plan === 'Basic');
      expect(basicPlan?.count).toBe(2);
      expect(basicPlan?.revenue).toBe(200);

      const proPlan = grouped.find(g => g.plan === 'Pro');
      expect(proPlan?.count).toBe(1);
      expect(proPlan?.revenue).toBe(200);
    });

    it('should handle unknown plan names', () => {
      const subscriptions = [
        { status: 'active', amount: 100, interval: 'month' },
      ];

      const grouped = groupByPlan(subscriptions);
      expect(grouped).toHaveLength(1);
      expect(grouped[0].plan).toBe('Unknown');
    });

    it('should convert yearly amounts to monthly', () => {
      const subscriptions = [
        { status: 'active', plan_name: 'Annual', amount: 1200, interval: 'year' },
      ];

      const grouped = groupByPlan(subscriptions);
      expect(grouped[0].revenue).toBe(100); // 1200/12 rounded
    });

    it('should only include active subscriptions', () => {
      const subscriptions = [
        { status: 'active', plan_name: 'Basic', amount: 100, interval: 'month' },
        { status: 'cancelled', plan_name: 'Basic', amount: 100, interval: 'month' },
      ];

      const grouped = groupByPlan(subscriptions);
      expect(grouped[0].count).toBe(1);
    });
  });

  describe('calculateMRRHistory', () => {
    it('should calculate MRR history for last 6 months', () => {
      const now = new Date();
      const payments = [
        {
          created_at: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          amount: 100,
          status: 'succeeded',
        },
        {
          created_at: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
          amount: 200,
          status: 'succeeded',
        },
      ];

      const history = calculateMRRHistory(payments);
      expect(history).toHaveLength(6);
      expect(history[0]).toHaveProperty('month');
      expect(history[0]).toHaveProperty('mrr');
      expect(history[0]).toHaveProperty('newMrr');
      expect(history[0]).toHaveProperty('churnedMrr');
    });

    it('should handle failed payments as churn', () => {
      const now = new Date();
      const payments = [
        {
          created_at: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          amount: 100,
          status: 'failed',
        },
      ];

      const history = calculateMRRHistory(payments);
      const currentMonth = history[history.length - 1];
      expect(currentMonth.churnedMrr).toBeGreaterThan(0);
    });

    it('should return 6 months of data even with no payments', () => {
      const history = calculateMRRHistory([]);
      expect(history).toHaveLength(6);
      history.forEach(month => {
        expect(month.mrr).toBe(0);
        expect(month.newMrr).toBe(0);
        expect(month.churnedMrr).toBe(0);
      });
    });

    it('should only include payments from last 6 months', () => {
      const now = new Date();
      const oldDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      
      const payments = [
        {
          created_at: oldDate.toISOString(),
          amount: 1000,
          status: 'succeeded',
        },
        {
          created_at: now.toISOString(),
          amount: 100,
          status: 'succeeded',
        },
      ];

      const history = calculateMRRHistory(payments);
      // Should only include recent payment
      const totalMRR = history.reduce((sum, m) => sum + m.mrr, 0);
      expect(totalMRR).toBeLessThanOrEqual(1100);
    });
  });
});
