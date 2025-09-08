export interface User {
  id: number;
  steamId: string;
  username: string;
  avatarUrl: string;
  createdAt?: string;
  updatedAt?: string;
  token?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

import { config } from './config';

export const API_BASE_URL = config.apiUrl;

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      this.user = this.getUserFromStorage();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    if (userStr && token) {
      const user = JSON.parse(userStr);
      return { ...user, token };
    }
    return null;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  public getUserOrThrow(): User {
    if (!this.user) {
      throw new Error('User not authenticated');
    }
    return this.user;
  }

  public setAuth(token: string, user: User): void {
    this.token = token;
    this.user = { ...user, token };
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify({ ...user, token }));
    }
  }

  public clearAuth(): void {
    this.token = null;
    this.user = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  public async getProfile(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const user = await response.json();
    this.user = { ...user, token: this.token };
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify({ ...user, token: this.token }));
    }
    return this.user!;
  }

  public getSteamAuthUrl(): string {
    return `${API_BASE_URL}/auth/steam`;
  }
}
