import { Archive, CalendarClock, Plus } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog.js';
import { Button } from '../../../shared/components/ui/Button.js';
import { Card } from '../../../shared/components/ui/Card.js';
import { Select } from '../../../shared/components/ui/Field.js';
import { BackupList } from '../components/BackupList.js';
import { BackupScheduleForm } from '../components/BackupScheduleForm.js';
import {
  BACKUP_LOCATIONS,
  type BackupLocationValue,
  LOCATION_LABELS,
} from '../domain/BackupLocation.js';
import { useBackupSchedule } from '../hooks/useBackupSchedule.js';
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
  const {
    backups,
    cloudEnabled,
    loading,
    error,
    actionLoading,
    create,
    remove,
    restore,
  } = useBackups(serverId);
  const schedule = useBackupSchedule(serverId);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [createLocation, setCreateLocation] =
    useState<BackupLocationValue>('local');

  async function handleConfirm() {
    if (!pending) return;
    const { type, backupId } = pending;
    setPending(null);
    if (type === 'restore') await restore(backupId);
    else await remove(backupId);
  }

  const dialog = pending ? DIALOG[pending.type] : DIALOG.delete;
  const locations = BACKUP_LOCATIONS.filter(
    (l) => l === 'local' || cloudEnabled,
  );

  return (
    <>
      <Card className="mt-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Backups</h2>
          </div>
          <div className="flex items-center gap-2">
            {cloudEnabled && (
              <Select
                aria-label="Destino del backup"
                value={createLocation}
                onChange={(e) =>
                  setCreateLocation(e.target.value as BackupLocationValue)
                }
                className="h-8 w-auto py-0 text-xs"
              >
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {LOCATION_LABELS[l]}
                  </option>
                ))}
              </Select>
            )}
            <Button
              onClick={() => create(createLocation)}
              disabled={actionLoading !== null}
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {actionLoading === 'create' ? 'Creando...' : 'Crear backup'}
            </Button>
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Cargando backups...</p>
        ) : (
          <BackupList
            backups={backups}
            actionLoading={actionLoading}
            onRestore={(backupId) => setPending({ type: 'restore', backupId })}
            onDelete={(backupId) => setPending({ type: 'delete', backupId })}
          />
        )}
      </Card>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold text-white">Backups automáticos</h2>
        </div>
        {schedule.loading || schedule.schedule === null ? (
          <p className="text-sm text-zinc-500">Cargando plan...</p>
        ) : (
          <BackupScheduleForm
            schedule={schedule.schedule}
            cloudEnabled={cloudEnabled}
            saving={schedule.saving}
            error={schedule.error}
            message={schedule.message}
            onSave={schedule.save}
          />
        )}
      </Card>

      <ConfirmDialog
        open={pending !== null}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
        destructive={pending?.type === 'delete'}
      />
    </>
  );
}
