import { useState } from 'react';
import { RatingsService, RateSmokeData } from '@/lib/services/ratings.service';
import { useAuth } from '@/contexts/AuthContext';

export function useRatings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratingsService = RatingsService.getInstance();

  const rateSmoke = async (smokeId: number, data: RateSmokeData) => {
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await ratingsService.rateSmoke(smokeId, data, user.token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rate smoke';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upvoteSmoke = async (smokeId: number) => {
    return rateSmoke(smokeId, { value: 1 });
  };

  const downvoteSmoke = async (smokeId: number) => {
    return rateSmoke(smokeId, { value: -1 });
  };

  return { rateSmoke, upvoteSmoke, downvoteSmoke, loading, error };
}
