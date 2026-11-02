import { useState, useEffect, useCallback, useRef } from 'react';
import { healthService } from '../services/healthService';
import { IHealthStatusData, IApiError } from '../types';

export interface IUseApiHealthResult {
  data: IHealthStatusData | null;
  loading: boolean;
  error: IApiError | Error | null;
  isHealthy: boolean;
  lastChecked: Date | null;
  refetch: () => Promise<void>;
}

export function useApiHealth(pollIntervalMs = 0): IUseApiHealthResult {
  const [data, setData] = useState<IHealthStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<IApiError | Error | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const isMounted = useRef<boolean>(true);

  const fetchHealth = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const res = await healthService.checkHealth();
      if (isMounted.current) {
        setData(res.data);
        setLastChecked(new Date());
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err as IApiError | Error);
        setData(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    const run = async () => {
      if (!cancelled) {
        await fetchHealth();
      }
    };
    run();

    let interval: ReturnType<typeof setInterval> | undefined;
    if (pollIntervalMs > 0) {
      interval = setInterval(fetchHealth, pollIntervalMs);
    }

    return () => {
      cancelled = true;
      isMounted.current = false;
      if (interval) clearInterval(interval);
    };
  }, [fetchHealth, pollIntervalMs]);

  const isHealthy = !loading && !error && data !== null;

  return {
    data,
    loading,
    error,
    isHealthy,
    lastChecked,
    refetch: fetchHealth
  };
}

export default useApiHealth;

