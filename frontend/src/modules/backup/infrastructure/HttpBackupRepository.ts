import { apiFetch } from '../../../api/client.js';
import { Backup, type BackupPrimitives } from '../domain/Backup.js';
import { BackupList } from '../domain/BackupList.js';
import type { BackupLocationValue } from '../domain/BackupLocation.js';
import type {
  BackupListResult,
  BackupRepository,
  SaveScheduleInput,
} from '../domain/BackupRepository.js';
import {
  BackupSchedule,
  type BackupSchedulePrimitives,
} from '../domain/BackupSchedule.js';

export class HttpBackupRepository implements BackupRepository {
  async listByServer(serverId: string): Promise<BackupListResult> {
    const data = await apiFetch<{
      backups: BackupPrimitives[];
      cloudEnabled: boolean;
    }>(`/api/servers/${serverId}/backups`);
    return {
      backups: BackupList.fromPrimitive(data.backups),
      cloudEnabled: data.cloudEnabled,
    };
  }

  async create(
    serverId: string,
    location: BackupLocationValue,
  ): Promise<Backup> {
    const data = await apiFetch<BackupPrimitives>(
      `/api/servers/${serverId}/backups`,
      { method: 'POST', body: JSON.stringify({ location }) },
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

  async getSchedule(serverId: string): Promise<BackupSchedule> {
    const data = await apiFetch<BackupSchedulePrimitives>(
      `/api/servers/${serverId}/backups/schedule`,
    );
    return BackupSchedule.fromPrimitive(data);
  }

  async saveSchedule(
    serverId: string,
    input: SaveScheduleInput,
  ): Promise<BackupSchedule> {
    const data = await apiFetch<BackupSchedulePrimitives>(
      `/api/servers/${serverId}/backups/schedule`,
      { method: 'PUT', body: JSON.stringify(input) },
    );
    return BackupSchedule.fromPrimitive(data);
  }
}
