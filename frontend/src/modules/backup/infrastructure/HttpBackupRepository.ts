import { apiFetch } from '../../../api/client.js';
import { Backup, type BackupPrimitives } from '../domain/Backup.js';
import { BackupList } from '../domain/BackupList.js';
import type { BackupRepository } from '../domain/BackupRepository.js';

export class HttpBackupRepository implements BackupRepository {
  async listByServer(serverId: string): Promise<BackupList> {
    const data = await apiFetch<BackupPrimitives[]>(
      `/api/servers/${serverId}/backups`,
    );
    return BackupList.fromPrimitive(data);
  }

  async create(serverId: string): Promise<Backup> {
    const data = await apiFetch<BackupPrimitives>(
      `/api/servers/${serverId}/backups`,
      { method: 'POST' },
    );
    return Backup.fromPrimitive(data);
  }

  async delete(serverId: string, backupId: string): Promise<boolean> {
    await apiFetch<void>(`/api/servers/${serverId}/backups/${backupId}`, {
      method: 'DELETE',
    });
    return true;
  }

  async restore(serverId: string, backupId: string): Promise<void> {
    await apiFetch<void>(
      `/api/servers/${serverId}/backups/${backupId}/restore`,
      { method: 'POST' },
    );
  }
}
