import { useState } from 'react';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.js';
import { BackupList } from '../components/BackupList.js';
import { useBackups } from '../hooks/useBackups.js';

interface PendingAction {
  type: 'restore' | 'delete';
  backupId: string;
}

const DIALOG = {
  restore: {
    title: 'Restaurar backup',
    message:
      'Se sobreescribira la data actual del servidor con este backup. Deten el servidor antes de restaurar.',
    confirmLabel: 'Restaurar',
  },
  delete: {
    title: 'Borrar backup',
    message: 'Se eliminara este backup permanentemente.',
    confirmLabel: 'Borrar',
  },
};

export function BackupsPanel({ serverId }: { serverId: string }) {
  const { backups, loading, error, actionLoading, create, remove, restore } =
    useBackups(serverId);
  const [pending, setPending] = useState<PendingAction | null>(null);

  async function handleConfirm() {
    if (!pending) return;
    const { type, backupId } = pending;
    setPending(null);
    if (type === 'restore') await restore(backupId);
    else await remove(backupId);
  }

  const dialog = pending ? DIALOG[pending.type] : DIALOG.delete;

  return (
    <section className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Backups</h2>
        <button
          type="button"
          onClick={create}
          disabled={actionLoading !== null}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {actionLoading === 'create' ? 'Creando...' : 'Crear backup'}
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Cargando backups...</p>
      ) : (
        <BackupList
          backups={backups}
          actionLoading={actionLoading}
          onRestore={(backupId) => setPending({ type: 'restore', backupId })}
          onDelete={(backupId) => setPending({ type: 'delete', backupId })}
        />
      )}

      <ConfirmDialog
        open={pending !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
        destructive={pending?.type === 'delete'}
      />
    </section>
  );
}
