import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../lib/apiClient';
import { getAuthorizationUrl, getConnectionStatus, disconnect, syncRides, getRides } from './stravaApi';

vi.mock('../../lib/apiClient');

describe('stravaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should fetch authorization URL', async () => {
      const mockUrl = 'https://www.strava.com/oauth/authorize?client_id=123';
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockUrl });

      const result = await getAuthorizationUrl();

      expect(result).toBe(mockUrl);
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/strava/authorize');
    });
  });

  describe('getConnectionStatus', () => {
    it('should fetch connection status', async () => {
      const mockConnection = {
        id: 1,
        userId: 123,
        stravaAthleteId: 456,
        connected: true,
        connectedAt: '2024-01-15T10:30:00',
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockConnection });

      const result = await getConnectionStatus();

      expect(result).toEqual(mockConnection);
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/strava/connection');
    });
  });

  describe('disconnect', () => {
    it('should disconnect Strava account', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({});

      await disconnect();

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/strava/connection');
    });
  });

  describe('syncRides', () => {
    it('should trigger ride sync', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({});

      await syncRides();

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/strava/sync');
    });
  });

  describe('getRides', () => {
    it('should fetch user rides', async () => {
      const mockRides = [
        {
          id: 1,
          stravaActivityId: 12345,
          name: 'Morning Ride',
          distance: 25500,
          movingTime: 3600,
          elapsedTime: 3700,
          totalElevationGain: 250,
          startDate: '2024-01-15T08:00:00',
          averageSpeed: 7.08,
          maxSpeed: 12.5,
          averageWatts: 180,
          averageHeartrate: 145,
          maxHeartrate: 175,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockRides });

      const result = await getRides();

      expect(result).toEqual(mockRides);
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/strava/rides');
    });
  });
});
