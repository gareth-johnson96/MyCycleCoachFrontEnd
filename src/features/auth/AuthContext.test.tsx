import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import { useContext } from 'react';
import type { AuthResponse } from './types';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('initializes isAuthenticated to false when no token exists', () => {
    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    expect(result.current?.isAuthenticated).toBe(false);
  });

  it('initializes isAuthenticated to true when token exists in localStorage', () => {
    localStorage.setItem('accessToken', 'test-token');

    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    expect(result.current?.isAuthenticated).toBe(true);
  });

  it('sets tokens and updates authentication state on login', () => {
    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    const authResponse: AuthResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    act(() => {
      result.current?.login(authResponse);
    });

    expect(localStorage.getItem('accessToken')).toBe('new-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
    expect(result.current?.isAuthenticated).toBe(true);
  });

  it('removes tokens and updates authentication state on logout', () => {
    localStorage.setItem('accessToken', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh');

    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    expect(result.current?.isAuthenticated).toBe(true);

    act(() => {
      result.current?.logout();
    });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(result.current?.isAuthenticated).toBe(false);
  });

  it('provides login and logout functions', () => {
    const { result } = renderHook(() => useContext(AuthContext), {
      wrapper: AuthProvider,
    });

    expect(result.current?.login).toBeDefined();
    expect(result.current?.logout).toBeDefined();
    expect(typeof result.current?.login).toBe('function');
    expect(typeof result.current?.logout).toBe('function');
  });
});
