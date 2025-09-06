import { config } from '@/lib/config';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

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

export interface Smoke {
  id: number;
  title: string;
  videoUrl: string;
  timestamp: number;
  x_coord: number;
  y_coord: number;
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
  x_coord: number;
  y_coord: number;
  mapId: number;
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
    const response = await fetch(`${config.apiUrl}/maps/${mapId}/smokes`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch smokes for map ${mapId}: ${response.status}`);
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
      throw new Error(`Failed to create smoke: ${response.status}`);
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
      throw new Error(`Failed to delete smoke: ${response.status}`);
    }
  }
}
