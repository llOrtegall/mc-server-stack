/**
 * Packs and unpacks a server's data directory as a compressed archive.
 * Implemented in infrastructure (tar + filesystem); use cases depend only on
 * this port.
 */
export interface BackupArchiver {
  /** Archives the server data dir to a local temp file. */
  pack: (serverId: string) => Promise<{ path: string; sizeBytes: number }>;
  /** Wipes the server data dir and extracts the archive into it. */
  unpackInto: (serverId: string, archivePath: string) => Promise<void>;
  /** Removes a local temp archive. */
  discard: (path: string) => Promise<void>;
}
