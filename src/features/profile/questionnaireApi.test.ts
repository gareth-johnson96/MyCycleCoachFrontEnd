import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitQuestionnaire } from './questionnaireApi';
import { apiClient } from '../../lib/apiClient';

vi.mock('../../lib/apiClient');

describe('questionnaireApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits questionnaire data successfully', async () => {
    const mockData = {
      age: 30,
      weight: 75,
      height: 180,
      experienceLevel: 'INTERMEDIATE',
      goals: 'Complete a century ride',
    };

    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await submitQuestionnaire(mockData);

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/user/questionnaire', mockData);
  });

  it('handles API errors when submitting questionnaire', async () => {
    const mockData = {
      goals: 'Improve fitness',
    };

    vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

    await expect(submitQuestionnaire(mockData)).rejects.toThrow('Network error');
  });

  it('transforms targetEventDate to ISO 8601 format with time', async () => {
    const mockData = {
      age: 30,
      goals: 'Complete a century ride',
      targetEvent: 'Tour de France',
      targetEventDate: '2026-09-12',
    };

    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await submitQuestionnaire(mockData);

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/user/questionnaire', {
      age: 30,
      goals: 'Complete a century ride',
      targetEvent: 'Tour de France',
      targetEventDate: '2026-09-12T00:00:00',
    });
  });

  it('does not modify data when targetEventDate is not provided', async () => {
    const mockData = {
      age: 25,
      goals: 'Improve endurance',
    };

    vi.mocked(apiClient.post).mockResolvedValue({ data: {} });

    await submitQuestionnaire(mockData);

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/user/questionnaire', {
      age: 25,
      goals: 'Improve endurance',
    });
  });
});
