import { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from './types';

interface AuthContextValue {
  isAuthenticated: boolean;
  userId: number | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem('accessToken'));
}

function getUserIdFromToken(): number | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ? parseInt(payload.sub, 10) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isLoggedIn);
  const [userId, setUserId] = useState<number | null>(getUserIdFromToken);

  useEffect(() => {
    if (isAuthenticated) {
      const id = getUserIdFromToken();
      setUserId(id);
    } else {
      setUserId(null);
    }
  }, [isAuthenticated]);

  const login = useCallback((response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setIsAuthenticated(true);
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
