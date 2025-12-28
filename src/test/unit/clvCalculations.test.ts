import { describe, it, expect } from 'vitest';
import {
  calculateAverageCLV,
  calculateAverageLifespan,
  calculateCLVByPlan,
  calculateCohortData,
} from '@/lib/clvCalculations';

describe('clvCalculations', () => {
  describe('calculateAverageCLV', () => {
    it('should calculate average CLV correctly', () => {
      const subscriptions = [
        { user_id: 'user1' },
        { user_id: 'user2' },
      ];
      const payments = [
        { status: 'succeeded', amount: 1000 },
        { status: 'succeeded', amount: 2000 },
      ];

      const clv = calculateAverageCLV(subscriptions, payments);
      expect(clv).toBe(1500); // 3000 / 2 users
    });

    it('should return 0 for no subscriptions', () => {
      const clv = calculateAverageCLV([], []);
      expect(clv).toBe(0);
    });

    it('should only count succeeded payments', () => {
      const subscriptions = [{ user_id: 'user1' }];
      const payments = [
        { status: 'succeeded', amount: 1000 },
        { status: 'failed', amount: 500 },
      ];

      const clv = calculateAverageCLV(subscriptions, payments);
      expect(clv).toBe(1000);
    });

    it('should handle multiple subscriptions per user', () => {
      const subscriptions = [
        { user_id: 'user1' },
        { user_id: 'user1' },
        { user_id: 'user2' },
      ];
      const payments = [
        { status: 'succeeded', amount: 3000 },
      ];

      const clv = calculateAverageCLV(subscriptions, payments);
      expect(clv).toBe(1500); // 3000 / 2 unique users
    });

    it('should handle payments without amount', () => {
      const subscriptions = [{ user_id: 'user1' }];
      const payments = [
        { status: 'succeeded' },
        { status: 'succeeded', amount: 1000 },
      ];

      const clv = calculateAverageCLV(subscriptions, payments);
      expect(clv).toBe(1000);
    });
  });

  describe('calculateAverageLifespan', () => {
    it('should calculate average lifespan in months', () => {
      const now = new Date();
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);

      const subscriptions = [
        {
          status: 'cancelled',
          created_at: twoMonthsAgo.toISOString(),
          cancelled_at: now.toISOString(),
        },
      ];

      const lifespan = calculateAverageLifespan(subscriptions);
      expect(lifespan).toBeGreaterThan(0);
    });

    it('should return 0 for no cancelled subscriptions', () => {
      const subscriptions = [
        { status: 'active', created_at: new Date().toISOString() },
      ];

      const lifespan = calculateAverageLifespan(subscriptions);
      expect(lifespan).toBe(0);
    });

    it('should only include cancelled subscriptions', () => {
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);

      const subscriptions = [
        {
          status: 'cancelled',
          created_at: oneMonthAgo.toISOString(),
          cancelled_at: now.toISOString(),
        },
        { status: 'active', created_at: oneMonthAgo.toISOString() },
      ];

      const lifespan = calculateAverageLifespan(subscriptions);
      expect(lifespan).toBeGreaterThan(0);
    });

    it('should average multiple cancelled subscriptions', () => {
      const now = new Date();
      const twoMonthsAgo = new Date(now);
      twoMonthsAgo.setMonth(now.getMonth() - 2);
      const fourMonthsAgo = new Date(now);
      fourMonthsAgo.setMonth(now.getMonth() - 4);

      const subscriptions = [
        {
          status: 'cancelled',
          created_at: twoMonthsAgo.toISOString(),
          cancelled_at: now.toISOString(),
        },
        {
          status: 'cancelled',
          created_at: fourMonthsAgo.toISOString(),
          cancelled_at: now.toISOString(),
        },
      ];

      const lifespan = calculateAverageLifespan(subscriptions);
      expect(lifespan).toBeGreaterThan(0);
    });
  });

  describe('calculateCLVByPlan', () => {
    it('should calculate CLV by plan', () => {
      const subscriptions = [
        { user_id: 'user1', plan_name: 'Basic', stripe_subscription_id: 'sub1' },
        { user_id: 'user2', plan_name: 'Pro', stripe_subscription_id: 'sub2' },
      ];
      const payments = [
        { status: 'succeeded', amount: 1000, subscription_id: 'sub1' },
        { status: 'succeeded', amount: 2000, subscription_id: 'sub2' },
      ];

      const clvByPlan = calculateCLVByPlan(subscriptions, payments);

      expect(clvByPlan).toHaveLength(2);
      
      const basicPlan = clvByPlan.find(p => p.plan === 'Basic');
      expect(basicPlan?.clv).toBe(1000);
      expect(basicPlan?.customers).toBe(1);

      const proPlan = clvByPlan.find(p => p.plan === 'Pro');
      expect(proPlan?.clv).toBe(2000);
      expect(proPlan?.customers).toBe(1);
    });

    it('should handle unknown plan names', () => {
      const subscriptions = [
        { user_id: 'user1', stripe_subscription_id: 'sub1' },
      ];
      const payments = [
        { status: 'succeeded', amount: 1000, subscription_id: 'sub1' },
      ];

      const clvByPlan = calculateCLVByPlan(subscriptions, payments);
      expect(clvByPlan[0].plan).toBe('Unknown');
    });

    it('should only count succeeded payments', () => {
      const subscriptions = [
        { user_id: 'user1', plan_name: 'Basic', stripe_subscription_id: 'sub1' },
      ];
      const payments = [
        { status: 'succeeded', amount: 1000, subscription_id: 'sub1' },
        { status: 'failed', amount: 500, subscription_id: 'sub1' },
      ];

      const clvByPlan = calculateCLVByPlan(subscriptions, payments);
      expect(clvByPlan[0].clv).toBe(1000);
    });

    it('should handle multiple customers per plan', () => {
      const subscriptions = [
        { user_id: 'user1', plan_name: 'Basic', stripe_subscription_id: 'sub1' },
        { user_id: 'user2', plan_name: 'Basic', stripe_subscription_id: 'sub2' },
      ];
      const payments = [
        { status: 'succeeded', amount: 1000, subscription_id: 'sub1' },
        { status: 'succeeded', amount: 1000, subscription_id: 'sub2' },
      ];

      const clvByPlan = calculateCLVByPlan(subscriptions, payments);
      expect(clvByPlan[0].clv).toBe(1000);
      expect(clvByPlan[0].customers).toBe(2);
    });
  });

  describe('calculateCohortData', () => {
    it('should calculate cohort data by quarter', () => {
      const subscriptions = [
        { user_id: 'user1', created_at: '2024-01-15', status: 'active' },
        { user_id: 'user2', created_at: '2024-04-15', status: 'active' },
      ];

      const cohortData = calculateCohortData(subscriptions, []);

      expect(cohortData.length).toBeGreaterThan(0);
      expect(cohortData[0]).toHaveProperty('cohort');
      expect(cohortData[0]).toHaveProperty('clv');
      expect(cohortData[0]).toHaveProperty('retention');
    });

    it('should calculate retention rate correctly', () => {
      const subscriptions = [
        { user_id: 'user1', created_at: '2024-01-15', status: 'active' },
        { user_id: 'user2', created_at: '2024-01-20', status: 'cancelled' },
      ];

      const cohortData = calculateCohortData(subscriptions, []);
      const q1Data = cohortData.find(c => c.cohort.includes('Q1'));
      
      if (q1Data) {
        expect(q1Data.retention).toBe(50); // 1 active out of 2 total
      }
    });

    it('should return up to 4 cohorts', () => {
      const subscriptions: any[] = [];
      
      // Create subscriptions for 6 quarters
      for (let i = 0; i < 6; i++) {
        const date = new Date(2024, i * 3, 1);
        subscriptions.push({
          user_id: `user${i}`,
          created_at: date.toISOString(),
          status: 'active',
        });
      }

      const cohortData = calculateCohortData(subscriptions, []);
      expect(cohortData.length).toBeLessThanOrEqual(4);
    });

    it('should handle empty subscriptions', () => {
      const cohortData = calculateCohortData([], []);
      expect(cohortData).toEqual([]);
    });
  });
});
