import { config } from '@/lib/config';

export interface Map {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
  thumbnail?: string;
  radar?: string;
  radarLower?: string; // Radar do andar inferior (para mapas como Nuke)
  smokesCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MapsService {
  private static instance: MapsService;

  static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  async getAllMaps(): Promise<Map[]> {
    const response = await fetch(`${config.apiUrl}/maps`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch maps: ${response.status}`);
    }

    const result = await response.json()

    return result;
  }

  async getMapById(id: number): Promise<Map> {
    const response = await fetch(`${config.apiUrl}/maps/${id}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch map: ${response.status}`);
    }

    return response.json();
  }
}
