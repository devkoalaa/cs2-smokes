import { useState } from 'react';
import { ReportsService, ReportSmokeData } from '@/lib/services/reports.service';
import { useAuth } from '@/contexts/AuthContext';

export function useReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportsService = ReportsService.getInstance();

  const reportSmoke = async (smokeId: number, data: ReportSmokeData) => {
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await reportsService.reportSmoke(smokeId, data, user.token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report smoke';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reportSmoke, loading, error };
}
