import { useCallback, useEffect, useState } from 'react';
import { serverFactory } from '../application/factory.js';
import type { Server } from '../domain/Server.js';

const POLL_INTERVAL_MS = 5000;

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = useCallback(async () => {
    try {
      const list = await serverFactory.listServers();
      setServers(list.toArray());
    } catch {
      // silently ignore poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchServers]);

  return { servers, loading, refetch: fetchServers };
}
