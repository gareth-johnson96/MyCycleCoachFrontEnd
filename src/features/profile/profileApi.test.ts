import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile, saveBackground, updateGoals } from './profileApi';
import { apiClient } from '../../lib/apiClient';
import type {
  ProfileResponse,
  UpdateProfileRequest,
  BackgroundRequest,
  GoalsRequest,
} from './types';

// Mock the apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

describe('profileApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('calls apiClient.get and returns profile data', async () => {
      const mockProfile: ProfileResponse = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        age: 30,
        weight: 75,
        height: 180,
        background: {
          experienceLevel: 'intermediate',
          weeklyMileage: 100,
          longestRide: 80,
        },
        goals: {
          targetEvent: '100 mile ride',
          targetDate: '2026-06-01',
          weeklyAvailability: 5,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProfile });

      const result = await getProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/user/profile');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('calls apiClient.put with correct endpoint and data', async () => {
      const updateData: UpdateProfileRequest = {
        name: 'Updated Name',
        age: 31,
        weight: 76,
        height: 181,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined });

      await updateProfile(updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/user/profile', updateData);
    });
  });

  describe('saveBackground', () => {
    it('calls apiClient.post with correct endpoint and data', async () => {
      const backgroundData: BackgroundRequest = {
        experienceLevel: 'advanced',
        weeklyMileage: 150,
        longestRide: 120,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await saveBackground(backgroundData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/user/background', backgroundData);
    });
  });

  describe('updateGoals', () => {
    it('calls apiClient.put with correct endpoint and data', async () => {
      const goalsData: GoalsRequest = {
        targetEvent: 'Century Ride',
        targetDate: '2026-07-01',
        weeklyAvailability: 6,
      };

      vi.mocked(apiClient.put).mockResolvedValue({ data: undefined });

      await updateGoals(goalsData);

      expect(apiClient.put).toHaveBeenCalledWith('/api/v1/user/goals', goalsData);
    });
  });
});
