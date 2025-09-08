import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { RateSmokeData, RatingsService } from '@/lib/services/ratings.service';
import { useEffect, useState } from 'react';

export function useRatings() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<number, 1 | -1>>({});

  const ratingsService = RatingsService.getInstance();

  // Load user ratings when component mounts or user changes
  useEffect(() => {
    const loadUserRatings = async () => {
      if (!isAuthenticated) {
        setUserVotes({});
        return;
      }

      const token = AuthService.getInstance().getToken();
      if (!token) return;

      try {
        const ratings = await ratingsService.getUserRatings(token);
        setUserVotes(ratings as Record<number, 1 | -1>);
      } catch (err) {
        console.error('Failed to load user ratings:', err);
      }
    };

    loadUserRatings();
  }, [isAuthenticated, ratingsService]);

  const rateSmoke = async (smokeId: number, data: RateSmokeData) => {
    const token = AuthService.getInstance().getToken();

    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await ratingsService.rateSmoke(smokeId, data, token);

      // Save user's vote
      setUserVotes(prev => ({
        ...prev,
        [smokeId]: data.value
      }));

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
    const currentVote = getUserVote(smokeId);

    // If already upvoted, remove the vote
    if (currentVote === 1) {
      return removeVote(smokeId);
    }

    // Otherwise, upvote
    return rateSmoke(smokeId, { value: 1 });
  };

  const downvoteSmoke = async (smokeId: number) => {
    const currentVote = getUserVote(smokeId);

    // If already downvoted, remove the vote
    if (currentVote === -1) {
      return removeVote(smokeId);
    }

    // Otherwise, downvote
    return rateSmoke(smokeId, { value: -1 });
  };

  const removeVote = async (smokeId: number) => {
    const token = AuthService.getInstance().getToken();

    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await ratingsService.removeRating(smokeId, token);

      // Remove user's vote from state
      setUserVotes(prev => {
        const newVotes = { ...prev };
        delete newVotes[smokeId];
        return newVotes;
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove vote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserVote = (smokeId: number): 1 | -1 | null => {
    return userVotes[smokeId] || null;
  };

  return { rateSmoke, upvoteSmoke, downvoteSmoke, removeVote, getUserVote, loading, error };
}
