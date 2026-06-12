import {
  Clock,
  Cloud,
  Database,
  HardDrive,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.js';
import type { Backup } from '../domain/Backup.js';
import { LOCATION_LABELS } from '../domain/BackupLocation.js';

interface Props {
  backups: Backup[];
  actionLoading: string | null;
  onRestore: (backupId: string) => void;
  onDelete: (backupId: string) => void;
}

function formatBytes(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

function formatDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : '—';
}

export function BackupList({
  backups,
  actionLoading,
  onRestore,
  onDelete,
}: Props) {
  if (backups.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-white/10 bg-zinc-950/30 px-4 py-6 text-center text-sm text-zinc-500">
        No hay backups todavia.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {backups.map((backup) => {
        const id = backup.getId();
        const busy = actionLoading === id;
        return (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Database className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm text-zinc-200">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {formatDate(backup.getCreatedAt())}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    {backup.getLocation() === 's3' ? (
                      <Cloud className="h-3 w-3" />
                    ) : (
                      <HardDrive className="h-3 w-3" />
                    )}
                    {LOCATION_LABELS[backup.getLocation()]}
                  </span>
                  <span>·</span>
                  <span>{formatBytes(backup.getSizeBytes())}</span>
                  {backup.isAuto() && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium uppercase text-emerald-400">
                      auto
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="info"
                size="sm"
                onClick={() => onRestore(id)}
                disabled={actionLoading !== null}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {busy ? '...' : 'Restaurar'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(id)}
                disabled={actionLoading !== null}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {busy ? '...' : 'Borrar'}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
