/**
 * Remote object storage for backup archives (R2/S3). Implemented in
 * infrastructure; use cases depend only on this port.
 */
export interface BackupStorage {
  upload: (key: string, filePath: string, sizeBytes: number) => Promise<void>;
  /** Downloads the object to a local temp file and returns its path. */
  download: (key: string) => Promise<string>;
  delete: (key: string) => Promise<void>;
}
