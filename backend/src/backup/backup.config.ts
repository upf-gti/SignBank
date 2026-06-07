export interface BackupConfig {
  backupSchedule: string;
  cleanupSchedule: string;
  retentionDays: number;
  enabled: boolean;
  maxBackupSize: number;
  enableNotifications: boolean;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
}

export const getBackupConfig = (): BackupConfig => {
  return {
    backupSchedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    cleanupSchedule: process.env.BACKUP_CLEANUP_SCHEDULE || '0 3 * * 0',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10),
    enabled: process.env.BACKUP_ENABLED === 'true',
    maxBackupSize: parseInt(process.env.BACKUP_MAX_SIZE_MB || '1024', 10),
    enableNotifications: process.env.BACKUP_NOTIFICATIONS !== 'false',
    notifyOnSuccess: process.env.BACKUP_NOTIFY_SUCCESS !== 'false',
    notifyOnFailure: process.env.BACKUP_NOTIFY_FAILURE !== 'false',
  };
};
