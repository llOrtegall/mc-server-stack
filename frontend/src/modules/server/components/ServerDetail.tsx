import { Link } from 'react-router';
import type { Server } from '../domain/Server.js';
import { StatusBadge } from './StatusBadge.js';

type Action = 'start' | 'stop' | 'restart';

interface Props {
  server: Server;
  error: string;
  actionLoading: Action | 'delete' | null;
  onAction: (action: Action) => void;
  onRequestDelete: () => void;
}

export function ServerDetail({
  server,
  error,
  actionLoading,
  onAction,
  onRequestDelete,
}: Props) {
  const status = server.getStatus();
  const value = status.toPrimitive();
  const busy = actionLoading !== null;

  return (
    <div>
      <Link
        to="/"
        className="text-sm text-gray-400 hover:text-gray-300 mb-4 inline-block"
      >
        &larr; Volver
      </Link>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {server.getName()}
            </h1>
            <p className="text-sm text-gray-400 mt-1">ID: {server.getId()}</p>
          </div>
          <StatusBadge status={value} />
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <InfoItem label="Version" value={server.getVersion()} />
          <InfoItem label="Puerto" value={String(server.getPort())} />
          <InfoItem label="Puerto RCON" value={String(server.getRconPort())} />
          <InfoItem label="RAM" value={`${server.getRamMb()} MB`} />
          <InfoItem label="CPU Limit" value={String(server.getCpuLimit())} />
          <InfoItem
            label="Creado"
            value={new Date(server.getCreatedAt()).toLocaleDateString()}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onAction('start')}
            disabled={busy || !status.canStart()}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'start' || value === 'starting'
              ? 'Iniciando...'
              : 'Iniciar'}
          </button>
          <button
            type="button"
            onClick={() => onAction('stop')}
            disabled={busy || !status.canStopOrRestart()}
            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'stop' || value === 'stopping'
              ? 'Deteniendo...'
              : 'Detener'}
          </button>
          <button
            type="button"
            onClick={() => onAction('restart')}
            disabled={busy || !status.canStopOrRestart()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {actionLoading === 'restart' ? 'Reiniciando...' : 'Reiniciar'}
          </button>
          <button
            type="button"
            onClick={onRequestDelete}
            disabled={busy}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
          >
            {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      <p className="text-sm text-gray-300">{value}</p>
    </div>
  );
}
