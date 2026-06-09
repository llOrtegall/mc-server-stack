export const BACKUP_LOCATIONS = ['local', 's3'] as const;
export type BackupLocationValue = (typeof BACKUP_LOCATIONS)[number];

export const LOCATION_LABELS: Record<BackupLocationValue, string> = {
  local: 'Local',
  s3: 'Nube',
};
