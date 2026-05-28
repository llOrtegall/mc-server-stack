import { Plus, Server as ServerIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { HostCapacityCard } from '../../system/components/HostCapacityCard.js';
import { useHostResources } from '../../system/hooks/useHostResources.js';
import { serverFactory } from '../application/factory.js';
import { CreateServerModal } from '../components/CreateServerModal.js';
import { ServerCard } from '../components/ServerCard.js';
import type { CreateServerInput } from '../domain/CreateServerInput.js';
import { useServers } from '../hooks/useServers.js';

export function ServerDashboard() {
  const { servers, loading, refetch } = useServers();
  const { resources: hostResources } = useHostResources();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleCreate(input: CreateServerInput) {
    await serverFactory.createServer(input);
    setModalOpen(false);
    refetch();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Servidores
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {servers.length} {servers.length === 1 ? 'servidor' : 'servidores'}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo servidor
        </Button>
      </div>

      {hostResources && (
        <div className="mb-6">
          <HostCapacityCard resources={hostResources} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-white/5 bg-zinc-900/40"
            />
          ))}
        </div>
      ) : servers.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-zinc-900/30 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500">
            <ServerIcon className="h-7 w-7" />
          </span>
          <p className="mb-4 text-zinc-400">
            No hay servidores. Crea uno para empezar.
          </p>
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Crear servidor
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.getId()} server={server} />
          ))}
        </div>
      )}

      <CreateServerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        hostResources={hostResources}
      />
    </div>
  );
}
