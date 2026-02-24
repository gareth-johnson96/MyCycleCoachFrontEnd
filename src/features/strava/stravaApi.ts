import { apiClient } from '../../lib/apiClient';
import type { StravaConnectionResponse, RideResponse } from './types';

export async function getAuthorizationUrl(): Promise<string> {
  const response = await apiClient.get<string>('/api/v1/strava/authorize');
  return response.data;
}

export async function getConnectionStatus(): Promise<StravaConnectionResponse> {
  const response = await apiClient.get<StravaConnectionResponse>('/api/v1/strava/connection');
  return response.data;
}

export async function disconnect(): Promise<void> {
  await apiClient.delete('/api/v1/strava/connection');
}

export async function syncRides(): Promise<void> {
  await apiClient.post('/api/v1/strava/sync');
}

export async function getRides(): Promise<RideResponse[]> {
  const response = await apiClient.get<RideResponse[]>('/api/v1/strava/rides');
  return response.data;
}
