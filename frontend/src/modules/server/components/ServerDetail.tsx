import {
  Boxes,
  Calendar,
  ChevronLeft,
  Cpu,
  MemoryStick,
  Play,
  Plug,
  RotateCw,
  Square,
  Tag,
  Terminal,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '../../../shared/components/ui/Button.js';
import { Card } from '../../../shared/components/ui/Card.js';
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
  const isBedrock = server.isBedrock();
  const editionLabel = isBedrock ? 'Bedrock' : 'Java';

  return (
    <div>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver
      </Link>

      <Card className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-white">
              {server.getName()}
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              ID: {server.getId()}
            </p>
          </div>
          <StatusBadge status={value} />
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:grid-cols-3">
          <Info icon={<Tag />} label="Version" value={server.getVersion()} />
          <Info icon={<Boxes />} label="Edición" value={editionLabel} />
          <Info
            icon={<Plug />}
            label={isBedrock ? 'Puerto (UDP)' : 'Puerto'}
            value={String(server.getPort())}
          />
          {!isBedrock && (
            <Info
              icon={<Terminal />}
              label="Puerto RCON"
              value={String(server.getRconPort())}
            />
          )}
          <Info
            icon={<MemoryStick />}
            label="RAM"
            value={`${server.getRamMb()} MB`}
          />
          <Info
            icon={<Cpu />}
            label="CPU Limit"
            value={String(server.getCpuLimit())}
          />
          <Info
            icon={<Calendar />}
            label="Creado"
            value={new Date(server.getCreatedAt()).toLocaleDateString()}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => onAction('start')}
            disabled={busy || !status.canStart()}
          >
            <Play className="h-4 w-4" />
            {actionLoading === 'start' || value === 'starting'
              ? 'Iniciando...'
              : 'Iniciar'}
          </Button>
          <Button
            variant="warning"
            onClick={() => onAction('stop')}
            disabled={busy || !status.canStopOrRestart()}
          >
            <Square className="h-4 w-4" />
            {actionLoading === 'stop' || value === 'stopping'
              ? 'Deteniendo...'
              : 'Detener'}
          </Button>
          <Button
            variant="info"
            onClick={() => onAction('restart')}
            disabled={busy || !status.canStopOrRestart()}
          >
            <RotateCw className="h-4 w-4" />
            {actionLoading === 'restart' ? 'Reiniciando...' : 'Reiniciar'}
          </Button>
          <Button
            variant="danger"
            onClick={onRequestDelete}
            disabled={busy}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4" />
            {actionLoading === 'delete' ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900/40 px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
        <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        {label}
      </span>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}
