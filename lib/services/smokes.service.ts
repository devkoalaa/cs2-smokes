import { config } from '@/lib/config';

export interface User {
  id: number;
  steamId: string;
  displayName: string;
  avatarUrl?: string;
  profileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Map {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  imageUrl?: string;
  tacticalImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum SmokeType {
  SMOKE = 'SMOKE',
  BANG = 'BANG',
  MOLOTOV = 'MOLOTOV',
  STRATEGY = 'STRATEGY',
}

export interface Smoke {
  id: number;
  title: string;
  videoUrl: string;
  timestamp: number;
  type: SmokeType;
  x_coord: number;
  y_coord: number;
  floor?: string; // 'upper' ou 'lower' para mapas com múltiplos andares
  score: number;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  map: Map;
}

export interface CreateSmokeData {
  title: string;
  videoUrl: string;
  timestamp: number;
  type?: SmokeType;
  x_coord: number;
  y_coord: number;
  mapId: number;
  floor?: string; // 'upper' ou 'lower' para mapas com múltiplos andares
}

export class SmokesService {
  private static instance: SmokesService;

  static getInstance(): SmokesService {
    if (!SmokesService.instance) {
      SmokesService.instance = new SmokesService();
    }
    return SmokesService.instance;
  }

  async getSmokesByMapId(mapId: number): Promise<Smoke[]> {
    const response = await fetch(`${config.apiUrl}/maps/${mapId}/smokes`, { cache: 'no-store' });

    if (!response.ok) {
      let errorMessage = `Failed to fetch smokes for map ${mapId}: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          const messages = Array.isArray(errorData.message)
            ? errorData.message
            : [errorData.message];
          errorMessage = messages.join(', ');
        }
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async createSmoke(data: CreateSmokeData, token: string): Promise<Smoke> {
    const response = await fetch(`${config.apiUrl}/smokes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = `Failed to create smoke: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          const messages = Array.isArray(errorData.message)
            ? errorData.message
            : [errorData.message];
          errorMessage = messages.join(', ');
        }
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async deleteSmoke(smokeId: number, token: string): Promise<void> {
    const response = await fetch(`${config.apiUrl}/smokes/${smokeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Failed to delete smoke: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          const messages = Array.isArray(errorData.message)
            ? errorData.message
            : [errorData.message];
          errorMessage = messages.join(', ');
        }
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }
  }
}
