import { useState, useEffect } from 'react';
import { SmokesService, Smoke, CreateSmokeData } from '@/lib/services/smokes.service';
import { useAuth } from '@/contexts/AuthContext';

export function useSmokes(mapId: number) {
  const [smokes, setSmokes] = useState<Smoke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const smokesService = SmokesService.getInstance();

  const fetchSmokes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await smokesService.getSmokesByMapId(mapId);
      setSmokes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch smokes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      fetchSmokes();
    }
  }, [mapId]);

  return { smokes, loading, error, refetch: fetchSmokes };
}

export function useSmokeActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const smokesService = SmokesService.getInstance();

  const createSmoke = async (data: CreateSmokeData) => {
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await smokesService.createSmoke(data, user.token);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create smoke';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSmoke = async (smokeId: number) => {
    if (!user?.token) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      await smokesService.deleteSmoke(smokeId, user.token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete smoke';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createSmoke, deleteSmoke, loading, error };
}
