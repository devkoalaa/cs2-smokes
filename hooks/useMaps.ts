import { useState, useEffect } from 'react';
import { MapsService, Map } from '@/lib/services/maps.service';

export function useMaps() {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapsService = MapsService.getInstance();

  const fetchMaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mapsService.getAllMaps();
      setMaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch maps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return { maps, loading, error, refetch: fetchMaps };
}

export function useMap(id: number) {
  const [map, setMap] = useState<Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapsService = MapsService.getInstance();

  const fetchMap = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mapsService.getMapById(id);
      setMap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch map');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMap();
    }
  }, [id]);

  return { map, loading, error, refetch: fetchMap };
}
