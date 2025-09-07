import { config } from '@/lib/config';

export class UsersService {
  private static instance: UsersService;

  static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  async getUsersCount(): Promise<number> {
    const response = await fetch(`${config.apiUrl}/users/count`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch users count: ${response.status}`);
    }
    const data = await response.json();
    return data.count as number;
  }
}


