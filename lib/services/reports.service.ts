import { config } from '@/lib/config';

export interface ReportSmokeData {
  reason: string;
}

export interface ReportResponse {
  message: string;
}

export interface ReportStatusResponse {
  hasReported: boolean;
}

export interface BatchReportStatusResponse {
  smokeId: number;
  hasReported: boolean;
}

export class ReportsService {
  private static instance: ReportsService;

  static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  async getReportStatus(smokeId: number, token: string): Promise<ReportStatusResponse> {
    const response = await fetch(`${config.apiUrl}/smokes/${smokeId}/report/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get report status: ${response.status}`);
    }

    return response.json();
  }

  async getReportsStatusBatch(smokeIds: number[], token: string): Promise<BatchReportStatusResponse[]> {
    const response = await fetch(`${config.apiUrl}/reports/status/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ smokeIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get batch report status: ${response.status}`);
    }

    return response.json();
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
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Failed to report smoke: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  }
}
