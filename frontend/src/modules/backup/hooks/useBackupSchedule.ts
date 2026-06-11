import { useCallback, useEffect, useState } from 'react';
import { backupFactory } from '../application/factory.js';
import type { SaveScheduleInput } from '../domain/BackupRepository.js';
import type { BackupSchedule } from '../domain/BackupSchedule.js';

export function useBackupSchedule(serverId: string) {
  const [schedule, setSchedule] = useState<BackupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchSchedule = useCallback(async () => {
    if (!serverId) return;
    try {
      setSchedule(await backupFactory.getBackupSchedule(serverId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el plan');
    } finally {
      setLoading(false);
    }
  }, [serverId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const save = useCallback(
    async (input: SaveScheduleInput) => {
      setSaving(true);
      setError('');
      setMessage('');
      try {
        setSchedule(await backupFactory.saveBackupSchedule(serverId, input));
        setMessage('Plan de backups guardado.');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al guardar el plan',
        );
      } finally {
        setSaving(false);
      }
    },
    [serverId],
  );

  return { schedule, loading, saving, error, message, save };
}
