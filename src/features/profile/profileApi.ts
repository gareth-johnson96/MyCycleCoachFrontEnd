import { apiClient } from '../../lib/apiClient';
import type {
  ProfileResponse,
  UpdateProfileRequest,
  BackgroundRequest,
  GoalsRequest,
} from './types';

export async function getProfile(): Promise<ProfileResponse> {
  const response = await apiClient.get<ProfileResponse>('/api/v1/user/profile');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<void> {
  await apiClient.put('/api/v1/user/profile', data);
}

export async function saveBackground(data: BackgroundRequest): Promise<void> {
  await apiClient.post('/api/v1/user/background', data);
}

export async function updateGoals(data: GoalsRequest): Promise<void> {
  await apiClient.put('/api/v1/user/goals', data);
}
