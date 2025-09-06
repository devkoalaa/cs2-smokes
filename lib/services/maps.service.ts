import { config } from '@/lib/config';

export interface Map {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
  thumbnail?: string;
  radar?: string;
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
    const response = await fetch(`${config.apiUrl}/maps`);

    if (!response.ok) {
      throw new Error(`Failed to fetch maps: ${response.status}`);
    }

    const result = await response.json()

    console.log('response maps', result);

    return result;
  }

  async getMapById(id: number): Promise<Map> {
    const response = await fetch(`${config.apiUrl}/maps/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch map: ${response.status}`);
    }

    return response.json();
  }
}
