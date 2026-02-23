import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from './authApi';
import { apiClient } from '../../lib/apiClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from './types';

// Mock the apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('calls apiClient.post with correct endpoint and data', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await register(registerData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', registerData);
    });
  });

  describe('login', () => {
    it('calls apiClient.post and returns auth response', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse: AuthResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAuthResponse });

      const result = await login(loginData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/login', loginData);
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
