'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authManager, AuthState } from '@/lib/auth';

interface AuthContextType {
  authState: AuthState;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(authManager.getAuthState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth state on mount
    const currentAuth = authManager.getAuthState();
    setAuthState(currentAuth);
    setIsLoading(false);
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      const newAuthState = await authManager.login();
      setAuthState(newAuthState);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authManager.logout();
      setAuthState({
        isAuthenticated: false,
        walletAddress: null,
        username: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

