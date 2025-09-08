import { config } from '@/lib/config';

export interface RateSmokeData {
  value: 1 | -1; // 1 for upvote, -1 for downvote
}

export interface RateResponse {
  message: string;
}

export class RatingsService {
  private static instance: RatingsService;

  static getInstance(): RatingsService {
    if (!RatingsService.instance) {
      RatingsService.instance = new RatingsService();
    }
    return RatingsService.instance;
  }

  async rateSmoke(smokeId: number, data: RateSmokeData, token: string): Promise<RateResponse> {
    const response = await fetch(`${config.apiUrl}/smokes/${smokeId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to rate smoke: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getUserRatings(token: string): Promise<{ [smokeId: number]: number }> {
    const response = await fetch(`${config.apiUrl}/ratings/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get user ratings: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async removeRating(smokeId: number, token: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/smokes/${smokeId}/rate`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to remove rating: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
