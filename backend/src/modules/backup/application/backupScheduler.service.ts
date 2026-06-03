import { RconConsoleGateway } from '../../console/infrastructure/RconConsoleGateway.js';
import { PostgresServerRepository } from '../../server/infrastructure/PostgresServerRepository.js';
import { DefaultBackupStorageResolver } from '../infrastructure/DefaultBackupStorageResolver.js';
import { PostgresBackupRepository } from '../infrastructure/PostgresBackupRepository.js';
import { PostgresBackupScheduleRepository } from '../infrastructure/PostgresBackupScheduleRepository.js';
import { RconWorldFlusher } from '../infrastructure/RconWorldFlusher.js';
import { TarBackupArchiver } from '../infrastructure/TarBackupArchiver.js';
import { BackupScheduler } from './BackupScheduler.js';

const scheduler = new BackupScheduler({
  backupScheduleRepository: new PostgresBackupScheduleRepository(),
  backupRepository: new PostgresBackupRepository(),
  backupStorages: new DefaultBackupStorageResolver(),
  backupArchiver: new TarBackupArchiver(),
  worldFlusher: new RconWorldFlusher(
    new PostgresServerRepository(),
    new RconConsoleGateway(),
  ),
});

export function startBackupScheduler(): void {
  scheduler.start();
}
