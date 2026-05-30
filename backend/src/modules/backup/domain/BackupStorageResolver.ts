import type { BackupLocationValue } from './BackupLocation.js';
import type { BackupStorage } from './BackupStorage.js';

/**
 * Resolves the concrete storage backend for a given location. Implemented in
 * infrastructure (local volume is always available; remote only when configured).
 */
export interface BackupStorageResolver {
  /** Returns the storage for a location, or throws if it is not available. */
  for: (location: BackupLocationValue) => BackupStorage;
  isAvailable: (location: BackupLocationValue) => boolean;
}
