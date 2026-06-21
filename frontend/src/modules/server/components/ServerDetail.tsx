import {
  Boxes,
  Calendar,
  Cpu,
  MapPin,
  MemoryStick,
  Play,
  Plug,
  RotateCw,
  Square,
  Swords,
  Tag,
  Terminal,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../../../shared/components/ui/Button.js';
import { Card } from '../../../shared/components/ui/Card.js';
import { cn } from '../../../shared/lib/cn.js';
import type { Server } from '../domain/Server.js';
import { StatusBadge } from './StatusBadge.js';

type Action = 'start' | 'stop' | 'restart';

interface Props {
  server: Server;
  error: string;
  actionLoading: Action | 'delete' | null;
  coordinatesLoading: boolean;
  pvpLoading: boolean;
  onAction: (action: Action) => void;
  onToggleCoordinates: (enabled: boolean) => void;
  onTogglePvp: (enabled: boolean) => void;
  onRequestDelete: () => void;
}

export function ServerDetail({
  server,
  error,
  actionLoading,
  coordinatesLoading,
  pvpLoading,
  onAction,
  onToggleCoordinates,
  onTogglePvp,
  onRequestDelete,
}: Props) {
  const status = server.getStatus();
  const value = status.toPrimitive();
  const busy = actionLoading !== null;
  const isBedrock = server.isBedrock();
  const editionLabel = isBedrock ? 'Bedrock' : 'Java';
  const isRunning = value === 'running';

  return (
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

      {isBedrock && (
        <div className="mt-4 space-y-2">
          <GameRuleToggle
            icon={<MapPin className="h-4 w-4 text-zinc-400" />}
            label="Mostrar coordenadas"
            hint={
              isRunning
                ? 'Aplica el gamerule showcoordinates en el mundo.'
                : 'Inicia el servidor para cambiar esta opcion.'
            }
            checked={server.getShowCoordinates()}
            disabled={!isRunning || coordinatesLoading}
            onToggle={onToggleCoordinates}
          />
          <GameRuleToggle
            icon={<Swords className="h-4 w-4 text-zinc-400" />}
            label="PvP"
            hint={
              isRunning
                ? 'Aplica el gamerule pvp en el mundo.'
                : 'Inicia el servidor para cambiar esta opcion.'
            }
            checked={server.getPvp()}
            disabled={!isRunning || pvpLoading}
            onToggle={onTogglePvp}
          />
        </div>
      )}
    </Card>
  );
}

function GameRuleToggle({
  icon,
  label,
  hint,
  checked,
  disabled,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-zinc-200">
          {icon}
          {label}
        </span>
        <p className="mt-0.5 text-xs text-zinc-500">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onToggle(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-emerald-500' : 'bg-zinc-600',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
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
