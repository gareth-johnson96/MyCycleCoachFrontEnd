import { apiClient } from '../../lib/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

export async function register(data: RegisterRequest): Promise<void> {
  await apiClient.post('/api/v1/auth/register', data);
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
  return response.data;
}
