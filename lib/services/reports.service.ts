import { config } from '@/lib/config';

export interface ReportSmokeData {
  reason: string;
}

export interface ReportResponse {
  message: string;
}

export class ReportsService {
  private static instance: ReportsService;

  static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  async reportSmoke(smokeId: number, data: ReportSmokeData, token: string): Promise<ReportResponse> {
    const response = await fetch(`${config.apiUrl}/smokes/${smokeId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to report smoke: ${response.status}`);
    }

    return response.json();
  }
}
