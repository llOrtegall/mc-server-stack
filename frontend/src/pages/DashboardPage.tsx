import { useCallback, useEffect, useState } from 'react';
import * as serversApi from '../api/servers';
import { CreateServerModal } from '../components/CreateServerModal';
import { ServerCard } from '../components/ServerCard';
import type { Server } from '../types';

export function DashboardPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchServers = useCallback(async () => {
    try {
      const data = await serversApi.listServers();
      setServers(data);
    } catch {
      // silently fail on poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, [fetchServers]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Servidores</h1>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Nuevo servidor
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-gray-800"
            />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">
            No hay servidores. Crea uno para empezar.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-green-400 hover:text-green-300 underline"
          >
            Crear servidor
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}

      <CreateServerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          fetchServers();
        }}
      />
    </div>
  );
}
