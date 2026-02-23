import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentPlan, getPlanWithSessions, generatePlan, updateSession } from './trainingApi';
import { apiClient } from '../../lib/apiClient';
import type { TrainingPlanResponse, TrainingPlanDetailResponse, CompleteSessionRequest } from './types';

// Mock the apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('trainingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentPlan', () => {
    it('calls apiClient.get with correct endpoint', async () => {
      const mockPlan: TrainingPlanResponse = {
        id: 1,
        userId: 1,
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        goal: 'General Fitness',
        status: 'ACTIVE',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlan });

      const result = await getCurrentPlan();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/training/plan/current');
      expect(result).toEqual(mockPlan);
    });
  });

  describe('getPlanWithSessions', () => {
    it('calls apiClient.get with fromDate and toDate params', async () => {
      const mockPlanDetail: TrainingPlanDetailResponse = {
        id: 1,
        userId: 1,
        completedSessions: [],
        trainingPlan: [],
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPlanDetail });

      const result = await getPlanWithSessions('2026-02-01', '2026-02-28');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/training/plan', {
        params: {
          fromDate: '2026-02-01',
          toDate: '2026-02-28',
        },
      });
      expect(result).toEqual(mockPlanDetail);
    });
  });

  describe('generatePlan', () => {
    it('calls apiClient.post with no goal parameter', async () => {
      const mockPlan: TrainingPlanResponse = {
        id: 1,
        userId: 1,
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        goal: 'General Fitness',
        status: 'ACTIVE',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockPlan });

      const result = await generatePlan();

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/training/plan/generate',
        null,
        { params: {} }
      );
      expect(result).toEqual(mockPlan);
    });

    it('calls apiClient.post with goal parameter', async () => {
      const mockPlan: TrainingPlanResponse = {
        id: 1,
        userId: 1,
        startDate: '2026-02-01',
        endDate: '2026-02-28',
        goal: 'Race Training',
        status: 'ACTIVE',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockPlan });

      const result = await generatePlan('Race Training');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/training/plan/generate',
        null,
        { params: { goal: 'Race Training' } }
      );
      expect(result).toEqual(mockPlan);
    });
  });

  describe('updateSession', () => {
    it('calls apiClient.put with correct endpoint and data', async () => {
      const sessionId = 123;
      const updateData: CompleteSessionRequest = {
        status: 'COMPLETED',
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined });

      await updateSession(sessionId, updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/v1/training/plan/session/${sessionId}`,
        updateData
      );
    });
  });
});
