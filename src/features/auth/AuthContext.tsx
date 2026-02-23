import { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from './types';

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem('accessToken'));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isLoggedIn);

  const login = useCallback((response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
