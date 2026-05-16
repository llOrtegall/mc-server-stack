import type { Backup } from '../domain/Backup.js';

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
    return <p className="text-sm text-gray-500">No hay backups todavia.</p>;
  }

  return (
    <ul className="divide-y divide-gray-700">
      {backups.map((backup) => {
        const id = backup.getId();
        const busy = actionLoading === id;
        return (
          <li key={id} className="flex items-center justify-between py-3 gap-3">
            <div className="min-w-0">
              <p className="text-sm text-gray-200">
                {formatDate(backup.getCreatedAt())}
              </p>
              <p className="text-xs text-gray-500">
                {formatBytes(backup.getSizeBytes())}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onRestore(id)}
                disabled={actionLoading !== null}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? '...' : 'Restaurar'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(id)}
                disabled={actionLoading !== null}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {busy ? '...' : 'Borrar'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
