import { useCallback, useEffect, useState } from 'react';
import { serverFactory } from '../application/factory.js';
import type { Server } from '../domain/Server.js';

// Poll fast only while something is transitioning (starting/stopping); otherwise
// poll slowly just to catch out-of-band changes (e.g. the watchdog auto-stop).
const ACTIVE_POLL_MS = 3000;
const IDLE_POLL_MS = 15000;

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

  const hasTransition = servers.some((s) => s.getStatus().isTransitioning());

  useEffect(() => {
    fetchServers();
    const interval = setInterval(
      fetchServers,
      hasTransition ? ACTIVE_POLL_MS : IDLE_POLL_MS,
    );
    return () => clearInterval(interval);
  }, [fetchServers, hasTransition]);

  return { servers, loading, refetch: fetchServers };
}
