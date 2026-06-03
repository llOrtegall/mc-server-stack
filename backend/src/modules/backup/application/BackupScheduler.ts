import type { BackupArchiver } from '../domain/BackupArchiver.js';
import type { BackupRepository } from '../domain/BackupRepository.js';
import type { BackupScheduleRepository } from '../domain/BackupScheduleRepository.js';
import type { BackupStorageResolver } from '../domain/BackupStorageResolver.js';
import type { WorldFlusher } from '../domain/WorldFlusher.js';
import { createBackup } from './createBackup.js';
import { pruneAutoBackups } from './pruneAutoBackups.js';

const TICK_MS = 60_000;

interface BackupSchedulerDeps {
  backupScheduleRepository: BackupScheduleRepository;
  backupRepository: BackupRepository;
  backupStorages: BackupStorageResolver;
  backupArchiver: BackupArchiver;
  worldFlusher: WorldFlusher;
}

/**
 * Periodically runs due automatic backups and prunes old ones per retention.
 * Like the watchdog: a setInterval driving a public, testable `tick()`.
 */
export class BackupScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private busy = false;
  private readonly deps: BackupSchedulerDeps;

  constructor(deps: BackupSchedulerDeps) {
    this.deps = deps;
  }

  start(): void {
    if (this.timer !== null) return;
    this.timer = setInterval(() => {
      this.tick().catch((err) =>
        console.error('[backup-scheduler] tick error', err),
      );
    }, TICK_MS);
    console.log('[backup-scheduler] started — checking every 60s');
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async tick(now: number = Date.now()): Promise<void> {
    if (this.busy) return; // never overlap a long-running backup
    this.busy = true;
    try {
      const {
        backupScheduleRepository,
        backupRepository,
        backupStorages,
        backupArchiver,
        worldFlusher,
      } = this.deps;

      const schedules = await backupScheduleRepository.listEnabled();
      for (const schedule of schedules) {
        if (!schedule.isDue(now)) continue;

        const serverId = schedule.getServerId();
        const location = schedule.getLocation();
        try {
          await createBackup({
            backupRepository,
            backupStorages,
            backupArchiver,
            worldFlusher,
            serverId,
            location,
            auto: true,
          });
          await pruneAutoBackups({
            backupRepository,
            backupStorages,
            serverId,
            location,
            retention: schedule.getRetention(),
          });
          await backupScheduleRepository.upsert(
            schedule.withLastRun(new Date(now).toISOString()),
          );
        } catch (err) {
          console.error(
            `[backup-scheduler] backup failed for server ${serverId}`,
            err,
          );
        }
      }
    } finally {
      this.busy = false;
    }
  }
}
