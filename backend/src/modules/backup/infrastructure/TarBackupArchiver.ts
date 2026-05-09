import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from '../../../config.js';
import type { BackupArchiver } from '../domain/BackupArchiver.js';

export class TarBackupArchiver implements BackupArchiver {
  async pack(serverId: string): Promise<{ path: string; sizeBytes: number }> {
    const path = join('/tmp', `backup-${serverId}-${Date.now()}.tar.gz`);
    const proc = Bun.spawn(
      ['tar', '-czf', path, '-C', config.mcDataPath, serverId],
      { stderr: 'pipe' },
    );
    await proc.exited;
    if (proc.exitCode !== 0) {
      throw new Error('[TarBackupArchiver] Failed to create tar archive');
    }
    const fileStat = await stat(path);
    return { path, sizeBytes: fileStat.size };
  }

  async unpackInto(serverId: string, archivePath: string): Promise<void> {
    const serverPath = join(config.mcDataPath, serverId);
    await rm(serverPath, { recursive: true, force: true });
    await mkdir(serverPath, { recursive: true });

    const proc = Bun.spawn(
      ['tar', '-xzf', archivePath, '--strip-components=1', '-C', serverPath],
      { stderr: 'pipe' },
    );
    await proc.exited;
    if (proc.exitCode !== 0) {
      throw new Error('[TarBackupArchiver] Failed to extract backup');
    }
  }

  async discard(path: string): Promise<void> {
    await rm(path, { force: true });
  }
}
