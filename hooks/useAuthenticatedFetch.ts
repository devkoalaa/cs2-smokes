import { useCallback } from 'react';
import { AuthService } from '@/lib/auth';
import { config } from '@/lib/config';

export function useAuthenticatedFetch() {
  const authService = AuthService.getInstance();

  const authenticatedFetch = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${config.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be expired, clear auth and redirect to login
      authService.clearAuth();
      window.location.href = '/';
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }, [authService]);

  return { authenticatedFetch };
}
