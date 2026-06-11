import { useCallback, useEffect, useState } from 'react';
import { backupFactory } from '../application/factory.js';
import type { Backup } from '../domain/Backup.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';

export function useBackups(serverId: string) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 'create' while creating, or the backup id while deleting/restoring it
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBackups = useCallback(async () => {
    if (!serverId) return;
    try {
      const result = await backupFactory.listBackups(serverId);
      setBackups(result.backups.toArray());
      setCloudEnabled(result.cloudEnabled);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar backups');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const create = useCallback(
    async (location: BackupLocationValue) => {
      setActionLoading('create');
      try {
        await backupFactory.createBackup(serverId, location);
        await fetchBackups();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear backup');
      } finally {
        setActionLoading(null);
      }
    },
    [serverId, fetchBackups],
  );

  const remove = useCallback(
    async (backupId: string) => {
      setActionLoading(backupId);
      try {
        await backupFactory.deleteBackup(serverId, backupId);
        await fetchBackups();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al borrar backup');
      } finally {
        setActionLoading(null);
      }
    },
    [serverId, fetchBackups],
  );

  const restore = useCallback(
    async (backupId: string) => {
      setActionLoading(backupId);
      try {
        await backupFactory.restoreBackup(serverId, backupId);
        setError('');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al restaurar backup',
        );
      } finally {
        setActionLoading(null);
      }
    },
    [serverId],
  );

  return {
    backups,
    cloudEnabled,
    loading,
    error,
    actionLoading,
    create,
    remove,
    restore,
    refetch: fetchBackups,
  };
}
