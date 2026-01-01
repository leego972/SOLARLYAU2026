import { describe, expect, it, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

describe('Viba Integration API', () => {
  const validApiKey = process.env.VIBA_API_KEY || 'test-api-key';
  const invalidApiKey = 'invalid-key';

  function createContext(): TrpcContext {
    return {
      user: null,
      req: {
        protocol: 'https',
        headers: {},
      } as TrpcContext['req'],
      res: {} as TrpcContext['res'],
    };
  }

  describe('getBusinessOverview', () => {
    it('should return business overview with valid API key', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getBusinessOverview({
        apiKey: validApiKey,
        timeRange: 'all',
      });

      expect(result).toHaveProperty('businessName', 'SolarlyAU');
      expect(result).toHaveProperty('leads');
      expect(result).toHaveProperty('installers');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('stateDistribution');
      expect(result.leads).toHaveProperty('total');
      expect(result.leads).toHaveProperty('active');
      expect(result.revenue).toHaveProperty('totalRevenue');
    });

    it('should reject invalid API key', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.viba.getBusinessOverview({
          apiKey: invalidApiKey,
          timeRange: 'all',
        })
      ).rejects.toThrow('Invalid API key');
    });

    it('should filter by time range', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getBusinessOverview({
        apiKey: validApiKey,
        timeRange: 'month',
      });

      expect(result.timeRange).toBe('month');
    });
  });

  describe('getLeads', () => {
    it('should return paginated leads with valid API key', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getLeads({
        apiKey: validApiKey,
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('leads');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('limit', 10);
      expect(result).toHaveProperty('offset', 0);
      expect(Array.isArray(result.leads)).toBe(true);
    });

    it('should filter leads by state', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getLeads({
        apiKey: validApiKey,
        state: 'QLD',
        limit: 50,
      });

      expect(result.leads.length).toBeLessThanOrEqual(50);
    });

    it('should filter by quality score', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getLeads({
        apiKey: validApiKey,
        minQuality: 85,
        limit: 20,
      });

      expect(result.leads.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getTransactions', () => {
    it('should return transaction history', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getTransactions({
        apiKey: validApiKey,
        limit: 20,
      });

      expect(result).toHaveProperty('transactions');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.transactions)).toBe(true);
    });

    it('should filter by transaction status', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getTransactions({
        apiKey: validApiKey,
        status: 'completed',
        limit: 10,
      });

      expect(result.transactions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should return time series revenue data', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getRevenueAnalytics({
        apiKey: validApiKey,
        groupBy: 'day',
        days: 30,
      });

      expect(result).toHaveProperty('groupBy', 'day');
      expect(result).toHaveProperty('days', 30);
      expect(result).toHaveProperty('timeSeries');
      expect(Array.isArray(result.timeSeries)).toBe(true);
    });

    it('should group by week', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getRevenueAnalytics({
        apiKey: validApiKey,
        groupBy: 'week',
        days: 90,
      });

      expect(result.groupBy).toBe('week');
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', async () => {
      const ctx = createContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.viba.getSystemHealth({
        apiKey: validApiKey,
      });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('autonomousSystems');
      expect(result).toHaveProperty('uptime');
      expect(['operational', 'degraded', 'down']).toContain(result.status);
    });
  });
});
