import { useCallback, useEffect, useRef, useState } from 'react';
import { serverFactory } from '../application/factory.js';
import type { Server } from '../domain/Server.js';

const POLL_INTERVAL_MS = 3000;

export type ServerAction = 'start' | 'stop' | 'restart';

export function useServer(id: string) {
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<
    ServerAction | 'delete' | null
  >(null);

  // Mirrors `server` without being a dependency of fetchServer — keeping `server`
  // in the deps made fetchServer change on every fetch, which re-fired the mount
  // effect and caused an infinite refetch loop.
  const serverRef = useRef<Server | null>(null);

  const fetchServer = useCallback(async () => {
    if (!id) return;
    try {
      const next = await serverFactory.getServer(id);
      serverRef.current = next;
      setServer(next);
      setError('');
    } catch (err) {
      if (!serverRef.current) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar servidor',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Reset and load whenever the id changes (fetchServer is stable per id).
  useEffect(() => {
    serverRef.current = null;
    setServer(null);
    setLoading(true);
    setError('');
    fetchServer();
  }, [fetchServer]);

  // Poll while the server is in a transitional state.
  useEffect(() => {
    if (!server?.getStatus().isTransitioning()) return;
    const interval = setInterval(fetchServer, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [server, fetchServer]);

  const runAction = useCallback(
    async (action: ServerAction) => {
      if (!id) return;
      setActionLoading(action);
      try {
        if (action === 'start') await serverFactory.startServer(id);
        else if (action === 'stop') await serverFactory.stopServer(id);
        else await serverFactory.restartServer(id);
        await fetchServer();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error en accion');
      } finally {
        setActionLoading(null);
      }
    },
    [id, fetchServer],
  );

  const removeServer = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    setActionLoading('delete');
    try {
      await serverFactory.deleteServer(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setActionLoading(null);
      return false;
    }
  }, [id]);

  return {
    server,
    loading,
    error,
    actionLoading,
    runAction,
    removeServer,
    refresh: fetchServer,
  };
}
