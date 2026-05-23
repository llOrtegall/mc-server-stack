import { useCallback, useEffect, useState } from 'react';
import { systemFactory } from '../application/factory.js';
import type { HostResources } from '../domain/HostResources.js';

export function useHostResources() {
  const [resources, setResources] = useState<HostResources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setResources(await systemFactory.getHostResources());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, loading, error, refetch: fetchResources };
}
