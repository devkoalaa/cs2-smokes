"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  forceUpdate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getUser();
          if (currentUser) {
            setUser(currentUser);
            // Optionally refresh profile from server
            try {
              await authService.getProfile();
              setUser(authService.getUser());
            } catch (error) {
              console.warn('Failed to refresh profile:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to prevent hydration mismatch
    const timer = setTimeout(initAuth, 100);
    return () => clearTimeout(timer);
  }, [authService]);

  const login = () => {
    // Volta para a página de origem (ex.: link de partida compartilhado) após o login.
    sessionStorage.setItem('login_return', window.location.pathname + window.location.search);
    window.location.href = authService.getSteamAuthUrl();
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      await authService.getProfile();
      setUser(authService.getUser());
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      logout();
    }
  };

  const forceUpdate = () => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    // Só depois de carregar o usuário (efeito acima): no servidor não há localStorage, e ler
    // direto aqui fazia o HTML do servidor e o do navegador divergirem (erro de hidratação).
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshProfile,
    forceUpdate,
  };

  return (
    <AuthContext.Provider value={value}>
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
