import { apiClient } from '../../lib/apiClient';
import type { TrainingPlanResponse, CompleteSessionRequest } from './types';

export async function getCurrentPlan(): Promise<TrainingPlanResponse> {
  const response = await apiClient.get<TrainingPlanResponse>('/api/v1/training/plan/current');
  return response.data;
}

export async function generatePlan(goal?: string): Promise<TrainingPlanResponse> {
  const params = goal ? { goal } : {};
  const response = await apiClient.post<TrainingPlanResponse>(
    '/api/v1/training/plan/generate',
    null,
    { params }
  );
  return response.data;
}

export async function updateSession(
  sessionId: number,
  data: CompleteSessionRequest
): Promise<void> {
  await apiClient.put(`/api/v1/training/plan/session/${sessionId}`, data);
}
